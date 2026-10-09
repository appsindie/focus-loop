import { useContext } from "react";
import { View, type ViewProps } from "react-native";
import { SafeAreaInsetsContext, type Edge } from "react-native-safe-area-context";

const ALL_EDGES: readonly Edge[] = ["top", "right", "bottom", "left"];
const ZERO = { top: 0, right: 0, bottom: 0, left: 0 };

// Drop-in for react-native-safe-area-context's SafeAreaView, driven by the
// provider's context insets instead of the native view's own measurement.
// The native-backed SafeAreaView (v5) measures per instance, so a screen's
// first mount can paint one 0-inset frame — headers flash inside the status
// bar, footers under the home indicator — then self-corrects. The provider's
// insets are measured once at app start and are stable by the time any
// screen mounts, so context-driven padding never shows that frame.
export function SafeAreaView({
  edges,
  style,
  children,
  ...rest
}: ViewProps & { edges?: readonly Edge[] }) {
  // Direct context read (not useSafeAreaInsets, which throws outside a
  // provider) — screens rendered bare in tests get zero insets, not a crash.
  const insets = useContext(SafeAreaInsetsContext) ?? ZERO;
  const wanted = edges ?? ALL_EDGES;
  return (
    <View
      style={[
        {
          paddingTop: wanted.includes("top") ? insets.top : 0,
          paddingRight: wanted.includes("right") ? insets.right : 0,
          paddingBottom: wanted.includes("bottom") ? insets.bottom : 0,
          paddingLeft: wanted.includes("left") ? insets.left : 0,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
