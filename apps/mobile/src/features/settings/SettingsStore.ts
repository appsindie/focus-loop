import AsyncStorage from "@react-native-async-storage/async-storage";

const SETTINGS_KEY = "focus-loop/settings";

export type Settings = {
  defaultDurationMinutes: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  defaultDurationMinutes: 25,
  soundEnabled: true,
  vibrationEnabled: true,
};

function isSettings(value: unknown): value is Settings {
  if (typeof value !== "object" || value == null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate["defaultDurationMinutes"] === "number" &&
    typeof candidate["soundEnabled"] === "boolean" &&
    typeof candidate["vibrationEnabled"] === "boolean"
  );
}

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (raw == null) {
      return DEFAULT_SETTINGS;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!isSettings(parsed)) {
      return DEFAULT_SETTINGS;
    }
    return parsed;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
