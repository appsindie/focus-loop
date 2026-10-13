import { AdsContainer, useAdsPermission } from "@appsindie/react-native-ads";
import mobileAds from "react-native-google-mobile-ads";
import { Platform } from "react-native";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ADS_CONFIG } from "./adsConfig";
import {
  gatherAdsConsent,
  getAdsConsentInfo,
  showAdPrivacyOptions,
  type ConsentState,
} from "./consent";

type AdsConsentContextValue = ConsentState & {
  resolved: boolean;
  adsReady: boolean;
  showPrivacyOptions: () => Promise<void>;
};

const NO_CONSENT: ConsentState = {
  canRequestAds: false,
  privacyOptionsRequired: false,
};

const AdsConsentContext = createContext<AdsConsentContextValue>({
  ...NO_CONSENT,
  resolved: false,
  adsReady: false,
  showPrivacyOptions: async () => {},
});

export function useAdsConsent(): AdsConsentContextValue {
  return useContext(AdsConsentContext);
}

type AdsProviderProps = {
  children: ReactNode;
};

function AdsPermissionRequester({ onResolved }: { onResolved: (allowed: boolean) => void }) {
  const { requestPermission } = useAdsPermission();

  useEffect(() => {
    let active = true;
    void requestPermission().catch(() => {
      if (active) {
        onResolved(false);
      }
    });
    return () => {
      active = false;
    };
  }, [onResolved, requestPermission]);

  return null;
}

function MobileAdsInitializer({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    const lifecycle = { active: true };
    void (async () => {
      try {
        const ads = mobileAds();
        await ads.setRequestConfiguration({});
        await ads.initialize();
        if (lifecycle.active) {
          onReady();
        }
      } catch {
        // Consent failures and SDK initialization errors both leave ads off.
      }
    })();
    return () => {
      lifecycle.active = false;
    };
  }, [onReady]);

  return null;
}

export function AdsProvider({ children }: AdsProviderProps) {
  const [consent, setConsent] = useState(NO_CONSENT);
  const [consentResolved, setConsentResolved] = useState(false);
  const [allowTracking, setAllowTracking] = useState<boolean | null>(
    Platform.OS === "ios" ? null : true,
  );
  const [attResolved, setAttResolved] = useState(Platform.OS !== "ios");
  const [adsInitialized, setAdsInitialized] = useState(false);

  useEffect(() => {
    let active = true;
    void gatherAdsConsent().then((result) => {
      if (active) {
        setConsent(result);
        setConsentResolved(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const onAttResolved = useCallback((allowed: boolean) => {
    setAllowTracking(allowed);
    setAttResolved(true);
  }, []);
  const onAdsReady = useCallback(() => setAdsInitialized(true), []);
  const adsMayInitialize = consentResolved && consent.canRequestAds && attResolved;
  const adsReady = adsMayInitialize && adsInitialized;

  useEffect(() => {
    if (!adsMayInitialize) {
      setAdsInitialized(false);
    }
  }, [adsMayInitialize]);

  const showPrivacyOptions = useCallback(async () => {
    await showAdPrivacyOptions();
    setConsent(await getAdsConsentInfo());
  }, []);
  const contextValue = useMemo(
    () => ({
      ...consent,
      resolved: consentResolved,
      adsReady,
      showPrivacyOptions,
    }),
    [adsReady, consent, consentResolved, showPrivacyOptions],
  );
  const trackingValue = consentResolved && consent.canRequestAds ? allowTracking : null;

  return (
    <AdsConsentContext.Provider value={contextValue}>
      <AdsContainer
        value={{
          ...ADS_CONFIG,
          allowTracking: trackingValue,
          setAllowTracking: onAttResolved,
        }}
      >
        {consentResolved && consent.canRequestAds && Platform.OS === "ios" && !attResolved ? (
          <AdsPermissionRequester onResolved={onAttResolved} />
        ) : null}
        {adsMayInitialize ? <MobileAdsInitializer onReady={onAdsReady} /> : null}
        {children}
      </AdsContainer>
    </AdsConsentContext.Provider>
  );
}
