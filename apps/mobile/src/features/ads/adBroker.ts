import { InterstitialTrigger } from "../loop/triggers";

// ADR-003: the design fixes WHERE ads trigger; AdMob console caps decide whether
// they show. New-user grace is owned client-side because console caps cannot
// express "no ads for the first N days" — the broker suppresses trigger points
// until install age passes the window. 3 days keeps ads strictly after value
// (decision recorded in the slice commit; tunable in the growth pass).
export const NEW_USER_AD_GRACE_MS = 3 * 24 * 60 * 60 * 1000;

export function isWithinAdGrace(firstInstallAt: string | null, now: Date = new Date()): boolean {
  if (firstInstallAt == null) {
    return false;
  }
  const installMs = Date.parse(firstInstallAt);
  if (!Number.isFinite(installMs)) {
    return false;
  }
  return now.getTime() - installMs < NEW_USER_AD_GRACE_MS;
}

// A trigger point is a request, not a guarantee: the console cap + grace decide;
// `show` only runs when the request is allowed through.
export function notifyInterstitialTrigger(
  trigger: InterstitialTrigger,
  firstInstallAt: string | null,
  show?: () => void,
  now: Date = new Date(),
): "suppressed-grace" | "queued" {
  if (isWithinAdGrace(firstInstallAt, now)) {
    return "suppressed-grace";
  }
  show?.();
  return "queued";
}
