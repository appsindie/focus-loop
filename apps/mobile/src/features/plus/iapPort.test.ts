import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import {
  finishTransaction,
  getAvailablePurchases,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
} from "expo-iap";
import { createExpoIapStore } from "./iapPort";
import { PLUS_PRODUCT_IDS } from "./plusProducts";

// expo-iap is stubbed in jest-setup; per-test we re-implement the listener
// factories to capture the callbacks the port registers.
const updatedListener = jest.mocked(purchaseUpdatedListener);
const errorListener = jest.mocked(purchaseErrorListener);
const finish = jest.mocked(finishTransaction);
const request = jest.mocked(requestPurchase);
const available = jest.mocked(getAvailablePurchases);

type UpdateCallback = Parameters<typeof purchaseUpdatedListener>[0];
type Purchase = Parameters<UpdateCallback>[0];
type ListenerReturn = ReturnType<typeof purchaseUpdatedListener>;

function sub(): ListenerReturn {
  return { remove: jest.fn() };
}

function makePurchase(overrides: Partial<Purchase> = {}): Purchase {
  return {
    productId: PLUS_PRODUCT_IDS.yearly,
    currentPlanId: PLUS_PRODUCT_IDS.yearly,
    purchaseState: "purchased",
    transactionDate: 1_700_000_000_000,
    ...overrides,
  } as Purchase;
}

async function beginPurchase(store = createExpoIapStore()) {
  let update: UpdateCallback | null = null;
  updatedListener.mockImplementation((cb) => {
    update = cb;
    return sub();
  });
  errorListener.mockImplementation(() => sub());
  const promise = store.purchase("yearly");
  // Let ensureConnection resolve so the listeners attach.
  await Promise.resolve();
  await Promise.resolve();
  return { promise, fire: (p: Purchase) => update?.(p) };
}

beforeEach(() => {
  updatedListener.mockReset();
  errorListener.mockReset();
  finish.mockReset().mockResolvedValue(undefined);
  request.mockReset().mockResolvedValue(null);
  available.mockReset().mockResolvedValue([]);
});

describe("iapPort purchase states (CR-28)", () => {
  it("grants only when the store reports 'purchased' and finishTransaction settles", async () => {
    const { promise, fire } = await beginPurchase();
    fire(makePurchase());
    await expect(promise).resolves.toMatchObject({ kind: "purchased" });
    expect(finish).toHaveBeenCalledTimes(1);
  });

  it("reports 'pending' without finishing when payment is settling (Ask to Buy / Play pending)", async () => {
    const { promise, fire } = await beginPurchase();
    fire(makePurchase({ purchaseState: "pending" }));
    await expect(promise).resolves.toEqual({ kind: "pending" });
    expect(finish).not.toHaveBeenCalled();
  });

  it("reports 'failed' on a non-owned state", async () => {
    const { promise, fire } = await beginPurchase();
    fire(makePurchase({ purchaseState: "unknown" }));
    await expect(promise).resolves.toEqual({ kind: "failed" });
    expect(finish).not.toHaveBeenCalled();
  });

  it("reports 'failed' when finishTransaction rejects — the store would auto-refund it", async () => {
    finish.mockRejectedValueOnce(new Error("ack failed"));
    const { promise, fire } = await beginPurchase();
    fire(makePurchase());
    await expect(promise).resolves.toEqual({ kind: "failed" });
  });

  it("fails the flow when no listener settles inside the timeout", async () => {
    const { promise } = await beginPurchase();
    jest.advanceTimersByTime(60_000);
    await expect(promise).resolves.toEqual({ kind: "failed" });
  });

  it("ignores updates for other products", async () => {
    const { promise, fire } = await beginPurchase();
    fire(makePurchase({ productId: "other.product", currentPlanId: "other.product" }));
    fire(makePurchase());
    await expect(promise).resolves.toMatchObject({ kind: "purchased" });
  });
});

describe("iapPort restore ownership bar (CR-28)", () => {
  it("drops pending rows from the receipt", async () => {
    available.mockResolvedValueOnce([
      makePurchase({ productId: PLUS_PRODUCT_IDS.lifetime, purchaseState: "pending" }),
      makePurchase(),
    ]);
    const purchases = await createExpoIapStore().restorePurchases();
    expect(purchases).toHaveLength(1);
    expect(purchases[0]?.productId).toBe(PLUS_PRODUCT_IDS.yearly);
  });
});
