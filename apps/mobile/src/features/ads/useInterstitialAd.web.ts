export function useInterstitialAd(_hasAdsRemoval = false, _navigate?: () => void) {
  return { isLoaded: false, isClosed: false, showFullscreenAds: () => {} };
}
