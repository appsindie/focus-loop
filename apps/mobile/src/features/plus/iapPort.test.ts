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

// expo-iap is stubbed in jest-setup; the port registers ONE app-lifetime
// listener pair on first connection (CR-30), so we capture the registered
// callbacks here and fire store events through them.
const updatedListener = jest.mocked(purchaseUpdatedListener);
const errorListener = jest.mocked(purchaseErrorListener);
const finish = jest.mocked(finishTransaction);
const request = jest.mocked(requestPurchase);
const available = jest.mocked(getAvailablePurchases);

type UpdateCallback = Parameters<typeof purchaseUpdatedListener>[0];
type Purchase = Parameters<UpdateCallback>[0];

let updateCb: UpdateCallback | null = null;
updatedListener.mockImplementation((cb) => {
  updateCb = cb;
  return { remove: jest.fn() };
});
errorListener.mockImplementation(() => ({ remove: jest.fn() }));

function makePurchase(overrides: Partial<Purchase> = {}): Purchase {
  return {
    id: "tx-1",
    productId: PLUS_PRODUCT_IDS.yearly,
    currentPlanId: PLUS_PRODUCT_IDS.yearly,
    purchaseState: "purchased",
    transactionDate: 1_700_000_000_000,
    ...overrides,
  } as Purchase;
}

async function beginPurchase(store = createExpoIapStore()) {
  const promise = store.purchase("yearly");
  // Let ensureConnection resolve so activeBuy is set.
  await Promise.resolve();
  await Promise.resolve();
  return { promise, fire: (p: Purchase) => updateCb?.(p) };
}

beforeEach(() => {
  finish.mockReset().mockResolvedValue(undefined);
  request.mockReset().mockResolvedValue(null);
  available.mockReset().mockResolvedValue([]);
});

describe("iapPort purchase states (CR-28)", () => {
  it("grants only when the store reports 'purchased' and the ack settles", async () => {
    const { promise, fire } = await beginPurchase();
    fire(makePurchase({ id: "tx-grant" }));
    await expect(promise).resolves.toMatchObject({ kind: "purchased" });
    expect(finish).toHaveBeenCalledTimes(1);
  });

  it("reports 'pending' without finishing when payment is settling (Ask to Buy / Play pending)", async () => {
    const { promise, fire } = await beginPurchase();
    fire(makePurchase({ id: "tx-pending", purchaseState: "pending" }));
    await expect(promise).resolves.toEqual({ kind: "pending" });
    expect(finish).not.toHaveBeenCalled();
  });

  it("reports 'failed' on a non-owned state", async () => {
    const { promise, fire } = await beginPurchase();
    fire(makePurchase({ id: "tx-unknown", purchaseState: "unknown" }));
    await expect(promise).resolves.toEqual({ kind: "failed" });
    expect(finish).not.toHaveBeenCalled();
  });

  it("reports 'failed' when finishTransaction rejects — the store would auto-refund it", async () => {
    finish.mockRejectedValueOnce(new Error("ack failed"));
    const { promise, fire } = await beginPurchase();
    fire(makePurchase({ id: "tx-finish-fail" }));
    await expect(promise).resolves.toEqual({ kind: "failed" });
  });

  it("reports 'pending' — not 'failed' — when no event settles inside the timeout (CR-30)", async () => {
    const { promise } = await beginPurchase();
    jest.advanceTimersByTime(60_000);
    await expect(promise).resolves.toEqual({ kind: "pending" });
  });

  it("ignores updates for other products", async () => {
    const { promise, fire } = await beginPurchase();
    fire(
      makePurchase({ id: "tx-other", productId: "other.product", currentPlanId: "other.product" }),
    );
    fire(makePurchase({ id: "tx-own" }));
    await expect(promise).resolves.toMatchObject({ kind: "purchased" });
  });
});

describe("iapPort app-lifetime acknowledgement (CR-30)", () => {
  it("finishes a purchase that arrives AFTER the buy flow settled", async () => {
    const { promise, fire } = await beginPurchase();
    jest.advanceTimersByTime(60_000);
    await expect(promise).resolves.toEqual({ kind: "pending" });
    finish.mockClear();
    // The payment completes after the flow timed out — the global listener
    // still owes the store an ack so Play does not auto-refund it.
    fire(makePurchase({ id: "tx-late" }));
    await Promise.resolve();
    expect(finish).toHaveBeenCalledTimes(1);
  });

  it("dedupes finish calls when the buy flow and the listener see the same update", async () => {
    const { promise, fire } = await beginPurchase();
    fire(makePurchase({ id: "tx-shared" }));
    await expect(promise).resolves.toMatchObject({ kind: "purchased" });
    expect(finish).toHaveBeenCalledTimes(1);
  });
});

describe("iapPort restore ownership bar (CR-28/CR-30)", () => {
  it("drops pending rows from the receipt", async () => {
    available.mockResolvedValueOnce([
      makePurchase({ id: "tx-p", productId: PLUS_PRODUCT_IDS.lifetime, purchaseState: "pending" }),
      makePurchase({ id: "tx-y" }),
    ]);
    const purchases = await createExpoIapStore().restorePurchases();
    expect(purchases).toHaveLength(1);
    expect(purchases[0]?.productId).toBe(PLUS_PRODUCT_IDS.yearly);
  });

  it("acknowledges purchased rows found in the receipt", async () => {
    available.mockResolvedValueOnce([makePurchase({ id: "tx-restore" })]);
    await createExpoIapStore().restorePurchases();
    expect(finish).toHaveBeenCalledTimes(1);
  });
});
