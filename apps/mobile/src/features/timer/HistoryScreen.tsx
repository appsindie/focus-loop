import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, typography } from "../../shared/theme";
import { CompletedSession } from "./SessionStore";
import { formatTime } from "./formatTime";

type HistoryScreenProps = {
  sessions: CompletedSession[];
  onBack: () => void;
};

function formatSessionDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function HistoryScreen({ sessions, onBack }: HistoryScreenProps) {
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime(),
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Back to home"
          accessibilityRole="button"
          onPress={onBack}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText} allowFontScaling>
            Back
          </Text>
        </Pressable>
        <Text style={styles.title} allowFontScaling>
          History
        </Text>
        <View style={styles.backButton} />
      </View>

      {sortedSessions.length === 0 ? (
        <Text style={styles.emptyText} allowFontScaling>
          No completed sessions yet.
        </Text>
      ) : (
        <FlatList
          accessibilityLabel="Completed focus sessions"
          data={sortedSessions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.rowDuration} allowFontScaling>
                {formatTime(item.durationSeconds)}
              </Text>
              <Text style={styles.rowDate} allowFontScaling>
                {formatSessionDate(item.endedAt)}
              </Text>
            </View>
          )}
        />
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
  },
  backButton: {
    minWidth: 48,
    minHeight: 48,
    justifyContent: "center",
  },
  backButtonText: {
    ...typography.body,
    color: colors.primary,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xl,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    minHeight: 56,
  },
  rowDuration: {
    ...typography.headline,
    color: colors.text,
  },
  rowDate: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
