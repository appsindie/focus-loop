import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "../../../shared/ui/SafeAreaView";
import { FocusSession } from "../SessionLog";
import { LoopStep } from "../loopPlan";
import { WeekProgress } from "../weeklyGoal";
import { t } from "../../../i18n";
import { Palette, typography } from "../../../shared/theme";
import { TABLET_PADDING, useIsTablet } from "../../../shared/layout";
import { PrimaryButton, SecondaryButton } from "../../../shared/ui/Buttons";
import { LoopStrip } from "../ui/LoopStrip";

const OUTCOME_LABEL: Record<string, () => string> = {
  finished: () => t("Finished"),
  "moved-forward": () => t("Moved forward"),
  "got-stuck": () => t("Got stuck"),
};

// P12: total focus minutes, full strip, one row per focus (intention + outcome),
// week-goal line. Primary Long break, secondary Share my week. Leaving this
// screen is an interstitial trigger — the first loop ever opens the paywall.
export function LoopDoneScreen({
  colors,
  sessionsInLoop,
  steps,
  week,
  longBreakSeconds,
  onStartLongBreak,
  onShareWeek,
  onSkipLongBreak,
}: {
  colors: Palette;
  sessionsInLoop: FocusSession[];
  steps: readonly LoopStep[];
  week: WeekProgress;
  longBreakSeconds: number;
  onStartLongBreak: () => void;
  onShareWeek: () => void;
  onSkipLongBreak: () => void;
}) {
  const totalMinutes = Math.round(
    sessionsInLoop.reduce((sum, s) => sum + s.focusedSeconds, 0) / 60,
  );
  const lb = `${Math.floor(longBreakSeconds / 60)}:${String(longBreakSeconds % 60).padStart(2, "0")}`;

  const isTablet = useIsTablet();
  return (
    <SafeAreaView
      style={[
        styles.root,
        { backgroundColor: colors.bg },
        isTablet && { paddingHorizontal: TABLET_PADDING },
      ]}
    >
      <Text style={[styles.kicker, { color: colors.break }]}>{t("LOOP COMPLETE")}</Text>
      <Text style={[styles.headline, { color: colors.ink }]}>
        {t("{minutes} min of focus", { minutes: totalMinutes })}
      </Text>
      <LoopStrip steps={steps} currentIndex={steps.length} colors={colors} />

      <View style={styles.rows}>
        {sessionsInLoop.map((s, i) => (
          <View
            key={s.id}
            style={[styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: colors.rule }]}
          >
            <Text style={[styles.rowIndex, { color: colors.faint }]}>{i + 1}</Text>
            <Text style={[styles.rowIntention, { color: colors.ink }]} numberOfLines={1}>
              {s.intention ?? t("No note")}
            </Text>
            <Text style={[styles.rowOutcome, { color: colors.muted }]}>
              {OUTCOME_LABEL[s.outcome ?? ""]?.() ?? ""}
            </Text>
          </View>
        ))}
      </View>

      <Text style={[styles.weekLine, { color: colors.muted }]}>
        {t("{daysMet} of {goalDays} days this week", {
          daysMet: week.daysMet,
          goalDays: week.goalDays,
        })}
        {week.goalMet ? t(" — goal met") : ""}
      </Text>

      <View style={styles.actions}>
        <PrimaryButton
          label={t("Long break {duration}", { duration: lb })}
          onPress={onStartLongBreak}
          colors={colors}
          variant="break"
        />
        <SecondaryButton label={t("Share my week")} onPress={onShareWeek} colors={colors} />
      </View>
      <Text style={[styles.skip, { color: colors.muted }]} onPress={onSkipLongBreak}>
        {t("Done for now")}
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 24, gap: 14 },
  kicker: { ...typography.label, letterSpacing: 2 },
  headline: { ...typography.h1Screen },
  rows: { gap: 0 },
  row: { flexDirection: "row", alignItems: "center", minHeight: 44, gap: 12 },
  rowIndex: { ...typography.caption, width: 18 },
  rowIntention: { ...typography.body, flex: 1 },
  rowOutcome: { ...typography.caption, fontSize: 13 },
  weekLine: { ...typography.body, marginTop: "auto" },
  actions: { gap: 10 },
  skip: { ...typography.body, textAlign: "center", paddingVertical: 8 },
});
