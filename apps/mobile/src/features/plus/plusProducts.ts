// J7-R2 (sponsor, 2026-10-03): Yearly $19.99 with a 7-day free trial, Lifetime
// $49.99. The IDs below are the App Store Connect / Play Console product ids —
// prices shown on P14 come from the store, never from this file.
export type PlusPlan = "yearly" | "lifetime";

export const PLUS_PRODUCT_IDS: Record<PlusPlan, string> = {
  yearly: "focusloop.plus.yearly",
  lifetime: "focusloop.plus.lifetime",
};

export const PLUS_PLANS: PlusPlan[] = ["yearly", "lifetime"];

export function planForProductId(productId: string): PlusPlan | null {
  for (const plan of PLUS_PLANS) {
    if (PLUS_PRODUCT_IDS[plan] === productId) {
      return plan;
    }
  }
  return null;
}
