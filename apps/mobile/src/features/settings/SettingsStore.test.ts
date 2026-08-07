import AsyncStorage from "@react-native-async-storage/async-storage";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from "./SettingsStore";

describe("SettingsStore", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("returns default settings when nothing is stored", async () => {
    const settings = await loadSettings();
    expect(settings).toEqual(DEFAULT_SETTINGS);
  });

  it("round-trips settings through AsyncStorage", async () => {
    const settings = { defaultDurationMinutes: 45, soundEnabled: false, vibrationEnabled: false };
    await saveSettings(settings);
    const loaded = await loadSettings();
    expect(loaded).toEqual(settings);
  });

  it("falls back to defaults when stored data is corrupted", async () => {
    await AsyncStorage.setItem("focus-loop/settings", "not-json");
    const loaded = await loadSettings();
    expect(loaded).toEqual(DEFAULT_SETTINGS);
  });

  it("falls back to defaults when stored data has the wrong shape", async () => {
    await AsyncStorage.setItem("focus-loop/settings", JSON.stringify({ foo: "bar" }));
    const loaded = await loadSettings();
    expect(loaded).toEqual(DEFAULT_SETTINGS);
  });
});
