import { Platform } from "react-native";
import { TestIds } from "react-native-google-mobile-ads";

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
  keywords: ["focus", "productivity", "adhd", "pomodoro"],
};
