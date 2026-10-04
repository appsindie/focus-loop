import {
  endConnection,
  ErrorCode,
  fetchProducts,
  finishTransaction,
  getAvailablePurchases,
  initConnection,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
} from "expo-iap";
import { Platform } from "react-native";
import { PLUS_PLANS, PLUS_PRODUCT_IDS, type PlusPlan } from "./plusProducts";

// The store seam for J7. Everything store-touching goes through PlusStore so
// purchase/restore/re-check are unit-testable and Expo-Go-safe (the expo-iap
// module throws UnavailabilityError outside a dev-client build, which the port
// surfaces as `kind: "unavailable"` / a rejected promise).

export type StoreProduct = {
  plan: PlusPlan;
  productId: string;
  title: string;
  priceText: string;
};

export type StorePurchase = {
  productId: string;
  // Store-side expiry (iOS subscription expiry / Android subscription status).
  // Null for lifetime and when the store reports an active sub without a date —
  // the start re-check is what eventually revokes a lapsed sub (ADR-003).
  plusExpiresAt: string | null;
};

export type PurchaseResult =
  | { kind: "purchased"; purchase: StorePurchase }
  | { kind: "cancelled" }
  // Store confirmed but payment is settling (Play pending, iOS Ask-to-Buy).
  // Nothing to grant — Plus activates on the next start re-check (CR-28).
  | { kind: "pending" }
  | { kind: "failed" };

export interface PlusStore {
  loadProducts(): Promise<StoreProduct[]>;
  purchase(plan: PlusPlan): Promise<PurchaseResult>;
  restorePurchases(): Promise<StorePurchase[]>;
}

const PRODUCT_IDS = PLUS_PLANS.map((plan) => PLUS_PRODUCT_IDS[plan]);

// The native module exists only in a dev-client/store build; in Expo Go and
// jest the calls below reject. initConnection is memoized so every port op can
// `await connection()` first.
let connection: Promise<void> | null = null;
async function ensureConnection(): Promise<void> {
  connection ??= initConnection().then(() => undefined);
  return connection;
}

// The default store is a module singleton: passing `createExpoIapStore()` as a
// React default prop would mint a new object every render and re-fire every
// effect keyed on it (CR-27 — the paywall's load effect looped forever).
let defaultStore: PlusStore | null = null;
export function getDefaultPlusStore(): PlusStore {
  defaultStore ??= createExpoIapStore();
  return defaultStore;
}

// A purchase flow that neither store listener settles would leave the buy
// spinner spinning forever — bound it (CR-28).
const PURCHASE_SETTLE_MS = 60_000;

function purchaseExpiry(purchase: {
  productId: string;
  expirationDateIOS?: number | null;
  transactionDate: number;
}): string | null {
  if (purchase.expirationDateIOS != null) {
    return new Date(purchase.expirationDateIOS).toISOString();
  }
  return null;
}

export function createExpoIapStore(): PlusStore {
  return {
    async loadProducts(): Promise<StoreProduct[]> {
      await ensureConnection();
      // Yearly is a subscription product; lifetime is a one-time in-app product.
      const [subs, inapps] = await Promise.all([
        fetchProducts({ skus: [PLUS_PRODUCT_IDS.yearly], type: "subs" }),
        fetchProducts({ skus: [PLUS_PRODUCT_IDS.lifetime], type: "in-app" }),
      ]);
      const all = [...(subs ?? []), ...(inapps ?? [])];
      const products: StoreProduct[] = [];
      for (const plan of PLUS_PLANS) {
        const productId = PLUS_PRODUCT_IDS[plan];
        const match = all.find((p) => p.id === productId);
        if (match != null) {
          products.push({
            plan,
            productId,
            title: match.title,
            priceText: match.displayPrice,
          });
        }
      }
      return products;
    },

    async purchase(plan: PlusPlan): Promise<PurchaseResult> {
      await ensureConnection();
      const productId = PLUS_PRODUCT_IDS[plan];
      const type = plan === "yearly" ? "subs" : "in-app";
      return new Promise<PurchaseResult>((resolve) => {
        let settled = false;
        const settle = (result: PurchaseResult) => {
          if (settled) {
            return;
          }
          settled = true;
          clearTimeout(timer);
          updatedSub.remove();
          errorSub.remove();
          resolve(result);
        };
        const timer = setTimeout(() => settle({ kind: "failed" }), PURCHASE_SETTLE_MS);
        const updatedSub = purchaseUpdatedListener((purchase) => {
          if (purchase.productId !== productId && purchase.currentPlanId !== productId) {
            return;
          }
          // Pending (slow payment, Ask-to-Buy) is not owned yet — the next
          // start re-check picks the purchase up when it clears (CR-28).
          if (purchase.purchaseState === "pending") {
            settle({ kind: "pending" });
            return;
          }
          if (purchase.purchaseState !== "purchased") {
            settle({ kind: "failed" });
            return;
          }
          // finishTransaction acknowledges the payment on Android — if it
          // fails the purchase auto-refunds in days, so report failed rather
          // than granting Plus the store will take back (CR-28).
          finishTransaction({ purchase, isConsumable: false })
            .then(() =>
              settle({
                kind: "purchased",
                purchase: {
                  productId: purchase.productId,
                  plusExpiresAt: purchaseExpiry(purchase),
                },
              }),
            )
            .catch(() => settle({ kind: "failed" }));
        });
        const errorSub = purchaseErrorListener((error) => {
          if (error.productId != null && error.productId !== productId) {
            return;
          }
          settle({ kind: error.code === ErrorCode.UserCancelled ? "cancelled" : "failed" });
        });
        const props =
          type === "subs"
            ? Platform.OS === "ios"
              ? { request: { apple: { sku: productId } }, type: "subs" as const }
              : { request: { google: { skus: [productId] } }, type: "subs" as const }
            : Platform.OS === "ios"
              ? { request: { apple: { sku: productId } }, type: "in-app" as const }
              : { request: { google: { skus: [productId] } }, type: "in-app" as const };
        requestPurchase(props).catch(() => settle({ kind: "failed" }));
      });
    },

    async restorePurchases(): Promise<StorePurchase[]> {
      await ensureConnection();
      const purchases = await getAvailablePurchases();
      return (
        purchases
          // Same ownership bar as the buy path — a pending row in the receipt
          // must not grant Plus (CR-28).
          .filter((p) => PRODUCT_IDS.includes(p.productId) && p.purchaseState === "purchased")
          .map((p) => ({
            productId: p.productId,
            plusExpiresAt: purchaseExpiry(p),
          }))
      );
    },
  };
}

// Store teardown hook for app shutdown / tests (ADR-003: billing connection is
// opened lazily on first paywall or re-check use).
export async function closePlusStore(): Promise<void> {
  if (connection == null) {
    return;
  }
  connection = null;
  try {
    await endConnection();
  } catch {
    // The connection may already be torn down natively; nothing to revoke.
  }
}
