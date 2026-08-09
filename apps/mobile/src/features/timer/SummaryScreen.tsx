import { Pressable, StyleSheet, Text, View } from "react-native";
import { useInterstitialAd } from "../ads/useInterstitialAd";
import { colors, radii, spacing, typography } from "../../shared/theme";
import { formatTime } from "./formatTime";

type SummaryScreenProps = {
  durationSeconds: number;
  onStartAnother: () => void;
};

export function SummaryScreen({ durationSeconds, onStartAnother }: SummaryScreenProps) {
  useInterstitialAd();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Session complete</Text>

      <View style={styles.pills}>
        <View style={styles.pill}>
          <Text style={styles.pillValue} allowFontScaling>
            {formatTime(durationSeconds)}
          </Text>
          <Text style={styles.pillLabel} allowFontScaling>
            Focused
          </Text>
        </View>
      </View>

      <Pressable
        accessibilityLabel="Start another focus session"
        accessibilityRole="button"
        onPress={onStartAnother}
        style={styles.startButton}
      >
        <Text style={styles.startButtonText} allowFontScaling>
          Start another
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.xl,
  },
  pills: {
    marginBottom: spacing.xl,
  },
  pill: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  pillValue: {
    ...typography.headline,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  pillLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  startButton: {
    minHeight: 56,
    minWidth: 220,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  startButtonText: {
    ...typography.headline,
    color: colors.primaryText,
  },
});
