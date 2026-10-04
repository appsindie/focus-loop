import { Platform } from "react-native";
import { syncLiveSurface as syncAndroid } from "./androidOngoingNotification";
import { syncLiveSurface as syncIos } from "./iosLiveActivity";
import type { RunningStepSurface } from "./widgetData";

// J4-R3: the running session's platform surface — iOS Live Activity, Android
// ongoing notification. The controller feeds it a deduped RunningStepSurface;
// null means nothing is in flight and the surface comes down.
export function syncLiveSurface(
  state: RunningStepSurface | null,
  strings: Record<string, string> = {},
): void {
  if (Platform.OS === "ios") {
    syncIos(state, strings);
  } else if (Platform.OS === "android") {
    void syncAndroid(state);
  }
}
