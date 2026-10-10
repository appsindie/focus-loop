import AsyncStorage from "@react-native-async-storage/async-storage";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import {
  applyDiagnosticsConsent,
  isDiagnosticsAllowed,
  loadDiagnosticsConsent,
  saveDiagnosticsConsent,
} from "./diagnosticsConsent";

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

describe("diagnostics consent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    void AsyncStorage.clear();
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

  it("round-trips the dedicated key; absent defaults to ON", async () => {
    expect(await loadDiagnosticsConsent()).toBe(true);
    await saveDiagnosticsConsent(false);
    expect(await loadDiagnosticsConsent()).toBe(false);
    await saveDiagnosticsConsent(true);
    expect(await loadDiagnosticsConsent()).toBe(true);
  });

  it("consent key is independent of the settings payload", async () => {
    await saveDiagnosticsConsent(false);
    await AsyncStorage.removeItem("focus-loop/settings");
    expect(await loadDiagnosticsConsent()).toBe(false);
  });
});
