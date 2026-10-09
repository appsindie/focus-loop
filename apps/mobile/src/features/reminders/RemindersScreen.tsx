import { useCallback, useEffect, useState } from "react";
import {
  AppState,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import * as Notifications from "expo-notifications";
import { PermissionStatus } from "expo-notifications";
import { SafeAreaView } from "../../shared/ui/SafeAreaView";
import { t } from "../../i18n";
import { Palette, radii, spacing, typography } from "../../shared/theme";
import { TABLET_PADDING, useIsTablet } from "../../shared/layout";
import { requestNotificationPermissions } from "../notifications/NotificationScheduler";
import { markNotificationsAsked } from "../notifications/notifAsk";
import { dayChipLetters, MAX_REMINDERS, Reminder, ReminderPrefs } from "./reminderStore";

// ISO Mon..Sun chip indices; letters come from CLDR via dayChipLetters().
const CHIP_INDICES = [0, 1, 2, 3, 4, 5, 6] as const;

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
        style={({ pressed }) => [
          styles.miniStepButton,
          { borderColor: colors.rule },
          pressed && { opacity: 0.55 },
        ]}
      >
        <Text style={[styles.miniStepText, { color: colors.ink }]}>−</Text>
      </Pressable>
      <Pressable
        onPress={() => onChange(value >= max ? min : value + 1)}
        accessibilityRole="button"
        accessibilityLabel={t("Increase {label}", { label: accessibilityLabel })}
        hitSlop={8}
        style={({ pressed }) => [
          styles.miniStepButton,
          { borderColor: colors.rule },
          pressed && { opacity: 0.55 },
        ]}
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
    // New rows start enabled — same ensure-permission path as flipping a toggle.
    ensureNotificationPermission();
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

  // Permission-denied nudge: scheduling silently no-ops without the OS grant
  // (J5 failure mode in reminderScheduler), so an armed-but-blocked reminder
  // would just never fire. The card deep-links to app Settings — iOS cannot
  // re-ask once denied. Re-derived whenever the arming state changes: turn the
  // last reminder off and the card goes away on its own.
  const [showNudge, setShowNudge] = useState(false);
  const anythingEnabled = prefs.eveningNote || prefs.reminders.some((reminder) => reminder.enabled);

  const refreshNudge = useCallback(() => {
    void Notifications.getPermissionsAsync().then(({ status }) => {
      setShowNudge(status === PermissionStatus.DENIED && anythingEnabled);
    });
  }, [anythingEnabled]);

  useEffect(() => {
    refreshNudge();
  }, [refreshNudge]);

  // The nudge's whole job is to send the user to app Settings — re-check on
  // resume so a granted permission clears it instead of leaving a stale card.
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        refreshNudge();
      }
    });
    return () => sub.remove();
  }, [refreshNudge]);

  // Enabling a reminder is explicit intent — the right moment to fire the real
  // OS prompt when permission was never decided (the P03 pre-prompt only shows
  // after the first completed focus). The answer is recorded so the pre-prompt
  // honours it instead of double-asking later. The denied path sets the nudge
  // immediately rather than waiting for the prefs round-trip.
  const ensureNotificationPermission = () => {
    void (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status === PermissionStatus.GRANTED) {
        setShowNudge(false);
        return;
      }
      if (status === PermissionStatus.DENIED) {
        setShowNudge(true);
        return;
      }
      const granted = await requestNotificationPermissions();
      void markNotificationsAsked(granted ? "allowed" : "declined");
      setShowNudge(!granted);
    })();
  };

  const isTablet = useIsTablet();
  const chipLetters = dayChipLetters();
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
          {t("Reminders")}
        </Text>
        <View style={styles.backButton} />
      </View>

      {/* S9-03: reminder cards + evening note can overflow a phone screen —
          everything below the header scrolls, like SettingsScreen. */}
      <ScrollView testID="reminders-scroll">
        <Text style={[styles.explainer, { color: colors.muted }]} allowFontScaling>
          {t("A nudge at the times you plan to focus. Tapping it starts your rhythm right away.")}
        </Text>

        {showNudge ? (
          <View
            style={[
              styles.card,
              styles.nudgeCard,
              { backgroundColor: colors.surface, borderColor: colors.rule },
            ]}
          >
            <Text style={[styles.nudgeBody, { color: colors.ink }]} allowFontScaling>
              {t("Notifications are off — reminders won't fire.")}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("Open settings")}
              onPress={() => void Linking.openSettings()}
              hitSlop={8}
            >
              <Text style={[styles.nudgeLink, { color: colors.focus }]} allowFontScaling>
                {t("Open settings")}
              </Text>
            </Pressable>
          </View>
        ) : null}

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
                  <Text style={[styles.timeStepperLabel, { color: colors.faint }]}>
                    {t("hour")}
                  </Text>
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
                    style={({ pressed }) => [
                      styles.chip,
                      { borderColor: colors.rule },
                      active && { backgroundColor: colors.chip, borderColor: colors.chip },
                      pressed && { opacity: 0.55 },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: active ? colors.ink : colors.faint }]}>
                      {chipLetters[index] ?? ""}
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
                  onValueChange={(enabled) => {
                    if (enabled) {
                      ensureNotificationPermission();
                    }
                    setReminder(reminder.id, { enabled });
                  }}
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
            style={({ pressed }) => [
              styles.addRow,
              { borderColor: colors.rule },
              pressed && { opacity: 0.55 },
            ]}
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
              onValueChange={(eveningNote) => {
                if (eveningNote) {
                  ensureNotificationPermission();
                }
                onChange({ ...prefs, eveningNote });
              }}
              value={prefs.eveningNote}
            />
          </View>
        </View>
      </ScrollView>
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
  nudgeCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  nudgeBody: { ...typography.body, flex: 1 },
  nudgeLink: { ...typography.body, fontWeight: "600" },
});
