import { Platform } from "react-native";

import { setEventSink, type EventProps } from "./events";

type FirebaseAnalyticsModule = {
  default: () => {
    logEvent: (name: string, params: Record<string, string | number | boolean>) => Promise<void>;
  };
};

// Firebase event params accept string/number/boolean only — drop nulls and cap
// at Analytics' 25-param limit (our events carry 1-3 props, the cap is a guard).
function toFirebaseParams(props: EventProps): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(props)) {
    if (value === null) continue;
    out[key] = value;
    if (Object.keys(out).length >= 25) break;
  }
  return out;
}

// Registers the analytics sink against Firebase. No-ops where the native
// module is absent (web preview, jest) so `trackEvent` keeps its console path.
// Crashlytics needs no JS call — its pod captures native + JS crashes on init.
export function registerFirebaseAnalytics(): boolean {
  if (Platform.OS === "web") return false;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const analytics = (require("@react-native-firebase/analytics") as FirebaseAnalyticsModule)
      .default;
    setEventSink((name, props) => {
      try {
        void analytics()
          .logEvent(name, toFirebaseParams(props))
          .catch(() => {
            // Analytics must never break the app (offline, quota, etc.).
          });
      } catch {
        // Synchronous failure too (e.g. default app not configured): the sink
        // is fire-and-forget and must never propagate into a user flow.
      }
    });
    return true;
  } catch {
    return false;
  }
}
