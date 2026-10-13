import { useCallback, useContext, useEffect } from "react";
import { AdsContext } from "@appsindie/react-native-ads";
import { Platform } from "react-native";
import { useInterstitialAd as useRNInterstitialAd } from "react-native-google-mobile-ads";
import { useAdsConsent } from "./AdsProvider";

export function useInterstitialAd(hasAdsRemoval = false, navigate?: () => void) {
  const ads = useContext(AdsContext);
  const consent = useAdsConsent();
  const { isLoaded, isClosed, load, show, error } = useRNInterstitialAd(ads.interstitialId, {
    requestNonPersonalizedAdsOnly: Platform.OS === "ios" && ads.allowTracking === false,
    keywords: ads.keywords,
  });

  useEffect(() => {
    if (
      consent.adsReady &&
      consent.canRequestAds &&
      !hasAdsRemoval &&
      ads.interstitialId &&
      !error
    ) {
      load();
    }
  }, [ads.interstitialId, consent.adsReady, consent.canRequestAds, error, hasAdsRemoval, load]);

  useEffect(() => {
    if (isClosed && navigate) {
      navigate();
    }
  }, [isClosed, navigate]);

  const showFullscreenAds = useCallback(() => {
    if (!consent.adsReady || !consent.canRequestAds || hasAdsRemoval) {
      navigate?.();
    } else if (isLoaded) {
      show();
    } else {
      navigate?.();
    }
  }, [consent.adsReady, consent.canRequestAds, hasAdsRemoval, isLoaded, navigate, show]);

  return { isLoaded, isClosed, showFullscreenAds };
}
