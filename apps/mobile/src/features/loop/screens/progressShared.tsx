import { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FocusSession } from "../SessionLog";
import { WeekProgress } from "../weeklyGoal";
import { WeekTotals, computeWeekTotals, weekInsight, weekdayLabels } from "../weekStats";
import { locale, t } from "../../../i18n";
import { Palette, typography } from "../../../shared/theme";
import { TABLET_PADDING } from "../../../shared/layout";

const BAR_MAX_HEIGHT = 120;

const OUTCOME_LABEL: Record<string, () => string> = {
  finished: () => t("Finished"),
  "moved-forward": () => t("Moved forward"),
  "got-stuck": () => t("Got stuck"),
};

export type DayGroup = { dayLabel: string; items: FocusSession[] };

export function groupByDay(sessions: FocusSession[]): DayGroup[] {
  const groups = new Map<string, FocusSession[]>();
  const sorted = [...sessions].sort(
    (a, b) => new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime(),
  );
  for (const s of sorted) {
    const d = new Date(s.endedAt);
    const key = d.toLocaleDateString(locale(), {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    const list = groups.get(key);
    if (list) {
      list.push(s);
    } else {
      groups.set(key, [s]);
    }
  }
  return [...groups.entries()].map(([dayLabel, items]) => ({ dayLabel, items }));
}

function formatClock(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function rowText(s: FocusSession): { main: string; meta: string } {
  const minutes = Math.round(s.focusedSeconds / 60);
  const intention = s.intention ?? t("No note");
  const outcome = OUTCOME_LABEL[s.outcome ?? ""]?.() ?? "";
  const ended = s.partial ? t(" · Ended early") : "";
  return {
    main: `${formatClock(s.endedAt)} · ${intention}`,
    meta: t("{minutes} min", { minutes }) + (outcome ? ` · ${outcome}` : "") + ended,
  };
}

// T04 right column: day-grouped session rows (free tier already cut off by caller).
export function SessionDayList({
  groups,
  isPlus,
  colors,
}: {
  groups: DayGroup[];
  isPlus: boolean;
  colors: Palette;
}) {
  return (
    <FlatList
      data={groups}
      keyExtractor={(g) => g.dayLabel}
      renderItem={({ item }) => (
        <View style={styles.group}>
          <Text style={[styles.dayLabel, { color: colors.muted }]}>{item.dayLabel}</Text>
          {item.items.map((s) => {
            const { main, meta } = rowText(s);
            return (
              <View key={s.id} style={[styles.row, { borderBottomColor: colors.rule }]}>
                <Text style={[styles.rowMain, { color: s.intention ? colors.ink : colors.muted }]}>
                  {main}
                </Text>
                <Text style={[styles.rowMeta, { color: colors.muted }]}>{meta}</Text>
              </View>
            );
          })}
        </View>
      )}
      ListFooterComponent={
        isPlus ? null : (
          <Text style={[styles.footer, { color: colors.muted }]}>{t("See all with Plus")}</Text>
        )
      }
    />
  );
}

// P17 left column: "N of G days" + goal chip, per-day bars, stat card, insight,
// Share. Shared between the phone body and the T04 two-column layout.
export function WeekCard({
  week,
  totals,
  insight,
  onShare,
  colors,
}: {
  week: WeekProgress;
  totals: WeekTotals;
  insight: string;
  onShare: () => void;
  colors: Palette;
}) {
  const maxDaySeconds = Math.max(1, ...week.days.map((d) => d.focusedSeconds));
  const totalMinutes = Math.round(totals.totalSeconds / 60);
  const dayLabels = weekdayLabels();
  return (
    <View>
      <View style={styles.headlineRow}>
        <Text style={[styles.headline, { color: colors.ink }]}>
          {t("{daysMet} of {goalDays} days", { daysMet: week.daysMet, goalDays: week.goalDays })}
        </Text>
        {week.goalMet ? (
          <View style={[styles.goalChip, { backgroundColor: colors.break }]}>
            <Text style={[styles.goalChipText, { color: colors.onBreak }]}>{t("Goal met")}</Text>
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
                accessibilityLabel={t("{day}: {minutes} minutes", {
                  day: dayLabels[index] ?? "",
                  minutes,
                })}
              />
              <Text style={[styles.barLabel, { color: colors.muted }]}>{dayLabels[index]}</Text>
            </View>
          );
        })}
      </View>
      <View
        style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.rule }]}
      >
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.ink }]}>{totalMinutes}</Text>
          <Text style={[styles.statLabel, { color: colors.muted }]}>{t("min focused")}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.ink }]}>{totals.finished}</Text>
          <Text style={[styles.statLabel, { color: colors.muted }]}>{t("finished")}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.ink }]}>{totals.movedForward}</Text>
          <Text style={[styles.statLabel, { color: colors.muted }]}>{t("moved forward")}</Text>
        </View>
      </View>
      <Text style={[styles.insight, { color: colors.ink2 }]}>{insight}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("Share my week")}
        onPress={onShare}
        style={[styles.shareButton, { backgroundColor: colors.ink }]}
      >
        <Text style={[styles.shareText, { color: colors.onPrimary }]}>{t("Share my week")}</Text>
      </Pressable>
    </View>
  );
}

// T04 "Week and history": the two phone tabs merged — week card left, the
// grouped session list right (free tier keeps the 7-day window + Plus footer).
export function TabletProgressBody({
  sessions,
  week,
  isPlus,
  now,
  title,
  onBack,
  onShare,
  colors,
}: {
  sessions: FocusSession[];
  week: WeekProgress;
  isPlus: boolean;
  now: Date;
  title: string;
  onBack: () => void;
  onShare: () => void;
  colors: Palette;
}) {
  const cutoff = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  const visible = isPlus ? sessions : sessions.filter((s) => Date.parse(s.endedAt) >= cutoff);
  const groups = useMemo(() => groupByDay(visible), [visible]);
  const totals = useMemo(() => computeWeekTotals(sessions, week), [sessions, week]);
  const insight = useMemo(() => weekInsight(week, totals, now), [week, totals, now]);

  return (
    <SafeAreaView
      style={[styles.tabletRoot, { backgroundColor: colors.bg, padding: TABLET_PADDING }]}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("Back to home")}
          onPress={onBack}
          hitSlop={8}
          style={styles.back}
        >
          <Text style={[styles.backText, { color: colors.ink }]}>{t("Back")}</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.ink }]}>{title}</Text>
        <View style={styles.back} />
      </View>
      <View style={styles.columns}>
        <View style={styles.colLeft}>
          <WeekCard
            week={week}
            totals={totals}
            insight={insight}
            onShare={onShare}
            colors={colors}
          />
        </View>
        <View style={styles.colRight}>
          {groups.length === 0 ? (
            <Text style={[styles.empty, { color: colors.muted }]}>{t("No sessions yet.")}</Text>
          ) : (
            <SessionDayList groups={groups} isPlus={isPlus} colors={colors} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tabletRoot: { flex: 1 },
  columns: { flex: 1, flexDirection: "row", gap: 32 },
  colLeft: { flex: 1 },
  colRight: { flex: 1.2 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  back: { width: 48, minHeight: 44, justifyContent: "center" },
  backText: { ...typography.body },
  title: { ...typography.title, flex: 1, textAlign: "center" },
  empty: { ...typography.body, textAlign: "center", marginTop: 48 },
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
  group: { marginBottom: 20 },
  dayLabel: { ...typography.label, marginBottom: 4 },
  row: { minHeight: 54, justifyContent: "center", borderBottomWidth: 1, paddingVertical: 8 },
  rowMain: { ...typography.body, fontWeight: "500" },
  rowMeta: { ...typography.caption, marginTop: 2 },
  footer: { ...typography.caption, fontSize: 14, textAlign: "center", paddingVertical: 20 },
});
