import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { colors, radii, spacing, typography } from "../../shared/theme";
import { loopSummary, resolveRhythm } from "../loop/rhythm";
import { Settings } from "./SettingsStore";

type SettingsScreenProps = {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onSave: () => void;
  onBack: () => void;
};

export function SettingsScreen({ settings, onChange, onSave, onBack }: SettingsScreenProps) {
  const rhythm = resolveRhythm(settings.rhythmPresetId, settings.customRhythm);

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
          Settings
        </Text>
        <View style={styles.backButton} />
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

      <Pressable
        accessibilityLabel="Save settings"
        accessibilityRole="button"
        onPress={onSave}
        style={styles.saveButton}
      >
        <Text style={styles.saveButtonText} allowFontScaling>
          Save
        </Text>
      </Pressable>
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
  section: {
    marginBottom: spacing.xl,
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
  },
  rowLabel: {
    ...typography.body,
    color: colors.text,
  },
  saveButton: {
    minHeight: 56,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xl,
  },
  saveButtonText: {
    ...typography.headline,
    color: colors.primaryText,
  },
});
