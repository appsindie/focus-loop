import { useContext, useEffect } from "react";
import { AdsContext } from "@appsindie/react-native-ads";
import { useInterstitialAd as useRNInterstitialAd } from "react-native-google-mobile-ads";

export function useInterstitialAd() {
  const ads = useContext(AdsContext);
  const { isLoaded, isClosed, load, show, error } = useRNInterstitialAd(ads.interstitialId, {
    requestNonPersonalizedAdsOnly: ads.allowTracking === false,
    keywords: ads.keywords,
  });

  useEffect(() => {
    if (ads.allowTracking !== null && ads.interstitialId && !error) {
      load();
    }
  }, [ads.allowTracking, ads.interstitialId, error, load]);

  useEffect(() => {
    if (isLoaded) {
      show();
    }
  }, [isLoaded, show]);

  return { isLoaded, isClosed };
}
