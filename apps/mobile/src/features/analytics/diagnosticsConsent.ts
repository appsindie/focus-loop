import { Platform } from "react-native";

// User opt-out for Firebase Analytics + Crashlytics (Settings → "Crash & usage
// reports"). The JS-side flag gates the analytics sink for the window between
// module init and the stored pref landing; the native SDKs persist their own
// collection flag so an opt-out survives restarts even before JS boots.
let allowed = true;

export function isDiagnosticsAllowed(): boolean {
  return allowed;
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
