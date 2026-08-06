import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, typography } from "../../shared/theme";

const PRESETS = [15, 25, 45];

type HomeScreenProps = {
  selectedMinutes: number;
  onSelectMinutes: (minutes: number) => void;
  onStart: () => void;
  onOpenSettings: () => void;
  sessionsToday: number;
  streakDays: number;
};

export function HomeScreen({
  selectedMinutes,
  onSelectMinutes,
  onStart,
  onOpenSettings,
  sessionsToday,
  streakDays,
}: HomeScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Focus Loop</Text>
        <Pressable
          accessibilityLabel="Open settings"
          accessibilityRole="button"
          onPress={onOpenSettings}
          style={styles.settingsButton}
        >
          <Text style={styles.settingsButtonText} allowFontScaling>
            Settings
          </Text>
        </Pressable>
      </View>

      <Text style={styles.subtitle}>Choose a session length</Text>

      <View style={styles.presets}>
        {PRESETS.map((minutes) => {
          const isSelected = minutes === selectedMinutes;
          return (
            <Pressable
              key={minutes}
              accessibilityLabel={`${minutes} minutes`}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              onPress={() => onSelectMinutes(minutes)}
              style={[styles.presetButton, isSelected && styles.presetButtonSelected]}
            >
              <Text
                style={[styles.presetText, isSelected && styles.presetTextSelected]}
                allowFontScaling
              >
                {minutes} min
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        accessibilityLabel="Start focus session"
        accessibilityRole="button"
        onPress={onStart}
        style={styles.startButton}
      >
        <Text style={styles.startButtonText} allowFontScaling>
          Start Focus
        </Text>
      </Pressable>

      <View style={styles.stats}>
        <View style={styles.statPill}>
          <Text style={styles.statValue} allowFontScaling>
            {sessionsToday}
          </Text>
          <Text style={styles.statLabel} allowFontScaling>
            today
          </Text>
        </View>
        <View style={styles.statPill}>
          <Text style={styles.statValue} allowFontScaling>
            {streakDays}
          </Text>
          <Text style={styles.statLabel} allowFontScaling>
            day streak
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "absolute",
    top: spacing.xxl,
    left: spacing.lg,
    right: spacing.lg,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  settingsButton: {
    minHeight: 48,
    minWidth: 48,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  settingsButtonText: {
    ...typography.body,
    color: colors.primary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  presets: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  presetButton: {
    minWidth: 80,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  presetButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  presetText: {
    ...typography.body,
    color: colors.text,
  },
  presetTextSelected: {
    color: colors.primaryText,
    fontWeight: "600",
  },
  startButton: {
    minHeight: 56,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  startButtonText: {
    ...typography.headline,
    color: colors.primaryText,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.md,
  },
  statPill: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  statValue: {
    ...typography.headline,
    color: colors.text,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
