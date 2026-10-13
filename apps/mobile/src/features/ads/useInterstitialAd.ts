import { useCallback, useContext, useEffect, useRef } from "react";
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
  const initialLoadRequested = useRef(false);
  const closeReloadRequested = useRef(false);

  useEffect(() => {
    const canLoad =
      consent.adsReady && consent.canRequestAds && !hasAdsRemoval && Boolean(ads.interstitialId);

    if (!isClosed) {
      closeReloadRequested.current = false;
      if (!canLoad) {
        initialLoadRequested.current = false;
        return;
      }
      if (!initialLoadRequested.current && !error) {
        initialLoadRequested.current = true;
        load();
      }
      return;
    }

    if (canLoad && !closeReloadRequested.current) {
      closeReloadRequested.current = true;
      load();
    }
  }, [
    ads.interstitialId,
    consent.adsReady,
    consent.canRequestAds,
    error,
    hasAdsRemoval,
    isClosed,
    load,
  ]);

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
