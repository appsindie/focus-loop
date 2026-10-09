import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "../../shared/ui/SafeAreaView";
import { t } from "../../i18n";
import { Palette, radii, spacing, typography } from "../../shared/theme";
import { TABLET_PADDING, useIsTablet } from "../../shared/layout";
import {
  RHYTHM_BOUNDS,
  RHYTHM_PRESET_NAMES,
  Rhythm,
  RhythmPresetId,
  loopDurationSeconds,
  loopSummary,
  resolveRhythm,
} from "../loop/rhythm";
import { buildLoopPlan } from "../loop/loopPlan";
import { LoopStrip } from "../loop/ui/LoopStrip";
import { Settings } from "./SettingsStore";

type RhythmScreenProps = {
  colors: Palette;
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onBack: () => void;
};

const PRESET_ORDER: Exclude<RhythmPresetId, "custom">[] = ["classic", "gentle", "deep-work"];

const PRESET_SUB: Record<Exclude<RhythmPresetId, "custom">, () => string> = {
  classic: () => t("25 focus · 5 break · 4 rounds"),
  gentle: () => t("15 focus · 5 break · good for hard days"),
  "deep-work": () => t("50 focus · 10 break · 3 rounds"),
};

function StepperRow({
  colors,
  label,
  unit,
  value,
  min,
  max,
  onChange,
}: {
  colors: Palette;
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <View style={styles.stepperRow}>
      <Text style={[styles.stepperLabel, { color: colors.ink }]} allowFontScaling>
        {label}
      </Text>
      <View style={styles.stepperControls}>
        <Pressable
          onPress={() => onChange(Math.max(min, value - 1))}
          accessibilityRole="button"
          accessibilityLabel={t("Decrease {label}", { label })}
          hitSlop={8}
          style={({ pressed }) => [styles.stepButton, pressed && { opacity: 0.55 }]}
        >
          <Text style={[styles.stepButtonText, { color: colors.ink }]}>−</Text>
        </Pressable>
        <Text style={[styles.stepValue, { color: colors.ink }]} allowFontScaling>
          {value} {unit}
        </Text>
        <Pressable
          onPress={() => onChange(Math.min(max, value + 1))}
          accessibilityRole="button"
          accessibilityLabel={t("Increase {label}", { label })}
          hitSlop={8}
          style={({ pressed }) => [styles.stepButton, pressed && { opacity: 0.55 }]}
        >
          <Text style={[styles.stepButtonText, { color: colors.ink }]}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

// P21: preset pick + fine-tune steppers, live loop strip and summary. J10-R1 —
// edits save immediately through onChange.
export function RhythmScreen({ colors, settings, onChange, onBack }: RhythmScreenProps) {
  const rhythm = resolveRhythm(settings.rhythmPresetId, settings.customRhythm);
  const totalFocusMinutes = rhythm.rounds * rhythm.focusMinutes;
  const loopMinutes = Math.round(loopDurationSeconds(rhythm) / 60);

  const pickPreset = (id: RhythmPresetId) => {
    onChange({ rhythmPresetId: id });
  };
  const editCustom = (patch: Partial<Rhythm>) => {
    onChange({
      rhythmPresetId: "custom",
      customRhythm: { ...settings.customRhythm, ...patch },
    });
  };

  const isTablet = useIsTablet();
  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: colors.bg },
        isTablet && { paddingHorizontal: TABLET_PADDING },
      ]}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityLabel={t("Back to settings")}
          accessibilityRole="button"
          onPress={onBack}
          hitSlop={8}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.55 }]}
        >
          <Text style={[styles.backButtonText, { color: colors.ink }]} allowFontScaling>
            {t("Back")}
          </Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.ink }]} allowFontScaling>
          {t("Rhythm")}
        </Text>
        <View style={styles.backButton} />
      </View>

      {PRESET_ORDER.map((id) => {
        const selected = settings.rhythmPresetId === id;
        return (
          <Pressable
            key={id}
            onPress={() => pickPreset(id)}
            accessibilityRole="button"
            accessibilityLabel={t("Rhythm preset {name}", {
              name: t(RHYTHM_PRESET_NAMES[id]),
            })}
            accessibilityState={{ selected }}
            style={({ pressed }) => [
              styles.presetRow,
              {
                backgroundColor: colors.surface,
                borderColor: selected ? colors.focus : colors.rule,
              },
              pressed && { opacity: 0.55 },
            ]}
          >
            <Text style={[styles.presetName, { color: colors.ink }]} allowFontScaling>
              {t(RHYTHM_PRESET_NAMES[id])}
            </Text>
            <Text style={[styles.presetSub, { color: colors.muted }]} allowFontScaling>
              {PRESET_SUB[id]()}
            </Text>
          </Pressable>
        );
      })}
      <Pressable
        onPress={() => pickPreset("custom")}
        accessibilityRole="button"
        accessibilityLabel={t("Rhythm preset {name}", { name: t("Custom") })}
        accessibilityState={{ selected: settings.rhythmPresetId === "custom" }}
        style={({ pressed }) => [
          styles.presetRow,
          {
            backgroundColor: colors.surface,
            borderColor: settings.rhythmPresetId === "custom" ? colors.focus : colors.rule,
          },
          pressed && { opacity: 0.55 },
        ]}
      >
        <Text style={[styles.presetName, { color: colors.ink }]} allowFontScaling>
          {t("Custom")}
        </Text>
        <Text style={[styles.presetSub, { color: colors.muted }]} allowFontScaling>
          {t("Your own focus, breaks and rounds")}
        </Text>
      </Pressable>

      <View
        style={[styles.fineTune, { backgroundColor: colors.surface, borderColor: colors.rule }]}
        accessibilityLabel={t("Fine-tune rhythm")}
      >
        <Text style={[styles.fineTuneTitle, { color: colors.ink }]} allowFontScaling>
          {t("Fine-tune")}
        </Text>
        <StepperRow
          colors={colors}
          label={t("Focus")}
          unit={t("min")}
          value={rhythm.focusMinutes}
          min={RHYTHM_BOUNDS.focusMinutes.min}
          max={RHYTHM_BOUNDS.focusMinutes.max}
          onChange={(focusMinutes) => editCustom({ focusMinutes })}
        />
        <StepperRow
          colors={colors}
          label={t("Break")}
          unit={t("min")}
          value={rhythm.breakMinutes}
          min={RHYTHM_BOUNDS.breakMinutes.min}
          max={RHYTHM_BOUNDS.breakMinutes.max}
          onChange={(breakMinutes) => editCustom({ breakMinutes })}
        />
        <StepperRow
          colors={colors}
          label={t("Long break")}
          unit={t("min")}
          value={rhythm.longBreakMinutes}
          min={RHYTHM_BOUNDS.longBreakMinutes.min}
          max={RHYTHM_BOUNDS.longBreakMinutes.max}
          onChange={(longBreakMinutes) => editCustom({ longBreakMinutes })}
        />
        <StepperRow
          colors={colors}
          label={t("Rounds per loop")}
          unit=""
          value={rhythm.rounds}
          min={RHYTHM_BOUNDS.rounds.min}
          max={RHYTHM_BOUNDS.rounds.max}
          onChange={(rounds) => editCustom({ rounds })}
        />
        <LoopStrip colors={colors} steps={buildLoopPlan(rhythm)} currentIndex={-1} />
        <Text style={[styles.loopSummary, { color: colors.ink }]} allowFontScaling>
          {loopSummary(rhythm)} · {t("{focusMin} min of focus", { focusMin: totalFocusMinutes })} ·{" "}
          {t("{total} min total", { total: loopMinutes })}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.lg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  backButton: { minWidth: 48, minHeight: 48, justifyContent: "center" },
  backButtonText: { ...typography.body },
  title: { ...typography.title },
  presetRow: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: 2,
  },
  presetName: { ...typography.headline },
  presetSub: { ...typography.caption },
  fineTune: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  fineTuneTitle: { ...typography.headline, marginBottom: spacing.xs },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
  },
  stepperLabel: { ...typography.body },
  stepperControls: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  stepButton: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  stepButtonText: { fontSize: 22 },
  stepValue: { ...typography.body, minWidth: 64, textAlign: "center" },
  loopSummary: { ...typography.caption, marginTop: spacing.sm },
});
