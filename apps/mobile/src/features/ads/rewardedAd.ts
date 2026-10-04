// J8-R1: rewarded ads — the 24h item trial is earned by watching a video the
// user explicitly asked for. The RNGMA module is loaded lazily so jest and
// Expo Go never touch native code (the same reason expo-iap stays behind a
// port). A null adUnitId (no production unit provisioned yet — RR-14) or a
// missing module reports "unavailable" so the caller can show the retry copy.
import { trackEvent } from "../analytics/events";

export type RewardedResult =
  | "earned" // reward granted — the trial may start
  | "closed" // user closed before earning
  | "load-failed" // no fill / load error / timed out
  | "show-failed" // loaded but would not present
  | "unavailable"; // no unit id or no native module

type RewardedModule = typeof import("react-native-google-mobile-ads");

const LOAD_TIMEOUT_MS = 45_000;

// Synchronous require inside try/catch: the module only loads the first time
// a trial card asks for a video — jest/Expo Go resolve null, never a crash.
function loadModule(): RewardedModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- intentional lazy load
    return require("react-native-google-mobile-ads") as RewardedModule;
  } catch {
    return null;
  }
}

export async function watchForReward(
  adUnitId: string | null,
  options: { requestNonPersonalizedAdsOnly?: boolean; keywords?: string[] } = {},
): Promise<RewardedResult> {
  if (adUnitId == null) {
    return "unavailable";
  }
  const mod = loadModule();
  if (mod == null) {
    return "unavailable";
  }
  const { RewardedAd, RewardedAdEventType, AdEventType } = mod;
  return new Promise<RewardedResult>((resolve) => {
    let earned = false;
    let settled = false;
    let unsubscribe: (() => void)[] = [];
    const settle = (result: RewardedResult) => {
      if (settled) {
        return;
      }
      settled = true;
      unsubscribe.forEach((off) => off());
      clearTimeout(timer);
      resolve(result);
    };
    let ad;
    try {
      // An older RNGMA without createForAdRequest throws here — treat it as
      // "unavailable" rather than rejecting the whole screen flow.
      ad = RewardedAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: options.requestNonPersonalizedAdsOnly ?? false,
        keywords: options.keywords ?? [],
      });
    } catch {
      resolve("unavailable");
      return;
    }
    const timer = setTimeout(() => settle("load-failed"), LOAD_TIMEOUT_MS);
    unsubscribe = [
      ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
        // CR-32: the timeout bounds the LOAD wait only. Left armed, a slow
        // fill plus a playing video lets it fire "load-failed" mid-watch —
        // the viewer finishes the ad and gets no reward.
        clearTimeout(timer);
        try {
          // show() is async — a presentation failure (no activity, torn-down
          // screen) rejects here, mapped onto the same "show-failed" result.
          void ad.show().catch(() => settle("show-failed"));
        } catch {
          settle("show-failed");
        }
      }),
      ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        earned = true;
      }),
      ad.addAdEventListener(AdEventType.ERROR, () => settle("load-failed")),
      // The reward lands before CLOSE — the flag is read at close.
      ad.addAdEventListener(AdEventType.CLOSED, () => settle(earned ? "earned" : "closed")),
    ];
    try {
      ad.load();
    } catch {
      settle("load-failed");
    }
  });
}

// The metric J8 tracks: rewarded completion rate = completed / requested.
export function trackRewardedResult(result: RewardedResult, itemId: string): void {
  if (result === "earned") {
    trackEvent("rewarded_ad_completed", { itemId });
  } else {
    trackEvent("rewarded_ad_failed", { itemId, result });
  }
}
