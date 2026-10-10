import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// User opt-out for Firebase Analytics + Crashlytics (Settings → "Crash & usage
// reports"). Stored under its OWN key, separate from the settings payload: a
// corrupt/invalid settings blob falling back to defaults must never silently
// re-enable collection (review F2). The JS-side flag gates the analytics sink
// for the window between module init and the stored pref landing; the native
// SDKs persist their own collection flag so an opt-out survives restarts even
// before JS boots.
const CONSENT_KEY = "focus-loop/diagnostics-consent";

let allowed = true;

export function isDiagnosticsAllowed(): boolean {
  return allowed;
}

export async function loadDiagnosticsConsent(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(CONSENT_KEY);
    // Absent = first launch = default ON (recorded sponsor decision, RR-04).
    return raw == null ? true : JSON.parse(raw) === true;
  } catch {
    return true;
  }
}

export async function saveDiagnosticsConsent(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(CONSENT_KEY, JSON.stringify(enabled));
  } catch {
    // A failed write only means the pref reverts next launch — never crash.
  }
}

type AnalyticsModule = {
  default: () => { setAnalyticsCollectionEnabled: (enabled: boolean) => Promise<void> };
};
type CrashlyticsModule = {
  default: () => { setCrashlyticsCollectionEnabled: (enabled: boolean) => Promise<null> };
};

export function applyDiagnosticsConsent(enabled: boolean): void {
  allowed = enabled;
  if (Platform.OS === "web") return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- lazy, like the sink
    const analytics = (require("@react-native-firebase/analytics") as AnalyticsModule).default;
    void analytics()
      .setAnalyticsCollectionEnabled(enabled)
      .catch(() => {});
  } catch {
    // Module absent (jest, preview) — the JS gate above still holds.
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const crashlytics = (require("@react-native-firebase/crashlytics") as CrashlyticsModule)
      .default;
    void crashlytics()
      .setCrashlyticsCollectionEnabled(enabled)
      .catch(() => {});
  } catch {
    // Module absent (jest, preview) — same as the analytics branch.
  }
}
