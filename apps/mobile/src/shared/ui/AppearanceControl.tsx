import { Pressable, StyleSheet, Text, View } from "react-native";
import { t } from "../../i18n";
import type { Appearance } from "../../features/settings/SettingsStore";
import { Palette, radii, typography } from "../theme";
import { selectedStyle, selectedTextColor } from "./selectedStyle";

export const APPEARANCE_OPTIONS: { id: Appearance; label: string }[] = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "system", label: "System" },
];

export function AppearanceControl({
  appearance,
  colors,
  onChange,
}: {
  appearance: Appearance;
  colors: Palette;
  onChange: (appearance: Appearance) => void;
}) {
  return (
    <View style={styles.container} accessibilityRole="radiogroup">
      {APPEARANCE_OPTIONS.map((option) => {
        const selected = option.id === appearance;
        return (
          <Pressable
            key={option.id}
            onPress={() => onChange(option.id)}
            accessibilityRole="button"
            accessibilityLabel={t("{label}: {option}", {
              label: t("Appearance"),
              option: t(option.label),
            })}
            accessibilityState={{ selected }}
            style={({ pressed }) => [
              styles.option,
              selectedStyle(colors, selected),
              { borderRadius: radii.pill },
              pressed && { opacity: 0.55 },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: selectedTextColor(colors, selected) },
                selected && { fontWeight: "600" },
              ]}
              numberOfLines={1}
            >
              {t(option.label)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row" },
  option: {
    flexGrow: 1,
    flexShrink: 0,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  label: { ...typography.caption },
});
