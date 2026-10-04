import AsyncStorage from "@react-native-async-storage/async-storage";
import { syncNativeWidgets } from "./syncNativeWidgets";
import { WIDGET_DATA_KEY, type WidgetSnapshot } from "./widgetData";

// Publish the widget snapshot to both channels: AsyncStorage (the Android
// headless widget task reads it on each render request) and the platform
// bridge (iOS App Group + timeline reload / Android requestWidgetUpdate).
export async function publishWidgetSnapshot(snapshot: WidgetSnapshot): Promise<void> {
  await AsyncStorage.setItem(WIDGET_DATA_KEY, JSON.stringify(snapshot));
  syncNativeWidgets(snapshot);
}
