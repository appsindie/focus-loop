import { registerWidgetTaskHandler } from "react-native-android-widget";
import { createElement } from "react";
import { loadWidgetSnapshot } from "../../surfaces/widgetData";
import { FocusNextWidget } from "./FocusNextWidget";
import { FocusStartWidget } from "./FocusStartWidget";

// Android widgets render in a headless JS task on every OS update/click event.
// Each render re-reads the published snapshot so stale widget data can't
// outlive the app state that produced it.
registerWidgetTaskHandler(async ({ widgetInfo, renderWidget }) => {
  const snapshot = await loadWidgetSnapshot();
  renderWidget(
    widgetInfo.widgetName === "FocusNext"
      ? createElement(FocusNextWidget, { snapshot })
      : createElement(FocusStartWidget, { snapshot }),
  );
});
