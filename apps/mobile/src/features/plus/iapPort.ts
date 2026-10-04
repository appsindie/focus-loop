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
  { kind: "purchased"; purchase: StorePurchase } | { kind: "cancelled" } | { kind: "failed" };

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
        const updatedSub = purchaseUpdatedListener((purchase) => {
          if (purchase.productId !== productId && purchase.currentPlanId !== productId) {
            return;
          }
          updatedSub.remove();
          errorSub.remove();
          void finishTransaction({ purchase, isConsumable: false })
            .catch(() => {})
            .then(() =>
              resolve({
                kind: "purchased",
                purchase: {
                  productId: purchase.productId,
                  plusExpiresAt: purchaseExpiry(purchase),
                },
              }),
            );
        });
        const errorSub = purchaseErrorListener((error) => {
          if (error.productId != null && error.productId !== productId) {
            return;
          }
          updatedSub.remove();
          errorSub.remove();
          resolve({ kind: error.code === ErrorCode.UserCancelled ? "cancelled" : "failed" });
        });
        const props =
          type === "subs"
            ? Platform.OS === "ios"
              ? { request: { apple: { sku: productId } }, type: "subs" as const }
              : { request: { google: { skus: [productId] } }, type: "subs" as const }
            : Platform.OS === "ios"
              ? { request: { apple: { sku: productId } }, type: "in-app" as const }
              : { request: { google: { skus: [productId] } }, type: "in-app" as const };
        requestPurchase(props).catch(() => {
          updatedSub.remove();
          errorSub.remove();
          resolve({ kind: "failed" });
        });
      });
    },

    async restorePurchases(): Promise<StorePurchase[]> {
      await ensureConnection();
      const purchases = await getAvailablePurchases();
      return purchases
        .filter((p) => PRODUCT_IDS.includes(p.productId))
        .map((p) => ({
          productId: p.productId,
          plusExpiresAt: purchaseExpiry(p),
        }));
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
