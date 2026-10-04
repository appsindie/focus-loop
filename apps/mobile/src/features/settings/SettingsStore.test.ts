import AsyncStorage from "@react-native-async-storage/async-storage";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from "./SettingsStore";

describe("SettingsStore", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("returns v1 defaults: seconds on, weekly goal 4/7, display mode unset", async () => {
    const settings = await loadSettings();
    expect(settings).toMatchObject({
      rhythmPresetId: "classic",
      displayMode: null,
      showSeconds: true,
      weeklyGoalDays: 4,
      autoStartBreaks: false,
      appearance: "system",
    });
    // ADR-003: install timestamp anchored on first launch for the ad grace.
    expect(settings.firstInstallAt).toEqual(expect.any(String));
  });

  it("round-trips settings through AsyncStorage", async () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      rhythmPresetId: "deep-work" as const,
      displayMode: "numbers" as const,
      showSeconds: false,
      weeklyGoalDays: 5,
      firstInstallAt: "2026-10-03T00:00:00.000Z",
    };
    await saveSettings(settings);
    const loaded = await loadSettings();
    expect(loaded).toEqual(settings);
  });

  it("falls back to defaults when stored data is corrupted", async () => {
    await AsyncStorage.setItem("focus-loop/settings", "not-json");
    const loaded = await loadSettings();
    expect(loaded.rhythmPresetId).toBe("classic");
  });

  it("falls back to defaults when stored data has the old pilot shape", async () => {
    await AsyncStorage.setItem(
      "focus-loop/settings",
      JSON.stringify({ defaultDurationMinutes: 25, soundEnabled: true, vibrationEnabled: true }),
    );
    const loaded = await loadSettings();
    expect(loaded.displayMode).toBeNull();
    // Corrupt payload → no fresh anchor (would restart the ad grace every launch).
    expect(loaded.firstInstallAt).toBeNull();
  });

  it("clamps rhythm fields and the weekly goal on load (CR-04)", async () => {
    await saveSettings({
      ...DEFAULT_SETTINGS,
      customRhythm: { focusMinutes: 999, breakMinutes: -3, rounds: 0, longBreakMinutes: 10_000 },
      weeklyGoalDays: 0,
      firstInstallAt: "2026-10-03T00:00:00.000Z",
    });
    const loaded = await loadSettings();
    expect(loaded.customRhythm).toEqual({
      focusMinutes: 180,
      breakMinutes: 0,
      rounds: 1,
      longBreakMinutes: 120,
    });
    expect(loaded.weeklyGoalDays).toBe(1);
  });

  it("rejects an unknown rhythm preset id (CR-04)", async () => {
    await saveSettings({ ...DEFAULT_SETTINGS, rhythmPresetId: "turbo" as never });
    const loaded = await loadSettings();
    expect(loaded.rhythmPresetId).toBe("classic");
  });

  it("shares one anchor between concurrent first-launch loads (CR-04)", async () => {
    const [a, b] = await Promise.all([loadSettings(), loadSettings()]);
    expect(a.firstInstallAt).toBe(b.firstInstallAt);
    expect(a.firstInstallAt).toEqual(expect.any(String));
  });
});
