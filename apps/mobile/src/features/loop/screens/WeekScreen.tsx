import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FocusSession } from "../SessionLog";
import { WeekProgress } from "../weeklyGoal";
import { WEEKDAY_LABELS, computeWeekTotals, weekInsight } from "../weekStats";
import { Palette, typography } from "../../../shared/theme";
import { ProgressTabs } from "./ProgressTabs";

const BAR_MAX_HEIGHT = 120;

// P17: week progress without streak shame — "N of G days", per-day minutes
// bars, totals, one insight line. Read-only per J6 SCR-week.
export function WeekScreen({
  sessions,
  week,
  now,
  onBack,
  onHistory,
  onShare,
  colors,
}: {
  sessions: FocusSession[];
  week: WeekProgress;
  now: Date;
  onBack: () => void;
  onHistory: () => void;
  onShare: () => void;
  colors: Palette;
}) {
  const totals = useMemo(() => computeWeekTotals(sessions, week), [sessions, week]);
  const insight = useMemo(() => weekInsight(week, totals, now), [week, totals, now]);
  const maxDaySeconds = Math.max(1, ...week.days.map((d) => d.focusedSeconds));
  const totalMinutes = Math.round(totals.totalSeconds / 60);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to home"
          onPress={onBack}
          hitSlop={8}
          style={styles.back}
        >
          <Text style={[styles.backText, { color: colors.ink }]}>Back</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.ink }]}>Your week</Text>
        <View style={styles.back} />
      </View>
      <ProgressTabs active="week" onWeek={() => {}} onHistory={onHistory} colors={colors} />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.headlineRow}>
          <Text style={[styles.headline, { color: colors.ink }]}>
            {week.daysMet} of {week.goalDays} days
          </Text>
          {week.goalMet ? (
            <View style={[styles.goalChip, { backgroundColor: colors.break }]}>
              <Text style={[styles.goalChipText, { color: colors.onBreak }]}>Goal met</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.chart}>
          {week.days.map((day, index) => {
            const height = Math.max(
              4,
              Math.round((day.focusedSeconds / maxDaySeconds) * BAR_MAX_HEIGHT),
            );
            const minutes = Math.round(day.focusedSeconds / 60);
            return (
              <View key={day.dayTimestamp} style={styles.barCol}>
                <Text style={[styles.barMinutes, { color: colors.muted }]}>
                  {minutes > 0 ? minutes : ""}
                </Text>
                <View
                  style={[
                    styles.bar,
                    {
                      height,
                      backgroundColor: day.met ? colors.focus : colors.track,
                    },
                  ]}
                  accessibilityLabel={`${WEEKDAY_LABELS[index]}: ${minutes} minutes`}
                />
                <Text style={[styles.barLabel, { color: colors.muted }]}>
                  {WEEKDAY_LABELS[index]}
                </Text>
              </View>
            );
          })}
        </View>
        <View
          style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.rule }]}
        >
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.ink }]}>{totalMinutes}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>min focused</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.ink }]}>{totals.finished}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>finished</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.ink }]}>{totals.movedForward}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>moved forward</Text>
          </View>
        </View>
        <Text style={[styles.insight, { color: colors.ink2 }]}>{insight}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Share my week"
          onPress={onShare}
          style={[styles.shareButton, { backgroundColor: colors.ink }]}
        >
          <Text style={[styles.shareText, { color: colors.onPrimary }]}>Share my week</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 24 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  back: { width: 48, minHeight: 44, justifyContent: "center" },
  backText: { ...typography.body },
  title: { ...typography.title, flex: 1, textAlign: "center" },
  body: { paddingBottom: 32 },
  headlineRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  headline: { ...typography.h1Screen },
  goalChip: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  goalChipText: { ...typography.label, fontSize: 12 },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  barCol: { alignItems: "center", width: 36 },
  barMinutes: { ...typography.caption, fontSize: 10, marginBottom: 4 },
  bar: { width: 22, borderRadius: 6 },
  barLabel: { ...typography.caption, marginTop: 6 },
  statsCard: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 18,
    marginBottom: 16,
  },
  stat: { flex: 1, alignItems: "center" },
  statValue: { ...typography.title },
  statLabel: { ...typography.caption, marginTop: 2 },
  insight: { ...typography.body, fontSize: 15, marginBottom: 24 },
  shareButton: {
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  shareText: { ...typography.label },
});
