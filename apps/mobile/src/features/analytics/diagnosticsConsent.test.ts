import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { applyDiagnosticsConsent, isDiagnosticsAllowed } from "./diagnosticsConsent";

const mockSetAnalytics = jest.fn<(e: boolean) => Promise<void>>().mockResolvedValue(undefined);
const mockSetCrashlytics = jest.fn<(e: boolean) => Promise<null>>().mockResolvedValue(null);

jest.mock("@react-native-firebase/analytics", () => ({
  __esModule: true,
  default: () => ({ setAnalyticsCollectionEnabled: mockSetAnalytics }),
}));
jest.mock("@react-native-firebase/crashlytics", () => ({
  __esModule: true,
  default: () => ({ setCrashlyticsCollectionEnabled: mockSetCrashlytics }),
}));

describe("applyDiagnosticsConsent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    applyDiagnosticsConsent(true);
    jest.clearAllMocks();
  });

  it("pushes the flag to both native SDKs and the JS gate", () => {
    applyDiagnosticsConsent(false);
    expect(mockSetAnalytics).toHaveBeenCalledWith(false);
    expect(mockSetCrashlytics).toHaveBeenCalledWith(false);
    expect(isDiagnosticsAllowed()).toBe(false);
    applyDiagnosticsConsent(true);
    expect(isDiagnosticsAllowed()).toBe(true);
  });
});
