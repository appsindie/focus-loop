import { act, render, waitFor } from "@testing-library/react-native";
import { jest, describe, expect, it, beforeEach } from "@jest/globals";
import { AdsProvider } from "./AdsProvider";
import { HomeBanner } from "./HomeBanner";
import { gatherAdsConsent } from "./consent";

const mockLoadAd = jest.fn<() => void>();
const mockInitialize = jest.fn<() => Promise<never[]>>();
const mockSetRequestConfiguration = jest.fn<() => Promise<void>>();

jest.mock("@appsindie/react-native-ads", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const AdsContext = React.createContext<{ setAllowTracking?: (allowed: boolean) => void } | null>(
    null,
  );
  return {
    AdsContext,
    AdsContainer: ({
      value,
      children,
    }: {
      value: { setAllowTracking?: (allowed: boolean) => void } | null;
      children: import("react").ReactNode;
    }) => React.createElement(AdsContext.Provider, { value }, children),
    useAdsPermission: () => {
      const context = React.useContext(AdsContext);
      return {
        requestPermission: () => Promise.resolve(context?.setAllowTracking?.(true)),
      };
    },
    Banner: () => {
      React.useEffect(() => {
        mockLoadAd();
      }, []);
      return null;
    },
  };
});

jest.mock("react-native-google-mobile-ads", () => ({
  __esModule: true,
  TestIds: {
    BANNER: "test-banner",
    INTERSTITIAL: "test-interstitial",
    REWARDED: "test-rewarded",
  },
  default: jest.fn(() => ({
    setRequestConfiguration: mockSetRequestConfiguration,
    initialize: mockInitialize,
  })),
}));

jest.mock("./consent", () => ({
  gatherAdsConsent: jest.fn(),
  getAdsConsentInfo: jest.fn(),
  showAdPrivacyOptions: jest.fn(),
}));

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

describe("AdsProvider request gate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetRequestConfiguration.mockResolvedValue(undefined);
    mockInitialize.mockResolvedValue([]);
  });

  it("does not mount a banner request until consent resolves", async () => {
    const pending = deferred<{
      canRequestAds: boolean;
      privacyOptionsRequired: boolean;
    }>();
    jest.mocked(gatherAdsConsent).mockReturnValue(pending.promise);
    await render(
      <AdsProvider>
        <HomeBanner entitlementLoaded hasAdsRemoval={false} backgroundColor="#fff" />
      </AdsProvider>,
    );

    expect(mockLoadAd).not.toHaveBeenCalled();
    await act(async () => {
      pending.resolve({ canRequestAds: true, privacyOptionsRequired: false });
      await pending.promise;
    });
    await waitFor(() => expect(mockLoadAd).toHaveBeenCalledTimes(1));
  });

  it("never mounts a banner request when consent does not allow ads", async () => {
    jest.mocked(gatherAdsConsent).mockResolvedValue({
      canRequestAds: false,
      privacyOptionsRequired: false,
    });
    await render(
      <AdsProvider>
        <HomeBanner entitlementLoaded hasAdsRemoval={false} backgroundColor="#fff" />
      </AdsProvider>,
    );

    await waitFor(() => expect(gatherAdsConsent).toHaveBeenCalledTimes(1));
    expect(mockLoadAd).not.toHaveBeenCalled();
  });
});
