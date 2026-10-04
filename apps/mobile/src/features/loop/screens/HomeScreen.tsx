import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ParkedThought } from "../parkedThoughts";
import { WeekProgress } from "../weeklyGoal";
import { LoopStep } from "../loopPlan";
import { Palette, fonts, typography } from "../../../shared/theme";
import { PrimaryButton } from "../../../shared/ui/Buttons";
import { LoopStrip } from "../ui/LoopStrip";

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
  return now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

// P04 / P05. P05 = first day of the ISO week with zero sessions met — "A new week."
// Never shows zeros as failure.
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
  onUseParkedThought,
  week,
  todayMinutes,
  isNewWeek,
  onStart,
  onOpenSettings,
  onOpenWeek,
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
  onUseParkedThought: (thought: ParkedThought) => void;
  week: WeekProgress;
  todayMinutes: number;
  isNewWeek: boolean;
  onStart: () => void;
  onOpenSettings: () => void;
  onOpenWeek: () => void;
}) {
  const firstFocus = plan.find((s) => s.kind === "focus");
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]}>
      <View style={styles.topRow}>
        <Text style={[styles.date, { color: colors.muted }]}>{formatDate(now)}</Text>
        <View style={styles.icons}>
          <Pressable
            onPress={onOpenWeek}
            accessibilityRole="button"
            accessibilityLabel="Open week and history"
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
            accessibilityLabel="Open settings"
            hitSlop={8}
            style={styles.iconButton}
          >
            <View style={styles.slidersIcon}>
              <View style={[styles.sliderLine, { backgroundColor: colors.ink }]} />
              <View style={[styles.sliderDot, { backgroundColor: colors.ink, left: 4 }]} />
              <View style={[styles.sliderLine, { backgroundColor: colors.ink }]} />
              <View style={[styles.sliderDot, { backgroundColor: colors.ink, left: 12 }]} />
            </View>
          </Pressable>
        </View>
      </View>

      {isNewWeek ? (
        <View style={styles.hero}>
          <Text style={[styles.headline, { color: colors.ink }]}>A new week.</Text>
          <Text style={[styles.sub, { color: colors.muted }]}>
            Any {week.goalDays} of 7 days counts.{" "}
            <Text onPress={onOpenSettings} style={{ color: colors.ink2 }}>
              change
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
            Focus {focusNumber} of {totalFocus}
          </Text>
          <Text style={[styles.sub, { color: colors.muted }]}>
            {loopSummaryLabel(plan)} · Loop ends {formatClock(loopEndsAtMs)} ·{" "}
            <Text onPress={onOpenSettings} style={{ color: colors.ink2 }}>
              change
            </Text>
          </Text>
          <LoopStrip steps={plan} currentIndex={0} colors={colors} />
        </View>
      )}

      <TextInput
        value={intention}
        onChangeText={onIntentionChange}
        placeholder="What will you work on?"
        placeholderTextColor={colors.faint}
        accessibilityLabel="Intention for this focus (optional)"
        style={[styles.intention, { color: colors.ink, borderBottomColor: colors.rule }]}
      />

      {parked != null ? (
        <View style={[styles.parkedCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.parkedLabel, { color: colors.faint }]}>PARKED EARLIER</Text>
          <Text style={[styles.parkedText, { color: colors.ink2 }]} numberOfLines={2}>
            {parked.text}
          </Text>
          <Pressable
            onPress={() => onUseParkedThought(parked)}
            accessibilityRole="button"
            accessibilityLabel={`Use parked thought: ${parked.text}`}
            hitSlop={8}
          >
            <Text style={[styles.useThis, { color: colors.focusText }]}>use this</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.summaryRow}>
        <Text style={[styles.summary, { color: colors.muted }]}>
          Today {todayMinutes} min · Week {week.daysMet} of {week.goalDays} days
          {week.goalMet ? " · Goal met" : ""}
        </Text>
      </View>

      <PrimaryButton
        label="Start"
        duration={firstFocus ? formatDuration(firstFocus.durationSeconds) : undefined}
        onPress={onStart}
        colors={colors}
        accessibilityLabel={`Start a ${firstFocus ? Math.round(firstFocus.durationSeconds / 60) : 0}-minute focus`}
      />
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
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  date: { ...typography.label, textTransform: "none", fontWeight: "500" },
  icons: { flexDirection: "row", gap: 8 },
  iconButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  chartIcon: { flexDirection: "row", alignItems: "flex-end", gap: 3, height: 16 },
  bar: { width: 4, borderRadius: 1 },
  slidersIcon: { width: 18, height: 14, justifyContent: "space-between" },
  sliderLine: { height: 1.5, width: "100%" },
  sliderDot: { position: "absolute", width: 5, height: 5, borderRadius: 2.5, top: -2 },
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
  parkedCard: { borderRadius: 16, padding: 16, gap: 6 },
  parkedLabel: { ...typography.caption, fontWeight: "600", letterSpacing: 1 },
  parkedText: { ...typography.userWords, fontSize: 22, lineHeight: 27 },
  useThis: { ...typography.label, marginTop: 4 },
  summaryRow: { marginTop: "auto" },
  summary: { ...typography.caption, fontSize: 14 },
});
