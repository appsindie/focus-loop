import { Pressable, StyleSheet, Text, View } from "react-native";
import { t } from "../../i18n";
import { Palette, radii, typography } from "../theme";

// §3 buttons: primary 64h pill ink fill (may carry a right-aligned duration in
// primary-accent); break = primary with break fill; secondary = 1.5px ink outline;
// text = muted, no border — destructive/exit actions are text buttons only.
export function PrimaryButton({
  label,
  duration,
  onPress,
  colors,
  variant = "ink",
  accessibilityLabel,
}: {
  label: string;
  duration?: string | undefined;
  onPress: () => void;
  colors: Palette;
  variant?: "ink" | "break" | "light";
  accessibilityLabel?: string;
}) {
  const fill = variant === "break" ? colors.break : variant === "light" ? "#FFFFFF" : colors.ink;
  const text =
    variant === "light" ? "#141210" : variant === "break" ? colors.onBreak : colors.onPrimary;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        styles.primary,
        { backgroundColor: fill, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <Text style={[styles.primaryLabel, { color: text }]}>{label}</Text>
      {duration != null ? (
        <Text style={[styles.primaryDuration, { color: colors.primaryAccent }]}>{duration}</Text>
      ) : null}
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
  colors,
  strong = true,
}: {
  label: string;
  onPress: () => void;
  colors: Palette;
  strong?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.secondary,
        {
          borderColor: strong ? colors.ink : colors.rule,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Text style={[styles.secondaryLabel, { color: colors.ink }]}>{label}</Text>
    </Pressable>
  );
}

export function TextButton({
  label,
  onPress,
  colors,
}: {
  label: string;
  onPress: () => void;
  colors: Palette;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => ({
        opacity: pressed ? 0.6 : 1,
        minHeight: 44,
        justifyContent: "center",
      })}
    >
      <Text style={[styles.textLabel, { color: colors.muted }]}>{label}</Text>
    </Pressable>
  );
}

// §3 Display toggle: two 52×44 segments — disc glyph and "12:34".
export function DisplayToggle({
  mode,
  onChange,
  colors,
}: {
  mode: "disc" | "numbers";
  onChange: (mode: "disc" | "numbers") => void;
  colors: Palette;
}) {
  return (
    <View style={[styles.toggle, { borderColor: colors.rule }]} accessibilityRole="radiogroup">
      <Pressable
        onPress={() => onChange("disc")}
        accessibilityRole="button"
        accessibilityLabel={t("Show time as a disc")}
        accessibilityState={{ selected: mode === "disc" }}
        style={[styles.segment, mode === "disc" && { backgroundColor: colors.chip }]}
      >
        <View
          style={[styles.discGlyph, { borderColor: mode === "disc" ? colors.ink : colors.muted }]}
        />
      </Pressable>
      <Pressable
        onPress={() => onChange("numbers")}
        accessibilityRole="button"
        accessibilityLabel={t("Show time as numbers")}
        accessibilityState={{ selected: mode === "numbers" }}
        style={[styles.segment, mode === "numbers" && { backgroundColor: colors.chip }]}
      >
        <Text
          style={[styles.segmentLabel, { color: mode === "numbers" ? colors.ink : colors.muted }]}
        >
          12:34
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  primary: {
    height: 64,
    borderRadius: radii.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 10,
  },
  primaryLabel: { ...typography.title, fontSize: 18 },
  primaryDuration: { ...typography.body, fontWeight: "600", marginLeft: "auto" },
  secondary: {
    height: 54,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  secondaryLabel: { ...typography.body, fontWeight: "600" },
  textLabel: { ...typography.body, textAlign: "center" },
  toggle: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: radii.pill,
    overflow: "hidden",
  },
  segment: { width: 52, height: 44, alignItems: "center", justifyContent: "center" },
  segmentLabel: { fontSize: 13, fontWeight: "600", fontVariant: ["tabular-nums"] },
  discGlyph: { width: 16, height: 16, borderRadius: 8, borderWidth: 2 },
});
