import { registerRootComponent } from "expo";
import { Platform } from "react-native";

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

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
