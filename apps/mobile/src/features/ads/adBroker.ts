import { InterstitialTrigger } from "../loop/triggers";
import { trackEvent } from "../analytics/events";

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

export type InterstitialTriggerContext = {
  firstInstallAt: string | null;
  // J7-R3: Plus removes all ads — suppress the trigger before the grace check so
  // `ad_trigger_shown` never claims a show no Plus user could see.
  hasAdsRemoval?: boolean | undefined;
  show?: (() => void) | undefined;
  now?: Date | undefined;
};

// A trigger point is a request, not a guarantee: the console cap + grace decide;
// `show` only runs when the request is allowed through.
export function notifyInterstitialTrigger(
  trigger: InterstitialTrigger,
  context: InterstitialTriggerContext,
): "suppressed-plus" | "suppressed-grace" | "queued" {
  const { firstInstallAt, hasAdsRemoval = false, show, now = new Date() } = context;
  if (hasAdsRemoval) {
    trackEvent("ad_trigger_suppressed", { trigger, reason: "plus" });
    return "suppressed-plus";
  }
  if (isWithinAdGrace(firstInstallAt, now)) {
    trackEvent("ad_trigger_suppressed", { trigger, reason: "new-user-grace" });
    return "suppressed-grace";
  }
  trackEvent("ad_trigger_shown", { trigger });
  show?.();
  return "queued";
}
