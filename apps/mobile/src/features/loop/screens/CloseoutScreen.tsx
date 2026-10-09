import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "../../../shared/ui/SafeAreaView";
import { SessionOutcome } from "../SessionLog";
import { LoopStep } from "../loopPlan";
import { t } from "../../../i18n";
import { Palette, typography } from "../../../shared/theme";
import { TABLET_PADDING, useIsTablet } from "../../../shared/layout";
import { PrimaryButton, TextButton } from "../../../shared/ui/Buttons";

const OUTCOMES: { id: SessionOutcome; label: () => string }[] = [
  { id: "finished", label: () => t("Finished it") },
  { id: "moved-forward", label: () => t("Moved it forward") },
  { id: "got-stuck", label: () => t("Got stuck — still counts") },
];

// P10: header FOCUS N DONE · MIN, optional single-choice outcome, auto-break
// toggle, primary Start break, text "Keep going, 10 more minutes". No ad here.
export function CloseoutScreen({
  colors,
  focusNumber,
  focusedSeconds,
  intention,
  outcome,
  onOutcome,
  autoStartBreaks,
  onAutoStartBreaks,
  nextStep,
  onStartBreak,
  onKeepGoing,
}: {
  colors: Palette;
  focusNumber: number;
  focusedSeconds: number;
  intention: string | null;
  outcome: SessionOutcome | null;
  onOutcome: (outcome: SessionOutcome | null) => void;
  autoStartBreaks: boolean;
  onAutoStartBreaks: (enabled: boolean) => void;
  nextStep: LoopStep | null;
  onStartBreak: () => void;
  onKeepGoing: () => void;
}) {
  const minutes = Math.round(focusedSeconds / 60);
  const breakLabel =
    nextStep?.kind === "break"
      ? t("Start break {duration}", {
          duration: `${Math.floor(nextStep.durationSeconds / 60)}:${String(
            nextStep.durationSeconds % 60,
          ).padStart(2, "0")}`,
        })
      : t("Continue");

  const isTablet = useIsTablet();
  return (
    <SafeAreaView
      style={[
        styles.root,
        { backgroundColor: colors.bg },
        isTablet && { paddingHorizontal: TABLET_PADDING },
      ]}
    >
      <Text style={[styles.kicker, { color: colors.focusText }]}>
        {t("FOCUS {n} DONE · {minutes} MIN", { n: focusNumber, minutes })}
      </Text>
      {intention != null && intention !== "" ? (
        <Text style={[styles.intention, { color: colors.ink2 }]} numberOfLines={2}>
          {intention}
        </Text>
      ) : null}

      <Text style={[styles.prompt, { color: colors.ink }]}>{t("How did it go?")}</Text>
      <View style={styles.outcomes}>
        {OUTCOMES.map((o) => {
          const selected = outcome === o.id;
          const label = o.label();
          return (
            <Pressable
              key={o.id}
              onPress={() => onOutcome(selected ? null : o.id)}
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.outcomeRow,
                {
                  borderColor: selected ? colors.ink : colors.rule,
                  backgroundColor: selected ? colors.chip : "transparent",
                },
                pressed && { opacity: 0.55 },
              ]}
            >
              <Text style={[styles.outcomeLabel, { color: colors.ink }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.toggleRow, { borderTopColor: colors.rule }]}>
        <Text style={[styles.toggleLabel, { color: colors.ink }]}>
          {t("Start breaks automatically")}
        </Text>
        <Switch
          value={autoStartBreaks}
          onValueChange={onAutoStartBreaks}
          accessibilityLabel={t("Start breaks automatically")}
          trackColor={{ true: colors.break, false: colors.track }}
          thumbColor="#FFFFFF"
        />
      </View>

      <View style={styles.actions}>
        <PrimaryButton label={breakLabel} onPress={onStartBreak} colors={colors} variant="break" />
        <TextButton
          label={t("Keep going, 10 more minutes")}
          onPress={onKeepGoing}
          colors={colors}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 24, gap: 14 },
  kicker: { ...typography.label, letterSpacing: 1.5 },
  intention: { ...typography.userWords, marginTop: 4 },
  prompt: { ...typography.h1Screen, fontSize: 30, marginTop: 12 },
  outcomes: { gap: 10 },
  outcomeRow: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    minHeight: 54,
    justifyContent: "center",
  },
  outcomeLabel: { ...typography.body, fontWeight: "500" },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    paddingTop: 16,
    marginTop: "auto",
    minHeight: 54,
  },
  toggleLabel: { ...typography.body },
  actions: { gap: 4, marginTop: 8 },
});
