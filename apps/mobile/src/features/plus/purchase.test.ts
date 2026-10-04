import AsyncStorage from "@react-native-async-storage/async-storage";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { loadEntitlement } from "../loop/entitlement";
import { buyPlus, restorePlus, verifyPlusWithStore } from "./purchase";
import type { PlusStore, StorePurchase } from "./iapPort";
import { PLUS_PRODUCT_IDS } from "./plusProducts";

function fakeStore(overrides: Partial<PlusStore> = {}): PlusStore {
  return {
    loadProducts: () => Promise.resolve([]),
    purchase: () => Promise.resolve({ kind: "failed" }),
    restorePurchases: () => Promise.resolve([]),
    ...overrides,
  };
}

const NOW = new Date("2026-10-03T10:00:00Z");

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe("buyPlus (J7)", () => {
  it("grants Plus locally when the store purchase settles (J7-R3/R5)", async () => {
    const store = fakeStore({
      purchase: () =>
        Promise.resolve({
          kind: "purchased",
          purchase: {
            productId: PLUS_PRODUCT_IDS.yearly,
            plusExpiresAt: "2026-10-10T10:00:00.000Z",
          },
        }),
    });
    await expect(buyPlus("yearly", store, NOW)).resolves.toBe("purchased");
    const entitlement = await loadEntitlement();
    expect(entitlement.isPlus).toBe(true);
    expect(entitlement.productId).toBe(PLUS_PRODUCT_IDS.yearly);
    expect(entitlement.plusExpiresAt).toBe("2026-10-10T10:00:00.000Z");
    expect(entitlement.lastVerifiedAt).toBe(NOW.toISOString());
  });

  it("reports 'pending' without granting when payment is still settling (CR-28)", async () => {
    const store = fakeStore({ purchase: () => Promise.resolve({ kind: "pending" }) });
    await expect(buyPlus("yearly", store, NOW)).resolves.toBe("pending");
    expect((await loadEntitlement()).isPlus).toBe(false);
  });

  it("leaves entitlement untouched when the user cancels", async () => {
    const store = fakeStore({ purchase: () => Promise.resolve({ kind: "cancelled" }) });
    await expect(buyPlus("lifetime", store, NOW)).resolves.toBe("cancelled");
    expect((await loadEntitlement()).isPlus).toBe(false);
  });

  it("maps store errors to 'failed' without granting anything", async () => {
    const store = fakeStore({
      purchase: () => Promise.reject(new Error("native module missing")),
    });
    await expect(buyPlus("yearly", store, NOW)).resolves.toBe("failed");
    expect((await loadEntitlement()).isPlus).toBe(false);
  });
});

describe("restorePlus (J7-R4)", () => {
  it("re-grants Plus from the store receipt, lifetime outranking yearly", async () => {
    const purchases: StorePurchase[] = [
      { productId: PLUS_PRODUCT_IDS.yearly, plusExpiresAt: "2026-10-10T10:00:00.000Z" },
      { productId: PLUS_PRODUCT_IDS.lifetime, plusExpiresAt: null },
    ];
    const store = fakeStore({ restorePurchases: () => Promise.resolve(purchases) });
    await expect(restorePlus(store, NOW)).resolves.toBe("restored");
    const entitlement = await loadEntitlement();
    expect(entitlement.isPlus).toBe(true);
    expect(entitlement.productId).toBe(PLUS_PRODUCT_IDS.lifetime);
    expect(entitlement.plusExpiresAt).toBeNull();
  });

  it("returns 'none' when the receipt carries no Plus products", async () => {
    const store = fakeStore({ restorePurchases: () => Promise.resolve([]) });
    await expect(restorePlus(store, NOW)).resolves.toBe("none");
    expect((await loadEntitlement()).isPlus).toBe(false);
  });

  it("returns 'failed' when the store cannot be reached", async () => {
    const store = fakeStore({
      restorePurchases: () => Promise.reject(new Error("offline")),
    });
    await expect(restorePlus(store, NOW)).resolves.toBe("failed");
  });
});

describe("verifyPlusWithStore (ADR-003 re-check)", () => {
  it("revokes Plus when the receipt no longer carries a product", async () => {
    const store = fakeStore({ restorePurchases: () => Promise.resolve([]) });
    const granted = fakeStore({
      restorePurchases: () =>
        Promise.resolve([
          { productId: PLUS_PRODUCT_IDS.yearly, plusExpiresAt: "2026-10-10T10:00:00.000Z" },
        ]),
    });
    await verifyPlusWithStore(granted, NOW);
    expect((await loadEntitlement()).isPlus).toBe(true);
    await verifyPlusWithStore(store, new Date("2026-10-11T10:00:00Z"));
    expect((await loadEntitlement()).isPlus).toBe(false);
  });

  it("keeps the local flag on a store error — never revokes a paying user (CR-02)", async () => {
    const granted = fakeStore({
      restorePurchases: () =>
        Promise.resolve([{ productId: PLUS_PRODUCT_IDS.lifetime, plusExpiresAt: null }]),
    });
    await verifyPlusWithStore(granted, NOW);
    const offline = fakeStore({
      restorePurchases: () => Promise.reject(new Error("offline")),
    });
    await verifyPlusWithStore(offline, new Date("2026-10-11T10:00:00Z"));
    expect((await loadEntitlement()).isPlus).toBe(true);
  });
});
