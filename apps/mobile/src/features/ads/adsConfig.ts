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
  // J8 rewarded unit (RR-14): iOS provisioned 2026-10-05; Android unit still
  // pending in the AdMob console — null makes the port report "unavailable"
  // and the UI shows the retry copy instead of a dead button.
  rewardedId: __DEV__
    ? TestIds.REWARDED
    : Platform.select({
        ios: "ca-app-pub-9324885420924703/6917716345",
        android: null,
        default: null,
      }),
  keywords: ["focus", "productivity", "adhd", "pomodoro"],
};
