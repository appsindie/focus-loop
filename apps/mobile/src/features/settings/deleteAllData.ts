import AsyncStorage from "@react-native-async-storage/async-storage";
import { defaultEntitlement, saveEntitlement } from "../loop/entitlement";
import { saveSettings, DEFAULT_SETTINGS } from "./SettingsStore";
import { clearReminderSchedules } from "../reminders/reminderScheduler";
import { cancelStepAlert } from "../notifications/NotificationScheduler";

// P20 "Delete all data…" (J10-R4): the storage-side half of the wipe. The
// ordering is the contract (S9-02): `resetInMemory` runs BEFORE any await —
// the reminder-sync effect re-runs on the session/state clears triggered
// after this resolves, and with stale prefs it would reschedule every
// reminder we are about to cancel. In-memory mirrors that live in components
// (reminder prefs, sessions, entitlement) reset through the callback.
export async function wipeStoredData(resetInMemory: () => void): Promise<void> {
  resetInMemory();
  await cancelStepAlert();
  await clearReminderSchedules();
  const keys = (await AsyncStorage.getAllKeys()).filter((key) => key.startsWith("focus-loop/"));
  await AsyncStorage.removeMany(keys);
  await saveSettings(DEFAULT_SETTINGS);
  await saveEntitlement(defaultEntitlement());
}
