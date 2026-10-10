import { useContext } from "react";
import { StyleSheet, View, type ViewProps, type ViewStyle } from "react-native";
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
  // The insets pad ON TOP of the caller's padding, matching the native view's
  // additive semantics: screens carry their own `padding`/`paddingBottom` for
  // layout, and flattening it after the insets would clobber them entirely —
  // `padding: 24` alone would erase all four safe edges (status bar and the
  // Android nav bar both overlap the content). Resolve the flattened padding
  // per edge, then add the inset so the merged values always win.
  const flat: ViewStyle = style == null ? {} : StyleSheet.flatten(style);
  const pick = (v: unknown, fallback: number): number => (typeof v === "number" ? v : fallback);
  const base = pick(flat.padding, 0);
  const padTop = pick(flat.paddingTop ?? flat.paddingVertical, base);
  const padBottom = pick(flat.paddingBottom ?? flat.paddingVertical, base);
  const padLeft = pick(flat.paddingLeft ?? flat.paddingStart ?? flat.paddingHorizontal, base);
  const padRight = pick(flat.paddingRight ?? flat.paddingEnd ?? flat.paddingHorizontal, base);
  return (
    <View
      style={[
        style,
        {
          paddingTop: padTop + (wanted.includes("top") ? insets.top : 0),
          paddingRight: padRight + (wanted.includes("right") ? insets.right : 0),
          paddingBottom: padBottom + (wanted.includes("bottom") ? insets.bottom : 0),
          paddingLeft: padLeft + (wanted.includes("left") ? insets.left : 0),
        },
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
