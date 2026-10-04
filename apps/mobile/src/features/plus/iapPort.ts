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
  type Purchase,
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
// `await connection()` first — and the first connection also installs the
// app-lifetime purchase listener below (CR-30).
let connection: Promise<void> | null = null;
async function ensureConnection(): Promise<void> {
  connection ??= initConnection().then(() => {
    ensurePurchaseListeners();
  });
  return connection;
}

// ── App-lifetime acknowledgement (CR-30) ──────────────────────────────
// Play auto-refunds purchases that are never acknowledged (~3 days) and iOS
// keeps unfinished transactions queued, so finishing cannot end when the buy
// flow settles. One global listener lives for the connection's life: it
// finishes every owned Plus transaction — buy-flow updates, post-settle
// arrivals, renewals — and forwards events to the in-flight buy, if any.
//
// `finishByTxId` dedupes: the buy flow and this listener see the same update,
// so both may ask to finish the same transaction — they share one promise.
const finishByTxId = new Map<string, Promise<void>>();

function transactionKey(purchase: Purchase): string {
  return purchase.transactionId ?? purchase.id;
}

function finishPlusTransaction(purchase: Purchase): Promise<void> {
  const key = transactionKey(purchase);
  const existing = finishByTxId.get(key);
  if (existing != null) {
    return existing;
  }
  const task = finishTransaction({ purchase, isConsumable: false }).then(
    () => undefined,
    (error: unknown) => {
      // A failed ack frees the slot so the next update retries it — an
      // unacknowledged purchase is refunded by the store, not by us.
      finishByTxId.delete(key);
      throw error;
    },
  );
  finishByTxId.set(key, task);
  return task;
}

type StoreError = Parameters<Parameters<typeof purchaseErrorListener>[0]>[0];

type ActiveBuy = {
  productId: string;
  onPurchase(purchase: Purchase): void;
  onError(error: StoreError): void;
};
let activeBuy: ActiveBuy | null = null;
let purchaseListenerSubs: { remove(): void }[] | null = null;

function isPlusProduct(productId: string | null | undefined): boolean {
  return productId != null && PRODUCT_IDS.includes(productId);
}

function ensurePurchaseListeners(): void {
  if (purchaseListenerSubs != null) {
    return;
  }
  purchaseListenerSubs = [
    purchaseUpdatedListener((purchase) => {
      if (!isPlusProduct(purchase.productId) && !isPlusProduct(purchase.currentPlanId)) {
        return;
      }
      if (purchase.purchaseState === "purchased") {
        // Owed to the store whether or not a buy flow is watching (CR-30).
        void finishPlusTransaction(purchase).catch(() => {});
      }
      const buy = activeBuy;
      if (
        buy != null &&
        (purchase.productId === buy.productId || purchase.currentPlanId === buy.productId)
      ) {
        buy.onPurchase(purchase);
      }
    }),
    purchaseErrorListener((error) => {
      const buy = activeBuy;
      if (buy == null) {
        return;
      }
      if (error.productId != null && error.productId !== buy.productId) {
        return;
      }
      buy.onError(error);
    }),
  ];
}

// The default store is a module singleton: passing `createExpoIapStore()` as a
// React default prop would mint a new object every render and re-fire every
// effect keyed on it (CR-27 — the paywall's load effect looped forever).
let defaultStore: PlusStore | null = null;
export function getDefaultPlusStore(): PlusStore {
  defaultStore ??= createExpoIapStore();
  return defaultStore;
}

// A purchase flow that neither store event settles would leave the buy
// spinner spinning forever — bound it. The bound resolves "pending", not
// "failed": the store sheet can still be up when it fires, and whatever the
// user finishes afterwards is still acknowledged by the global listener
// (CR-30).
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
      if (activeBuy != null) {
        // One sheet at a time — a second request while a buy is in flight
        // would steal its store events.
        return { kind: "failed" };
      }
      return new Promise<PurchaseResult>((resolve) => {
        let settled = false;
        const settle = (result: PurchaseResult) => {
          if (settled) {
            return;
          }
          settled = true;
          clearTimeout(timer);
          activeBuy = null;
          resolve(result);
        };
        const timer = setTimeout(() => settle({ kind: "pending" }), PURCHASE_SETTLE_MS);
        activeBuy = {
          productId,
          onPurchase: (purchase) => {
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
            // The global listener may already be finishing this same update —
            // finishByTxId dedupes it. A failure here means the store would
            // auto-refund, so report failed rather than granting (CR-28).
            void finishPlusTransaction(purchase)
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
          },
          onError: (error) => {
            settle({ kind: error.code === ErrorCode.UserCancelled ? "cancelled" : "failed" });
          },
        };
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
          // Rows returned here may still be unacknowledged (e.g. an update
          // that arrived while no listener was attached) — the re-check is
          // also an ack path (CR-30).
          .map((p) => {
            void finishPlusTransaction(p).catch(() => {});
            return p;
          })
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
