import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { t } from "../../i18n";
import { Palette, radii, spacing, typography } from "../../shared/theme";
import { TABLET_PADDING, useIsTablet } from "../../shared/layout";
import { MAX_REMINDERS, Reminder, ReminderPrefs } from "./reminderStore";

// ISO Mon..Sun chip letters.
const CHIP_INDICES = [0, 1, 2, 3, 4, 5, 6] as const;

function dayChipLabel(index: number): string {
  return [t("M"), t("T"), t("W"), t("T"), t("F"), t("S"), t("S")][index] ?? "";
}

function formatTime(hour: number, minute: number): string {
  return `${hour}:${String(minute).padStart(2, "0")}`;
}

export type RemindersScreenProps = {
  colors: Palette;
  prefs: ReminderPrefs;
  onChange: (prefs: ReminderPrefs) => void;
  onBack: () => void;
};

function MiniStepper({
  value,
  min,
  max,
  onChange,
  accessibilityLabel,
  colors,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  accessibilityLabel: string;
  colors: Palette;
}) {
  return (
    <View style={styles.miniStepper}>
      <Pressable
        onPress={() => onChange(value <= min ? max : value - 1)}
        accessibilityRole="button"
        accessibilityLabel={t("Decrease {label}", { label: accessibilityLabel })}
        hitSlop={8}
        style={[styles.miniStepButton, { borderColor: colors.rule }]}
      >
        <Text style={[styles.miniStepText, { color: colors.ink }]}>−</Text>
      </Pressable>
      <Pressable
        onPress={() => onChange(value >= max ? min : value + 1)}
        accessibilityRole="button"
        accessibilityLabel={t("Increase {label}", { label: accessibilityLabel })}
        hitSlop={8}
        style={[styles.miniStepButton, { borderColor: colors.rule }]}
      >
        <Text style={[styles.miniStepText, { color: colors.ink }]}>+</Text>
      </Pressable>
    </View>
  );
}

// P22: recurring weekly reminders — a row per reminder (time steppers, weekday
// chips, toggle, remove), "Add a reminder", then the optional evening goal-day
// note (J5-R2, default off).
export function RemindersScreen({ colors, prefs, onChange, onBack }: RemindersScreenProps) {
  const setReminder = (id: string, patch: Partial<Reminder>) => {
    onChange({
      ...prefs,
      reminders: prefs.reminders.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    });
  };
  const removeReminder = (id: string) => {
    onChange({ ...prefs, reminders: prefs.reminders.filter((r) => r.id !== id) });
  };
  const addReminder = () => {
    onChange({
      ...prefs,
      reminders: [
        ...prefs.reminders,
        // The design's starter row: 9:00 on weekdays.
        {
          id: `r-${Date.now().toString(36)}`,
          hour: 9,
          minute: 0,
          days: [1, 2, 3, 4, 5],
          enabled: true,
        },
      ],
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
          style={styles.backButton}
        >
          <Text style={[styles.backButtonText, { color: colors.ink }]} allowFontScaling>
            {t("Back")}
          </Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.ink }]} allowFontScaling>
          {t("Reminders")}
        </Text>
        <View style={styles.backButton} />
      </View>

      <Text style={[styles.explainer, { color: colors.muted }]} allowFontScaling>
        {t("A nudge at the times you plan to focus. Tapping it starts your rhythm right away.")}
      </Text>

      {prefs.reminders.map((reminder) => (
        <View
          key={reminder.id}
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.rule }]}
        >
          <View style={styles.timeRow}>
            <Text style={[styles.timeLabel, { color: colors.ink }]} allowFontScaling>
              {formatTime(reminder.hour, reminder.minute)}
            </Text>
            <View style={styles.timeSteppers}>
              <View style={styles.timeStepper}>
                <Text style={[styles.timeStepperLabel, { color: colors.faint }]}>{t("hour")}</Text>
                <MiniStepper
                  colors={colors}
                  accessibilityLabel={`${formatTime(reminder.hour, reminder.minute)} hour`}
                  value={reminder.hour}
                  min={0}
                  max={23}
                  onChange={(hour) => setReminder(reminder.id, { hour })}
                />
              </View>
              <View style={styles.timeStepper}>
                <Text style={[styles.timeStepperLabel, { color: colors.faint }]}>{t("min")}</Text>
                <MiniStepper
                  colors={colors}
                  accessibilityLabel={`${formatTime(reminder.hour, reminder.minute)} minute`}
                  value={reminder.minute}
                  min={0}
                  max={59}
                  onChange={(minute) => setReminder(reminder.id, { minute })}
                />
              </View>
            </View>
          </View>

          <View style={styles.chips}>
            {CHIP_INDICES.map((index) => {
              const isoDay = index + 1;
              const active = reminder.days.includes(isoDay);
              return (
                <Pressable
                  key={`${reminder.id}-d${isoDay}`}
                  onPress={() =>
                    setReminder(reminder.id, {
                      days: active
                        ? reminder.days.filter((d) => d !== isoDay)
                        : [...reminder.days, isoDay].sort(),
                    })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={t("{time} reminder day {day}", {
                    time: formatTime(reminder.hour, reminder.minute),
                    day: isoDay,
                  })}
                  accessibilityState={{ selected: active }}
                  style={[
                    styles.chip,
                    { borderColor: colors.rule },
                    active && { backgroundColor: colors.chip, borderColor: colors.chip },
                  ]}
                >
                  <Text style={[styles.chipText, { color: active ? colors.ink : colors.faint }]}>
                    {dayChipLabel(index)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.rowFooter}>
            <Text style={[styles.toggleLabel, { color: colors.muted }]} allowFontScaling>
              {formatTime(reminder.hour, reminder.minute)}{" "}
              {reminder.enabled ? t("reminder on") : t("reminder off")}
            </Text>
            <View style={styles.footerControls}>
              <Pressable
                onPress={() => removeReminder(reminder.id)}
                accessibilityRole="button"
                accessibilityLabel={t("Remove {time} reminder", {
                  time: formatTime(reminder.hour, reminder.minute),
                })}
                hitSlop={8}
              >
                <Text style={[styles.removeText, { color: colors.danger }]} allowFontScaling>
                  {t("Remove")}
                </Text>
              </Pressable>
              <Switch
                accessibilityLabel={t("{time} reminder toggle", {
                  time: formatTime(reminder.hour, reminder.minute),
                })}
                onValueChange={(enabled) => setReminder(reminder.id, { enabled })}
                value={reminder.enabled}
              />
            </View>
          </View>
        </View>
      ))}

      {prefs.reminders.length < MAX_REMINDERS ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("Add a reminder")}
          onPress={addReminder}
          style={[styles.addRow, { borderColor: colors.rule }]}
        >
          <Text style={[styles.addText, { color: colors.focus }]} allowFontScaling>
            {t("Add a reminder")}
          </Text>
        </Pressable>
      ) : null}

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.rule }]}>
        <Text style={[styles.eveningBody, { color: colors.muted }]} allowFontScaling>
          {t("If you haven't focused by 20:00 on a goal day, we can send one gentle note.")}
        </Text>
        <View style={styles.eveningRow}>
          <Text style={[styles.toggleLabel, { color: colors.ink }]} allowFontScaling>
            {prefs.eveningNote ? t("On") : t("Off")}
          </Text>
          <Switch
            accessibilityLabel={t("Evening goal-day note")}
            onValueChange={(eveningNote) => onChange({ ...prefs, eveningNote })}
            value={prefs.eveningNote}
          />
        </View>
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
    marginBottom: spacing.md,
  },
  backButton: { minWidth: 48, minHeight: 48, justifyContent: "center" },
  backButtonText: { ...typography.body },
  title: { ...typography.title },
  explainer: { ...typography.body, marginBottom: spacing.lg },
  card: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  timeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  timeLabel: { ...typography.h1Screen },
  timeSteppers: { flexDirection: "row", gap: spacing.md },
  timeStepper: { alignItems: "center", gap: 2 },
  timeStepperLabel: { ...typography.caption },
  miniStepper: { flexDirection: "row", gap: spacing.xs },
  miniStepButton: {
    minWidth: 40,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: radii.sm,
  },
  miniStepText: { fontSize: 18 },
  chips: { flexDirection: "row", gap: spacing.sm },
  chip: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: { ...typography.caption, fontWeight: "600" },
  rowFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  toggleLabel: { ...typography.caption },
  footerControls: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  removeText: { ...typography.caption },
  addRow: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
    marginBottom: spacing.md,
  },
  addText: { ...typography.body, fontWeight: "600" },
  eveningBody: { ...typography.body },
  eveningRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
});
