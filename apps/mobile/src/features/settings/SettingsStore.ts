import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_RHYTHM, Rhythm, RhythmPresetId } from "../loop/rhythm";
import { DEFAULT_WEEKLY_GOAL_DAYS } from "../loop/weeklyGoal";

const SETTINGS_KEY = "focus-loop/settings";

// Display mode null = the P05 chooser has not been answered yet (J1-R3 requires it
// before the first Start).
export type DisplayMode = "numbers" | "progress";
export type Appearance = "system" | "light" | "dark";

export type Settings = {
  rhythmPresetId: RhythmPresetId;
  customRhythm: Rhythm;
  displayMode: DisplayMode | null;
  // Sponsor decision 2026-10-03: seconds shown by default (P20 can turn it off).
  showSeconds: boolean;
  // Sponsor decision 2026-10-03: streak replaced by weekly goal, default 4 of 7.
  weeklyGoalDays: number;
  // P10 "Start breaks automatically" — next focus auto-starts when a break ends.
  autoStartBreaks: boolean;
  appearance: Appearance;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  // ADR-003: install-age ad grace is client-side; anchored to first launch.
  firstInstallAt: string | null;
};

export const DEFAULT_SETTINGS: Settings = {
  rhythmPresetId: "classic",
  customRhythm: DEFAULT_RHYTHM,
  displayMode: null,
  showSeconds: true,
  weeklyGoalDays: DEFAULT_WEEKLY_GOAL_DAYS,
  autoStartBreaks: false,
  appearance: "system",
  soundEnabled: true,
  vibrationEnabled: true,
  firstInstallAt: null,
};

const RHYTHM_KEYS: (keyof Rhythm)[] = [
  "focusMinutes",
  "breakMinutes",
  "rounds",
  "longBreakMinutes",
];

function isRhythm(value: unknown): value is Rhythm {
  if (typeof value !== "object" || value == null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return RHYTHM_KEYS.every((key) => typeof candidate[key] === "number");
}

function isSettings(value: unknown): value is Settings {
  if (typeof value !== "object" || value == null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate["rhythmPresetId"] === "string" &&
    isRhythm(candidate["customRhythm"]) &&
    (candidate["displayMode"] === "numbers" ||
      candidate["displayMode"] === "progress" ||
      candidate["displayMode"] === null) &&
    typeof candidate["showSeconds"] === "boolean" &&
    typeof candidate["weeklyGoalDays"] === "number" &&
    typeof candidate["autoStartBreaks"] === "boolean" &&
    (candidate["appearance"] === "system" ||
      candidate["appearance"] === "light" ||
      candidate["appearance"] === "dark") &&
    typeof candidate["soundEnabled"] === "boolean" &&
    typeof candidate["vibrationEnabled"] === "boolean" &&
    (candidate["firstInstallAt"] === null || typeof candidate["firstInstallAt"] === "string")
  );
}

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    const parsed: unknown = raw == null ? null : JSON.parse(raw);
    const settings = isSettings(parsed) ? parsed : { ...DEFAULT_SETTINGS };

    if (settings.firstInstallAt == null) {
      settings.firstInstallAt = new Date().toISOString();
      await saveSettings(settings);
    }
    return settings;
  } catch {
    return { ...DEFAULT_SETTINGS, firstInstallAt: new Date().toISOString() };
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
