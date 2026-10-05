import { useMemo } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ParkedThought } from "../parkedThoughts";
import { WeekProgress } from "../weeklyGoal";
import { LoopStep } from "../loopPlan";
import { locale, t } from "../../../i18n";
import { Palette, fonts, typography } from "../../../shared/theme";
import { PrimaryButton } from "../../../shared/ui/Buttons";
import { GearIcon } from "../../../shared/ui/GearIcon";
import { LoopStrip } from "../ui/LoopStrip";
import { useIsTablet, TABLET_PADDING } from "../../../shared/layout";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `${m}:00` : `${m}:${String(s).padStart(2, "0")}`;
}

function formatClock(ms: number): string {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function formatDate(now: Date): string {
  return now.toLocaleDateString(locale(), {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

type LoopScheduleRow = { key: string; label: string; range: string };

// T01 left column "Rest of today's loop": every step with the clock range it
// would occupy if the loop started now (canvas times are projection, not fact).
function buildLoopSchedule(plan: readonly LoopStep[], focusNumber: number): LoopScheduleRow[] {
  let cursor = Date.now();
  let focusIndex = focusNumber;
  return plan.map((step, i) => {
    const start = cursor;
    const end = start + step.durationSeconds * 1000;
    cursor = end;
    const label =
      step.kind === "focus"
        ? t("Focus {n}", { n: focusIndex++ })
        : step.kind === "break"
          ? t("Break")
          : t("Long break");
    return {
      key: `${step.kind}-${i}`,
      label,
      range: `${formatClock(start)} – ${formatClock(end)}`,
    };
  });
}

// P04 / P05. P05 = first day of the ISO week with zero sessions met — "A new week."
// Never shows zeros as failure. T01: same screen as two columns — loop left,
// day stats + parked + banner right.
export function HomeScreen({
  colors,
  now,
  plan,
  focusNumber,
  totalFocus,
  loopEndsAtMs,
  intention,
  onIntentionChange,
  parked,
  parkedThoughts,
  onUseParkedThought,
  week,
  todayMinutes,
  todayFocusCount,
  isNewWeek,
  onStart,
  onOpenSettings,
  onOpenWeek,
  bannerSlot,
}: {
  colors: Palette;
  now: Date;
  plan: readonly LoopStep[];
  focusNumber: number;
  totalFocus: number;
  loopEndsAtMs: number;
  intention: string;
  onIntentionChange: (value: string) => void;
  parked: ParkedThought | null;
  parkedThoughts: ParkedThought[];
  onUseParkedThought: (thought: ParkedThought) => void;
  week: WeekProgress;
  todayMinutes: number;
  todayFocusCount: number;
  isNewWeek: boolean;
  onStart: () => void;
  onOpenSettings: () => void;
  onOpenWeek: () => void;
  bannerSlot?: React.ReactNode;
}) {
  const isTablet = useIsTablet();
  const firstFocus = plan.find((s) => s.kind === "focus");
  const loopSchedule = useMemo(
    () => (isTablet ? buildLoopSchedule(plan, focusNumber) : []),
    [isTablet, plan, focusNumber],
  );
  const parkedList = useMemo(
    () => (isTablet ? parkedThoughts.filter((t) => t.usedAt === null).slice(-3) : []),
    [isTablet, parkedThoughts],
  );

  const hero = isNewWeek ? (
    <View style={styles.hero}>
      <Text style={[styles.headline, { color: colors.ink }]}>{t("A new week.")}</Text>
      <Text style={[styles.sub, { color: colors.muted }]}>
        {t("Any {goalDays} of 7 days counts.", { goalDays: week.goalDays })}{" "}
        <Text onPress={onOpenSettings} style={{ color: colors.ink2 }}>
          {t("change")}
        </Text>
      </Text>
      <View style={styles.goalStrip}>
        {week.days.map((d, i) => (
          <View
            key={i}
            style={[styles.goalCell, { backgroundColor: d.met ? colors.focus : colors.track }]}
          />
        ))}
      </View>
    </View>
  ) : (
    <View style={styles.hero}>
      <Text style={[styles.headline, { color: colors.ink }]}>
        {t("Focus {n} of {total}", { n: focusNumber, total: totalFocus })}
      </Text>
      <Text style={[styles.sub, { color: colors.muted }]}>
        {loopSummaryLabel(plan)} · {t("Loop ends {endsAt}", { endsAt: formatClock(loopEndsAtMs) })}{" "}
        <Text onPress={onOpenSettings} style={{ color: colors.ink2 }}>
          {t("change")}
        </Text>
      </Text>
      <LoopStrip steps={plan} currentIndex={0} colors={colors} />
    </View>
  );

  const intentionField = (
    <TextInput
      value={intention}
      onChangeText={onIntentionChange}
      placeholder={t("What will you work on?")}
      placeholderTextColor={colors.faint}
      accessibilityLabel={t("Intention for this focus (optional)")}
      style={[styles.intention, { color: colors.ink, borderBottomColor: colors.rule }]}
    />
  );

  const startButton = (
    <PrimaryButton
      label={t("Start")}
      duration={firstFocus ? formatDuration(firstFocus.durationSeconds) : undefined}
      onPress={onStart}
      colors={colors}
      accessibilityLabel={t("Start a {minutes}-minute focus", {
        minutes: firstFocus ? Math.round(firstFocus.durationSeconds / 60) : 0,
      })}
    />
  );

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.bg }, isTablet && { padding: TABLET_PADDING }]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardBody}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.topRow}>
          <Text style={[styles.date, { color: colors.muted }]}>{formatDate(now)}</Text>
          <View style={styles.icons}>
            <Pressable
              onPress={onOpenWeek}
              accessibilityRole="button"
              accessibilityLabel={t("Open week and history")}
              hitSlop={8}
              style={styles.iconButton}
            >
              <View style={styles.chartIcon}>
                <View style={[styles.bar, { height: 6, backgroundColor: colors.ink }]} />
                <View style={[styles.bar, { height: 10, backgroundColor: colors.ink }]} />
                <View style={[styles.bar, { height: 14, backgroundColor: colors.ink }]} />
              </View>
            </Pressable>
            <Pressable
              onPress={onOpenSettings}
              accessibilityRole="button"
              accessibilityLabel={t("Open settings")}
              hitSlop={8}
              style={styles.iconButton}
            >
              <GearIcon size={20} color={colors.ink} />
            </Pressable>
          </View>
        </View>

        {isTablet ? (
          // T01: left column = loop state + intention + rest-of-loop + Start;
          // right column = today/week stats, parked thoughts, banner slot.
          <View style={styles.columns}>
            <View style={styles.colMain}>
              {hero}
              {intentionField}
              {loopSchedule.length > 0 ? (
                <View style={styles.restLoop}>
                  <Text style={[styles.restLoopTitle, { color: colors.faint }]}>
                    {t("REST OF TODAY’S LOOP")}
                  </Text>
                  {loopSchedule.map((row) => (
                    <View key={row.key} style={styles.restLoopRow}>
                      <Text style={[styles.restLoopLabel, { color: colors.ink }]}>{row.label}</Text>
                      <Text style={[styles.restLoopRange, { color: colors.muted }]}>
                        {row.range}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
              <View style={styles.spacer} />
              {startButton}
            </View>
            <View style={styles.colSide}>
              <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.statsLine, { color: colors.ink2 }]}>
                  {t("Today {count} focus · {minutes} min", {
                    count: todayFocusCount,
                    minutes: todayMinutes,
                  })}
                </Text>
                <Text style={[styles.statsLine, { color: colors.ink2 }]}>
                  {t("This week {daysMet} of {goalDays} days", {
                    daysMet: week.daysMet,
                    goalDays: week.goalDays,
                  })}
                  {week.goalMet ? t(" · goal met") : ""}
                </Text>
              </View>
              {parkedList.length > 0 ? (
                <View style={[styles.parkedCard, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.parkedLabel, { color: colors.faint }]}>
                    {t("WAITING FROM LAST TIME")}
                  </Text>
                  {parkedList.map((thought) => (
                    <Pressable
                      key={thought.id}
                      onPress={() => onUseParkedThought(thought)}
                      accessibilityRole="button"
                      accessibilityLabel={t("Use parked thought: {text}", { text: thought.text })}
                      hitSlop={8}
                    >
                      <Text style={[styles.parkedText, { color: colors.ink2 }]} numberOfLines={2}>
                        {thought.text}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
              <View style={styles.spacer} />
              {bannerSlot}
            </View>
          </View>
        ) : (
          <>
            {hero}
            {intentionField}
            {parked != null ? (
              <View style={[styles.parkedCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.parkedLabel, { color: colors.faint }]}>
                  {t("PARKED EARLIER")}
                </Text>
                <Text style={[styles.parkedText, { color: colors.ink2 }]} numberOfLines={2}>
                  {parked.text}
                </Text>
                <Pressable
                  onPress={() => onUseParkedThought(parked)}
                  accessibilityRole="button"
                  accessibilityLabel={t("Use parked thought: {text}", { text: parked.text })}
                  hitSlop={8}
                >
                  <Text style={[styles.useThis, { color: colors.focusText }]}>{t("use this")}</Text>
                </Pressable>
              </View>
            ) : null}
            <View style={styles.summaryRow}>
              <Text style={[styles.summary, { color: colors.muted }]}>
                {t("Today {minutes} min · Week {daysMet} of {goalDays} days", {
                  minutes: todayMinutes,
                  daysMet: week.daysMet,
                  goalDays: week.goalDays,
                })}
                {week.goalMet ? t(" · Goal met") : ""}
              </Text>
            </View>
            {startButton}
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function loopSummaryLabel(plan: readonly LoopStep[]): string {
  // "25/5 ×4 + 15" from the plan itself so it stays right under Custom rhythms.
  const focus = plan.find((s) => s.kind === "focus");
  const brk = plan.find((s) => s.kind === "break");
  const long = plan.find((s) => s.kind === "longBreak");
  const focusCount = plan.filter((s) => s.kind === "focus").length;
  const f = focus ? Math.round(focus.durationSeconds / 60) : 0;
  const b = brk ? Math.round(brk.durationSeconds / 60) : 0;
  const l = long ? Math.round(long.durationSeconds / 60) : 0;
  return `${f}/${b} ×${focusCount} + ${l}`;
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 24, gap: 18 },
  keyboardBody: { flex: 1, gap: 18 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  date: { ...typography.label, textTransform: "none", fontWeight: "500" },
  icons: { flexDirection: "row", gap: 8 },
  iconButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  chartIcon: { flexDirection: "row", alignItems: "flex-end", gap: 3, height: 16 },
  bar: { width: 4, borderRadius: 1 },
  columns: { flex: 1, flexDirection: "row", gap: 32 },
  colMain: { flex: 1.4, gap: 18 },
  colSide: { flex: 1, gap: 16 },
  spacer: { flex: 1 },
  hero: { gap: 10 },
  headline: { ...typography.h1Screen },
  sub: { ...typography.body },
  goalStrip: { flexDirection: "row", gap: 6 },
  goalCell: { flex: 1, height: 8, borderRadius: 4 },
  intention: {
    ...typography.userWords,
    fontFamily: fonts.userWords,
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  restLoop: { gap: 4, marginTop: 4 },
  restLoopTitle: { ...typography.caption, fontWeight: "600", letterSpacing: 1, marginBottom: 4 },
  restLoopRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 7 },
  restLoopLabel: { ...typography.body, fontWeight: "500" },
  restLoopRange: { ...typography.caption, fontSize: 14, alignSelf: "center" },
  statsCard: { borderRadius: 16, padding: 16, gap: 8 },
  statsLine: { ...typography.body, fontSize: 16 },
  parkedCard: { borderRadius: 16, padding: 16, gap: 6 },
  parkedLabel: { ...typography.caption, fontWeight: "600", letterSpacing: 1 },
  parkedText: { ...typography.userWords, fontSize: 22, lineHeight: 27, paddingVertical: 4 },
  useThis: { ...typography.label, marginTop: 4 },
  summaryRow: { marginTop: "auto" },
  summary: { ...typography.caption, fontSize: 14 },
});
