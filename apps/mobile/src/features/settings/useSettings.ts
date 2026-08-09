import { useCallback, useEffect, useState } from "react";
import { DEFAULT_SETTINGS, Settings, loadSettings, saveSettings } from "./SettingsStore";

export { DEFAULT_SETTINGS } from "./SettingsStore";
export type { Settings } from "./SettingsStore";

export type UseSettings = {
  settings: Settings;
  loading: boolean;
  update: (patch: Partial<Settings>) => void;
  save: () => Promise<void>;
};

export function useSettings(): UseSettings {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void loadSettings().then((loaded) => {
      if (active) {
        setSettings(loaded);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const save = useCallback(async () => {
    await saveSettings(settings);
  }, [settings]);

  return { settings, loading, update, save };
}
