import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import type { ConsentState } from "./consent";

type AdsConsentContextValue = ConsentState & {
  resolved: boolean;
  adsReady: boolean;
  showPrivacyOptions: () => Promise<void>;
};

const NO_CONSENT: AdsConsentContextValue = {
  canRequestAds: false,
  privacyOptionsRequired: false,
  resolved: false,
  adsReady: false,
  showPrivacyOptions: async () => {},
};
const AdsConsentContext = createContext(NO_CONSENT);

export function useAdsConsent(): AdsConsentContextValue {
  return useContext(AdsConsentContext);
}

type AdsProviderProps = {
  children: ReactNode;
};

export function AdsProvider({ children }: AdsProviderProps) {
  return <AdsConsentContext.Provider value={NO_CONSENT}>{children}</AdsConsentContext.Provider>;
}
