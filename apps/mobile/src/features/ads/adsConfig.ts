import { Platform } from "react-native";
import { TestIds } from "react-native-google-mobile-ads";

// J2-R5 / ADR-003: whether a triggered interstitial actually shows — frequency
// cap (≤1 trigger/active day per the Gate-0 model), placement rules — is AdMob
// CONSOLE server-side configuration. It is not expressible in app code; the
// console setting is a release-gate check alongside RR-03's production IDs.
export const ADS_CONFIG = {
  bannerId: __DEV__
    ? TestIds.BANNER
    : Platform.select({
        ios: "ca-app-pub-9324885420924703/7532234569",
        android: "ca-app-pub-9324885420924703/2489012633",
        default: TestIds.BANNER,
      }),
  interstitialId: __DEV__
    ? TestIds.INTERSTITIAL
    : Platform.select({
        ios: "ca-app-pub-9324885420924703/6164533762",
        android: "ca-app-pub-9324885420924703/3245505198",
        default: TestIds.INTERSTITIAL,
      }),
  // J8 rewarded unit: not yet provisioned in the AdMob console (RR-14 — the
  // unit must exist before the trial card can earn). Null in production makes
  // the port report "unavailable"; the UI then shows the retry copy instead
  // of a dead button.
  rewardedId: __DEV__ ? TestIds.REWARDED : (Platform.select({ default: null }) as string | null),
  keywords: ["focus", "productivity", "adhd", "pomodoro"],
};
