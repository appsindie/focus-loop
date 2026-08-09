import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, typography } from "../../shared/theme";
import { formatTime } from "./formatTime";
import { TimerState } from "./useTimer";

type TimerScreenProps = {
  remainingSeconds: number;
  state: TimerState;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
};

export function TimerScreen({
  remainingSeconds,
  state,
  onPause,
  onResume,
  onCancel,
}: TimerScreenProps) {
  const isRunning = state === "running";
  const isCompleted = state === "completed";
  const title = isCompleted ? "Completed" : isRunning ? "Focusing" : "Paused";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.ring}>
        <Text style={styles.timerText} allowFontScaling>
          {formatTime(remainingSeconds)}
        </Text>
      </View>

      {isCompleted ? (
        <Text style={styles.completedText} allowFontScaling>
          Focus session complete
        </Text>
      ) : (
        <View style={styles.controls}>
          {isRunning ? (
            <Pressable
              accessibilityLabel="Pause focus session"
              accessibilityRole="button"
              onPress={onPause}
              style={[styles.controlButton, { backgroundColor: colors.accent }]}
            >
              <Text style={styles.controlButtonText} allowFontScaling>
                Pause
              </Text>
            </Pressable>
          ) : (
            <Pressable
              accessibilityLabel="Resume focus session"
              accessibilityRole="button"
              onPress={onResume}
              style={[styles.controlButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.controlButtonText} allowFontScaling>
                Resume
              </Text>
            </Pressable>
          )}

          <Pressable
            accessibilityLabel="Cancel focus session"
            accessibilityRole="button"
            onPress={onCancel}
            style={[styles.controlButton, { backgroundColor: colors.danger }]}
          >
            <Text style={styles.controlButtonText} allowFontScaling>
              Cancel
            </Text>
          </Pressable>
        </View>
      )}
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
  ring: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 12,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  timerText: {
    ...typography.display,
    color: colors.text,
  },
  controls: {
    flexDirection: "row",
    gap: spacing.md,
  },
  controlButton: {
    minWidth: 120,
    minHeight: 56,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  controlButtonText: {
    ...typography.headline,
    color: colors.primaryText,
  },
  completedText: {
    ...typography.body,
    color: colors.textMuted,
  },
});
