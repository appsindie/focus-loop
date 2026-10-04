import { Pressable, StyleSheet, Text, View } from "react-native";
import { t } from "../../../i18n";
import { Palette, typography } from "../../../shared/theme";

// P17/P18 share a segmented header — "Week | History" per J6 internal nav.
export function ProgressTabs({
  active,
  onWeek,
  onHistory,
  colors,
}: {
  active: "week" | "history";
  onWeek: () => void;
  onHistory: () => void;
  colors: Palette;
}) {
  const tab = (key: "week" | "history", label: string, onPress: () => void) => {
    const selected = active === key;
    return (
      <Pressable
        key={key}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={t("{label} tab", { label })}
        onPress={onPress}
        style={[
          styles.tab,
          {
            backgroundColor: selected ? colors.ink : "transparent",
          },
        ]}
      >
        <Text style={[styles.tabText, { color: selected ? colors.onPrimary : colors.muted }]}>
          {label}
        </Text>
      </Pressable>
    );
  };
  return (
    <View style={[styles.track, { backgroundColor: colors.chip }]} accessibilityRole="tablist">
      {tab("week", t("Week"), onWeek)}
      {tab("history", t("History"), onHistory)}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    borderRadius: 999,
    padding: 3,
    alignSelf: "center",
    marginBottom: 16,
  },
  tab: { borderRadius: 999, paddingHorizontal: 18, paddingVertical: 7 },
  tabText: { ...typography.label, fontSize: 13 },
});
