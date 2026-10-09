import { registerRootComponent } from "expo";
import React from "react";
import { Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import App from "./App";
import { registerFirebaseAnalytics } from "./src/features/analytics/firebaseAnalytics";

// Analytics sink registration before mount so first-launch events are captured.
// No-ops on web/jest where the Firebase native module is absent.
registerFirebaseAnalytics();

// J4/P24: Android home-screen widgets run a headless render task — registering
// it must happen before the app component mounts.
if (Platform.OS === "android") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("./src/features/widgets/android/widgetTaskHandler");
}

// SafeAreaProvider measures the window insets once at app start; every screen
// reads them from context (src/shared/ui/SafeAreaView) instead of letting each
// native SafeAreaView race its own first-frame measurement.
function Root() {
  return React.createElement(SafeAreaProvider, null, React.createElement(App));
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(Root);
