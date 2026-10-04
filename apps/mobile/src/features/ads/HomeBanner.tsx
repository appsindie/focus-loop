import { StyleSheet, View } from "react-native";
import { Banner } from "@appsindie/react-native-ads";

// P04 free-tier banner, 320x50. One component shared by both Home paths
// (S10-01): the phone path pins it to the bottom of Home, the tablet path
// slots it into Home's right column (T01). Renders nothing until the
// entitlement read lands so Plus never flashes an ad (CR-25 — the tablet
// path leaked this until the shared node).
export function HomeBanner({
  entitlementLoaded,
  hasAdsRemoval,
  backgroundColor,
}: {
  entitlementLoaded: boolean;
  hasAdsRemoval: boolean;
  backgroundColor: string;
}) {
  if (!entitlementLoaded) {
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
