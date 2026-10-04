import AsyncStorage from "@react-native-async-storage/async-storage";
import { locale, t } from "../../i18n";

const REMINDERS_KEY = "focus-loop/v1/reminders";

// J5-R1: recurring weekly schedules — a time plus weekday chips. Purely local,
// no server. `days` holds ISO weekday numbers (1 = Monday … 7 = Sunday) matching
// the chip order on P22; the scheduler maps them to expo-notifications' weekday
// numbering (1 = Sunday) at schedule time.
export type Reminder = {
  id: string;
  // 0–23 / 0–59 local time.
  hour: number;
  minute: number;
  days: number[];
  enabled: boolean;
};

export type ReminderPrefs = {
  reminders: Reminder[];
  // J5-R2: optional gentle evening note on goal days — defaults to OFF.
  eveningNote: boolean;
};

export const DEFAULT_REMINDER_PREFS: ReminderPrefs = {
  reminders: [],
  eveningNote: false,
};

// The evening note's clock time, fixed by the P22 copy ("by 20:00").
export const EVENING_NOTE_HOUR = 20;
export const EVENING_NOTE_MINUTE = 0;

export const MAX_REMINDERS = 12;

function isDay(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 7;
}

function isReminder(value: unknown): value is Reminder {
  if (typeof value !== "object" || value == null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate["id"] === "string" &&
    typeof candidate["hour"] === "number" &&
    Number.isInteger(candidate["hour"]) &&
    candidate["hour"] >= 0 &&
    candidate["hour"] <= 23 &&
    typeof candidate["minute"] === "number" &&
    Number.isInteger(candidate["minute"]) &&
    candidate["minute"] >= 0 &&
    candidate["minute"] <= 59 &&
    Array.isArray(candidate["days"]) &&
    (candidate["days"] as unknown[]).every(isDay) &&
    typeof candidate["enabled"] === "boolean"
  );
}

// Storage normalisation: drop malformed rows, dedupe days, cap the list — a
// corrupt payload degrades to defaults instead of wiping the whole store.
export function normalizeReminders(value: unknown): Reminder[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(isReminder).map((r) => ({ ...r, days: [...new Set(r.days)].sort() }));
}

export async function loadReminderPrefs(): Promise<ReminderPrefs> {
  const raw = await AsyncStorage.getItem(REMINDERS_KEY);
  if (raw == null) {
    return DEFAULT_REMINDER_PREFS;
  }
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      reminders: normalizeReminders(parsed["reminders"]).slice(0, MAX_REMINDERS),
      eveningNote: parsed["eveningNote"] === true,
    };
  } catch {
    return DEFAULT_REMINDER_PREFS;
  }
}

export async function saveReminderPrefs(prefs: ReminderPrefs): Promise<void> {
  await AsyncStorage.setItem(
    REMINDERS_KEY,
    JSON.stringify({
      reminders: prefs.reminders.slice(0, MAX_REMINDERS),
      eveningNote: prefs.eveningNote,
    }),
  );
}

const DAY_KEYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

// ISO Mon..Sun chip letters. English-keyed gettext cannot give Tue and Thu
// (or Sat and Sun) different glyphs from t("T")/t("S"), so the letters come
// from CLDR via Intl weekday "narrow" — every locale gets its own distinct
// initials (S10-03). First letter of the translated short name is the
// fallback where Intl narrow is unavailable.
export function dayChipLetters(): string[] {
  try {
    const fmt = new Intl.DateTimeFormat(locale(), { weekday: "narrow" });
    // 2024-01-01 is a Monday.
    return DAY_KEYS.map((_, index) => fmt.format(new Date(2024, 0, index + 1)).charAt(0));
  } catch {
    return DAY_KEYS.map((key) => t(key).charAt(0));
  }
}

function sameSet(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((d) => b.includes(d));
}

// Settings-row summary for one reminder, e.g. "Weekdays 9:00" / "M·W·F 14:30".
export function reminderDaysLabel(days: number[]): string {
  if (days.length === 0) {
    return t("No days");
  }
  if (sameSet(days, [1, 2, 3, 4, 5])) {
    return t("Weekdays");
  }
  if (sameSet(days, [6, 7])) {
    return t("Weekends");
  }
  if (days.length === 7) {
    return t("Daily");
  }
  const letters = dayChipLetters();
  return [...days]
    .sort()
    .map((d) => letters[d - 1])
    .join("·");
}

export function reminderSummaryLine(reminder: Reminder): string {
  return `${reminderDaysLabel(reminder.days)} ${reminder.hour}:${String(reminder.minute).padStart(2, "0")}`;
}

let idCounter = 0;

// Deterministic-enough ids for UI rows; uniqueness only needs to survive within
// one install (schedule identifiers embed them).
export function newReminderId(now = new Date()): string {
  idCounter = (idCounter + 1) % 10_000;
  return `r-${now.getTime().toString(36)}-${idCounter}`;
}
