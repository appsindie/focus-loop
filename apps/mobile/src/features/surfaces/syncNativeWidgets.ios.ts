import { requireNativeModule } from "expo-modules-core";
import type { WidgetSnapshot } from "./widgetData";

// iOS bridge: Module.swift (compiled into the app by react-native-widget-
// extension) writes the snapshot JSON into the App Group the WidgetKit
// extension reads, then asks WidgetCenter to reload every timeline.
type WidgetNativeModule = {
  setSharedData(json: string): void;
  reloadWidgetTimelines(): void;
};

export function syncNativeWidgets(snapshot: WidgetSnapshot): void {
  try {
    const mod = requireNativeModule<WidgetNativeModule>("ReactNativeWidgetExtension");
    mod.setSharedData(JSON.stringify(snapshot));
    mod.reloadWidgetTimelines();
  } catch {
    // Module absent (Expo Go, simulator edge, extension not built) — widgets
    // silently unavailable, matching the spec's failure-mode posture.
  }
}
