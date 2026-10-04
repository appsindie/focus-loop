import { t } from "../../i18n";

export type Rhythm = {
  focusMinutes: number;
  breakMinutes: number;
  rounds: number;
  longBreakMinutes: number;
};

export type RhythmPresetId = "classic" | "gentle" | "deep-work" | "custom";

export const RHYTHM_PRESETS: Record<Exclude<RhythmPresetId, "custom">, Rhythm> = {
  classic: { focusMinutes: 25, breakMinutes: 5, rounds: 4, longBreakMinutes: 15 },
  gentle: { focusMinutes: 15, breakMinutes: 5, rounds: 4, longBreakMinutes: 15 },
  "deep-work": { focusMinutes: 50, breakMinutes: 10, rounds: 3, longBreakMinutes: 15 },
};

export const DEFAULT_RHYTHM: Rhythm = RHYTHM_PRESETS.classic;

// Display-only preset names (S10-02): explicit per preset — the P21 row
// renders these verbatim through t(), never a regex-derived piece of a
// label-with-numbers. Each value is a dictionary key.
export const RHYTHM_PRESET_NAMES: Record<RhythmPresetId, string> = {
  classic: "Classic",
  gentle: "Gentle start",
  "deep-work": "Deep work",
  custom: "Custom",
};

export const RHYTHM_BOUNDS = {
  focusMinutes: { min: 1, max: 180 },
  breakMinutes: { min: 0, max: 60 },
  rounds: { min: 1, max: 12 },
  longBreakMinutes: { min: 0, max: 120 },
} as const;

export function resolveRhythm(presetId: RhythmPresetId, customRhythm: Rhythm): Rhythm {
  return presetId === "custom" ? customRhythm : RHYTHM_PRESETS[presetId];
}

// A loop is N focuses with a short break between consecutive focuses, then one long
// break after the last focus (spec J2-R1; P12 Loop complete precedes the long break).
export function loopDurationSeconds(rhythm: Rhythm): number {
  const focus = rhythm.rounds * rhythm.focusMinutes * 60;
  const breaks = Math.max(0, rhythm.rounds - 1) * rhythm.breakMinutes * 60;
  const longBreak = rhythm.longBreakMinutes * 60;
  return focus + breaks + longBreak;
}

function formatMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) {
    return `${minutes}m`;
  }
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
}

// The P21 live label: "One loop = 25/5 ×4 + 15 ≈ 2h 10m".
export function loopSummary(rhythm: Rhythm): string {
  const totalMinutes = Math.round(loopDurationSeconds(rhythm) / 60);
  return t("One loop = {focus}/{brk} ×{rounds} + {long} ≈ {total}", {
    focus: rhythm.focusMinutes,
    brk: rhythm.breakMinutes,
    rounds: rhythm.rounds,
    long: rhythm.longBreakMinutes,
    total: formatMinutes(totalMinutes),
  });
}
