import { Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { colors, radii, spacing, typography } from "../../shared/theme";
import { DEFAULT_SETTINGS, Settings } from "./SettingsStore";

type SettingsScreenProps = {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onSave: () => void;
  onBack: () => void;
};

function clampDuration(value: string): number {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return DEFAULT_SETTINGS.defaultDurationMinutes;
  }
  return Math.min(Math.max(parsed, 1), 180);
}

export function SettingsScreen({ settings, onChange, onSave, onBack }: SettingsScreenProps) {
  const canSave = settings.defaultDurationMinutes >= 1 && settings.defaultDurationMinutes <= 180;

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
          Default focus length (minutes)
        </Text>
        <TextInput
          accessibilityLabel="Default focus length in minutes"
          keyboardType="number-pad"
          maxLength={3}
          onChangeText={(text) => onChange({ defaultDurationMinutes: clampDuration(text) })}
          style={styles.input}
          value={String(settings.defaultDurationMinutes)}
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
        accessibilityState={{ disabled: !canSave }}
        disabled={!canSave}
        onPress={onSave}
        style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
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
  input: {
    ...typography.headline,
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 56,
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
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    ...typography.headline,
    color: colors.primaryText,
  },
});
