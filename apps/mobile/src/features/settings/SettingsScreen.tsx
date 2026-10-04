import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radii, spacing, typography } from "../../shared/theme";
import { loopSummary, resolveRhythm } from "../loop/rhythm";
import { Appearance, DisplayMode, Settings } from "./SettingsStore";

type SettingsScreenProps = {
  settings: Settings;
  // P20: changes save immediately — the parent persists every patch.
  onChange: (patch: Partial<Settings>) => void;
  onBack: () => void;
};

function Stepper({
  value,
  min,
  max,
  onChange,
  accessibilityLabel,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  accessibilityLabel: string;
}) {
  return (
    <View style={styles.stepper} accessibilityLabel={accessibilityLabel}>
      <Pressable
        onPress={() => onChange(Math.max(min, value - 1))}
        accessibilityRole="button"
        accessibilityLabel={`Decrease ${accessibilityLabel}`}
        hitSlop={8}
        style={styles.stepButton}
      >
        <Text style={styles.stepButtonText}>−</Text>
      </Pressable>
      <Text style={styles.stepValue}>{value}</Text>
      <Pressable
        onPress={() => onChange(Math.min(max, value + 1))}
        accessibilityRole="button"
        accessibilityLabel={`Increase ${accessibilityLabel}`}
        hitSlop={8}
        style={styles.stepButton}
      >
        <Text style={styles.stepButtonText}>+</Text>
      </Pressable>
    </View>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
}) {
  return (
    <View style={styles.segmented} accessibilityLabel={accessibilityLabel}>
      {options.map((o) => {
        const selected = o.id === value;
        return (
          <Pressable
            key={o.id}
            onPress={() => onChange(o.id)}
            accessibilityRole="button"
            accessibilityLabel={`${accessibilityLabel}: ${o.label}`}
            accessibilityState={{ selected }}
            style={[styles.segmentOption, selected && styles.segmentSelected]}
          >
            <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// P20 interim: the full screen order lands in the settings slice; these rows are
// the v1 controls the loop surfaces depend on today.
export function SettingsScreen({ settings, onChange, onBack }: SettingsScreenProps) {
  const rhythm = resolveRhythm(settings.rhythmPresetId, settings.customRhythm);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Back to home"
          accessibilityRole="button"
          onPress={onBack}
          hitSlop={8}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText} allowFontScaling>
            Back
          </Text>
        </Pressable>
        <Text style={styles.title} allowFontScaling>
          Settings
        </Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel} allowFontScaling>
          Show time as
        </Text>
        <Segmented<DisplayMode>
          accessibilityLabel="Show time as"
          options={[
            { id: "disc", label: "Disc" },
            { id: "numbers", label: "Numbers" },
          ]}
          value={settings.displayMode ?? "disc"}
          onChange={(displayMode) => onChange({ displayMode })}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel} allowFontScaling>
          Appearance
        </Text>
        <Segmented<Appearance>
          accessibilityLabel="Appearance"
          options={[
            { id: "system", label: "System" },
            { id: "light", label: "Light" },
            { id: "dark", label: "Dark" },
          ]}
          value={settings.appearance}
          onChange={(appearance) => onChange({ appearance })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle} allowFontScaling>
          Rhythm
        </Text>
        <Text style={styles.sectionBody} allowFontScaling>
          {loopSummary(rhythm)}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel} allowFontScaling>
          Weekly goal (days)
        </Text>
        <Stepper
          accessibilityLabel="Weekly goal days"
          value={settings.weeklyGoalDays}
          min={1}
          max={7}
          onChange={(weeklyGoalDays) => onChange({ weeklyGoalDays })}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel} allowFontScaling>
          Show seconds
        </Text>
        <Switch
          accessibilityLabel="Toggle show seconds"
          onValueChange={(value) => onChange({ showSeconds: value })}
          value={settings.showSeconds}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel} allowFontScaling>
          Auto-start breaks
        </Text>
        <Switch
          accessibilityLabel="Toggle auto-start breaks"
          onValueChange={(value) => onChange({ autoStartBreaks: value })}
          value={settings.autoStartBreaks}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel} allowFontScaling>
          Sound on completion
        </Text>
        <Switch
          accessibilityLabel="Toggle sound on completion"
          onValueChange={(value) => onChange({ soundEnabled: value })}
          value={settings.soundEnabled}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel} allowFontScaling>
          Vibration on completion
        </Text>
        <Switch
          accessibilityLabel="Toggle vibration on completion"
          onValueChange={(value) => onChange({ vibrationEnabled: value })}
          value={settings.vibrationEnabled}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
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
  section: {
    marginVertical: spacing.lg,
  },
  sectionTitle: {
    ...typography.headline,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sectionBody: {
    ...typography.body,
    color: colors.textMuted,
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
    gap: spacing.md,
  },
  rowLabel: {
    ...typography.body,
    color: colors.text,
    flexShrink: 1,
  },
  stepper: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  stepButton: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  stepButtonText: { fontSize: 24, color: colors.text },
  stepValue: { ...typography.headline, color: colors.text, minWidth: 24, textAlign: "center" },
  segmented: { flexDirection: "row", borderRadius: radii.pill, overflow: "hidden" },
  segmentOption: {
    paddingHorizontal: 12,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentSelected: { backgroundColor: colors.chip, borderRadius: radii.pill },
  segmentText: { ...typography.caption, color: colors.textMuted },
  segmentTextSelected: { color: colors.text, fontWeight: "600" },
});
