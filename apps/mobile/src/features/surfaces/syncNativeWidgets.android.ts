import { requestWidgetUpdate } from "react-native-android-widget";
import { createElement } from "react";
import { FocusNextWidget } from "../widgets/android/FocusNextWidget";
import { FocusStartWidget } from "../widgets/android/FocusStartWidget";
import type { WidgetSnapshot } from "./widgetData";

// Android bridge: ask the OS to re-render both home-screen widgets with the
// fresh snapshot. widgetNotFound is the library's documented cleanup hook —
// nothing to clean up here since the snapshot is written by the app anyway.
export function syncNativeWidgets(snapshot: WidgetSnapshot): void {
  void requestWidgetUpdate({
    widgetName: "FocusStart",
    renderWidget: () => createElement(FocusStartWidget, { snapshot }),
  });
  void requestWidgetUpdate({
    widgetName: "FocusNext",
    renderWidget: () => createElement(FocusNextWidget, { snapshot }),
  });
}
