import AsyncStorage from "@react-native-async-storage/async-storage";

// P03: the pre-prompt shows once after the first completed focus; "Not now"
// shall not re-ask within 7 days (J3-R3). Last-ask time is stored so a later
// decline still re-surfaces after the quiet window.
const ASKED_KEY = "focus-loop/v1/notif-ask";
export const NOTIF_REPROMPT_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

export async function shouldAskForNotifications(now = new Date()): Promise<boolean> {
  const raw = await AsyncStorage.getItem(ASKED_KEY);
  if (raw == null) {
    return true;
  }
  const last = Date.parse(raw);
  if (!Number.isFinite(last)) {
    return true;
  }
  return now.getTime() - last >= NOTIF_REPROMPT_AFTER_MS;
}

export async function markNotificationsAsked(now = new Date()): Promise<void> {
  await AsyncStorage.setItem(ASKED_KEY, now.toISOString());
}
