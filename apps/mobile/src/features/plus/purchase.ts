import { trackEvent } from "../analytics/events";
import { applyVerification, grantPlus } from "../loop/entitlement";
import { createExpoIapStore, type PlusStore } from "./iapPort";
import { planForProductId, PLUS_PRODUCT_IDS, type PlusPlan } from "./plusProducts";

// J7 purchase orchestration — thin over PlusStore so every path (paywall buy,
// settings restore, start re-check) funnels into the same entitlement writes
// and analytics events. Store absence (Expo Go / pre-product-catalog) resolves
// to "failed"/"unknown" rather than throwing into the UI.

export type BuyOutcome = "purchased" | "cancelled" | "failed";

export async function buyPlus(
  plan: PlusPlan,
  store: PlusStore = createExpoIapStore(),
  now: Date = new Date(),
): Promise<BuyOutcome> {
  try {
    const result = await store.purchase(plan);
    if (result.kind !== "purchased") {
      return result.kind;
    }
    await grantPlus(result.purchase.productId, result.purchase.plusExpiresAt, now);
    trackEvent("plus_purchase_completed", { plan, productId: result.purchase.productId });
    return "purchased";
  } catch {
    // Store unreachable (Expo Go, offline catalog) — the paywall shows the
    // generic failure message; nothing was charged so nothing to revoke.
    return "failed";
  }
}

export type RestoreOutcome = "restored" | "none" | "failed";

export async function restorePlus(
  store: PlusStore = createExpoIapStore(),
  now: Date = new Date(),
): Promise<RestoreOutcome> {
  try {
    const purchases = await store.restorePurchases();
    // Lifetime outranks yearly when a receipt carries both.
    const best = purchases.find((p) => p.productId === PLUS_PRODUCT_IDS.lifetime) ?? purchases[0];
    if (best == null) {
      return "none";
    }
    const plan = planForProductId(best.productId);
    await grantPlus(best.productId, best.plusExpiresAt, now);
    trackEvent("plus_restore_completed", { plan: plan ?? "yearly", productId: best.productId });
    return "restored";
  } catch {
    return "failed";
  }
}

// ADR-003 entitlement re-check: run on every app start and when the stored
// expiry stamp passes. A store error is "unknown" — the kept local flag is
// never revoked nor extended by a failed query (tri-state, CR-02).
export async function verifyPlusWithStore(
  store: PlusStore = createExpoIapStore(),
  now: Date = new Date(),
): Promise<void> {
  try {
    const purchases = await store.restorePurchases();
    if (purchases.length === 0) {
      await applyVerification("not-plus", null, null, now);
      return;
    }
    const best = purchases.find((p) => p.productId === PLUS_PRODUCT_IDS.lifetime) ?? purchases[0];
    // purchases.length > 0 guarantees best — the null-check keeps TS honest.
    if (best == null) {
      await applyVerification("not-plus", null, null, now);
      return;
    }
    await applyVerification("plus", best.productId, best.plusExpiresAt, now);
  } catch {
    await applyVerification("unknown", null, null, now);
  }
}
