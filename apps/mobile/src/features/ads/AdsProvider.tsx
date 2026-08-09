import { useEffect, type ReactNode } from "react";
import { AdsContainer, useAdsModule, useAdsPermission } from "@appsindie/react-native-ads";
import { ADS_CONFIG } from "./adsConfig";

type AdsProviderProps = {
  children: ReactNode;
};

function AdsPermissionRequester() {
  const { requestPermission } = useAdsPermission();

  useEffect(() => {
    const timer = setTimeout(() => {
      void requestPermission();
    }, 1000);
    return () => clearTimeout(timer);
  }, [requestPermission]);

  return null;
}

export function AdsProvider({ children }: AdsProviderProps) {
  const { allowTracking, setAllowTracking } = useAdsModule();

  return (
    <AdsContainer
      value={{
        ...ADS_CONFIG,
        allowTracking,
        setAllowTracking,
      }}
    >
      <AdsPermissionRequester />
      {children}
    </AdsContainer>
  );
}
