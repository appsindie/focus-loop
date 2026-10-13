import type { PropsWithChildren } from "react";
import { act, renderHook } from "@testing-library/react-native";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { AdsContext } from "@appsindie/react-native-ads";
import { useInterstitialAd as useRNInterstitialAd } from "react-native-google-mobile-ads";
import { useAdsConsent } from "./AdsProvider";
import { useInterstitialAd } from "./useInterstitialAd";

const mockLoad = jest.fn<() => void>();
const mockShow = jest.fn<() => void>();
const mockInterstitialState = {
  isLoaded: false,
  isClosed: false,
  load: mockLoad,
  show: mockShow,
  error: undefined as unknown,
};

jest.mock("@appsindie/react-native-ads", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  return {
    AdsContext: React.createContext({
      allowTracking: true,
      bannerId: "test-banner",
      interstitialId: "test-interstitial",
      keywords: [],
      setAllowTracking: null,
    }),
  };
});

jest.mock("react-native-google-mobile-ads", () => ({
  useInterstitialAd: jest.fn(() => mockInterstitialState),
}));

jest.mock("./AdsProvider", () => ({
  useAdsConsent: jest.fn(),
}));

const adsContextValue = {
  allowTracking: true,
  bannerId: "test-banner",
  interstitialId: "test-interstitial",
  keywords: [],
  setAllowTracking: null,
};

function AdsContextWrapper({ children }: PropsWithChildren) {
  return <AdsContext.Provider value={adsContextValue}>{children}</AdsContext.Provider>;
}

function setConsent(canRequestAds: boolean) {
  jest.mocked(useAdsConsent).mockReturnValue({
    canRequestAds,
    privacyOptionsRequired: false,
    resolved: true,
    adsReady: true,
    showPrivacyOptions: async () => {},
  });
}

describe("useInterstitialAd", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInterstitialState.isLoaded = false;
    mockInterstitialState.isClosed = false;
    mockInterstitialState.error = undefined;
    jest
      .mocked(useRNInterstitialAd)
      .mockReturnValue(mockInterstitialState as unknown as ReturnType<typeof useRNInterstitialAd>);
    setConsent(true);
  });

  it("preloads, shows, and reloads once when the interstitial closes", async () => {
    const { result, rerender } = await renderHook(() => useInterstitialAd(), {
      wrapper: AdsContextWrapper,
    });
    expect(mockLoad).toHaveBeenCalledTimes(1);

    await act(async () => {
      mockInterstitialState.isLoaded = true;
      await rerender({});
    });
    await act(() => result.current.showFullscreenAds());
    expect(mockShow).toHaveBeenCalledTimes(1);

    await act(async () => {
      mockInterstitialState.isClosed = true;
      await rerender({});
    });
    expect(mockLoad).toHaveBeenCalledTimes(2);

    await act(async () => rerender({}));
    expect(mockLoad).toHaveBeenCalledTimes(2);
  });

  it("does not reload after close when ads have been removed", async () => {
    const { rerender } = await renderHook(() => useInterstitialAd(true), {
      wrapper: AdsContextWrapper,
    });
    mockInterstitialState.isClosed = true;
    await act(async () => rerender({}));
    expect(mockLoad).not.toHaveBeenCalled();
  });

  it("does not reload after close when consent disallows ads", async () => {
    setConsent(false);
    const { rerender } = await renderHook(() => useInterstitialAd(), {
      wrapper: AdsContextWrapper,
    });
    mockInterstitialState.isClosed = true;
    await act(async () => rerender({}));
    expect(mockLoad).not.toHaveBeenCalled();
  });
});
