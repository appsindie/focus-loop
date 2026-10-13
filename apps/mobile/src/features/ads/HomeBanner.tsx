import { StyleSheet, View } from "react-native";
import { Banner } from "@appsindie/react-native-ads";
import { useAdsConsent } from "./AdsProvider";

// P04 free-tier anchored adaptive banner. It spans the device width, so App
// pins the shared slot below Home on every device and orientation. Renders
// nothing until the entitlement read lands so Plus never flashes an ad (CR-25).
export function HomeBanner({
  entitlementLoaded,
  hasAdsRemoval,
  backgroundColor,
}: {
  entitlementLoaded: boolean;
  hasAdsRemoval: boolean;
  backgroundColor: string;
}) {
  const { adsReady, canRequestAds } = useAdsConsent();
  if (!entitlementLoaded || !adsReady || !canRequestAds) {
    return null;
  }
  return (
    <View testID="home-banner" style={[styles.slot, { backgroundColor }]}>
      <Banner hasAdsRemoval={hasAdsRemoval} />
    </View>
  );
}

const styles = StyleSheet.create({
  slot: { alignItems: "center" },
});
