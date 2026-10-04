import type { WidgetSnapshot } from "./widgetData";

// Default (web/Expo Go) implementation: no native widget targets exist, so
// publishing is a no-op. Platform builds resolve syncNativeWidgets.ios.ts or
// syncNativeWidgets.android.ts instead.
export function syncNativeWidgets(_snapshot: WidgetSnapshot): void {
  // no-op
}
