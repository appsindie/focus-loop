import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_RHYTHM, RHYTHM_BOUNDS, Rhythm, RhythmPresetId } from "../loop/rhythm";
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

const PRESET_IDS: readonly RhythmPresetId[] = ["classic", "gentle", "deep-work", "custom"];

function isRhythm(value: unknown): value is Rhythm {
  if (typeof value !== "object" || value == null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return RHYTHM_KEYS.every((key) => Number.isFinite(candidate[key]));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(Math.round(value), min), max);
}

// Bounds enforced on load: a bad rhythm id or NaN/0 field would crash or degenerate
// the loop plan downstream (code review CR-04).
function normalizeSettings(settings: Settings): Settings {
  return {
    ...settings,
    customRhythm: {
      focusMinutes: clamp(
        settings.customRhythm.focusMinutes,
        RHYTHM_BOUNDS.focusMinutes.min,
        RHYTHM_BOUNDS.focusMinutes.max,
      ),
      breakMinutes: clamp(
        settings.customRhythm.breakMinutes,
        RHYTHM_BOUNDS.breakMinutes.min,
        RHYTHM_BOUNDS.breakMinutes.max,
      ),
      rounds: clamp(
        settings.customRhythm.rounds,
        RHYTHM_BOUNDS.rounds.min,
        RHYTHM_BOUNDS.rounds.max,
      ),
      longBreakMinutes: clamp(
        settings.customRhythm.longBreakMinutes,
        RHYTHM_BOUNDS.longBreakMinutes.min,
        RHYTHM_BOUNDS.longBreakMinutes.max,
      ),
    },
    weeklyGoalDays: clamp(settings.weeklyGoalDays, 1, 7),
  };
}

function isSettings(value: unknown): value is Settings {
  if (typeof value !== "object" || value == null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    PRESET_IDS.includes(candidate["rhythmPresetId"] as RhythmPresetId) &&
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

// Serialise the first-launch anchor write so concurrent loads share one write and a
// user save in between is not clobbered (code review CR-04).
let pendingFirstInstallSave: Promise<Settings> | null = null;

export async function loadSettings(): Promise<Settings> {
  if (pendingFirstInstallSave != null) {
    return pendingFirstInstallSave;
  }
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (raw == null) {
      // Fresh install: mint the ad-grace anchor once, merging over whatever landed in
      // storage between our read and our write.
      pendingFirstInstallSave = (async () => {
        const anchor = new Date().toISOString();
        const latest = await AsyncStorage.getItem(SETTINGS_KEY);
        const parsedLatest: unknown = latest == null ? null : JSON.parse(latest);
        const settings = isSettings(parsedLatest)
          ? normalizeSettings(parsedLatest)
          : { ...DEFAULT_SETTINGS };
        settings.firstInstallAt = settings.firstInstallAt ?? anchor;
        await saveSettings(settings);
        return settings;
      })().finally(() => {
        pendingFirstInstallSave = null;
      });
      return pendingFirstInstallSave;
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!isSettings(parsed)) {
      // Corrupt/foreign payload: defaults WITHOUT a fresh anchor — minting one here
      // would restart the install-age ad grace on every launch (CR-04).
      return { ...DEFAULT_SETTINGS };
    }
    const settings = normalizeSettings(parsed);
    if (settings.firstInstallAt == null) {
      settings.firstInstallAt = new Date().toISOString();
      await saveSettings(settings);
    }
    return settings;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
