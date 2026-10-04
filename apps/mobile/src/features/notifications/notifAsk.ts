import AsyncStorage from "@react-native-async-storage/async-storage";

// P03: the pre-prompt shows once after the first completed focus. The ANSWER is
// stored, not just the ask time (CR-08): "allowed" never re-asks — the OS prompt
// already ran — while "Not now" stays quiet for 7 days then may resurface (J3-R3).
const ASKED_KEY = "focus-loop/v1/notif-ask";
export const NOTIF_REPROMPT_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

type NotifAskRecord = { answer: "allowed" | "declined"; askedAt: string };

function parseRecord(raw: string): NotifAskRecord | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }
    const rec = parsed as Record<string, unknown>;
    if (
      (rec["answer"] === "allowed" || rec["answer"] === "declined") &&
      typeof rec["askedAt"] === "string" &&
      Number.isFinite(Date.parse(rec["askedAt"]))
    ) {
      return parsed as NotifAskRecord;
    }
    return null;
  } catch {
    return null;
  }
}

export async function shouldAskForNotifications(now = new Date()): Promise<boolean> {
  const raw = await AsyncStorage.getItem(ASKED_KEY);
  if (raw == null) {
    return true;
  }
  const record = parseRecord(raw);
  if (record != null) {
    return (
      record.answer === "declined" &&
      now.getTime() - Date.parse(record.askedAt) >= NOTIF_REPROMPT_AFTER_MS
    );
  }
  // Legacy payload: a bare ISO timestamp from before the answer was recorded —
  // treat it as a declined ask so the quiet window still applies.
  const legacy = Date.parse(raw);
  if (Number.isFinite(legacy)) {
    return now.getTime() - legacy >= NOTIF_REPROMPT_AFTER_MS;
  }
  return true;
}

export async function markNotificationsAsked(
  answer: "allowed" | "declined",
  now = new Date(),
): Promise<void> {
  const record: NotifAskRecord = { answer, askedAt: now.toISOString() };
  await AsyncStorage.setItem(ASKED_KEY, JSON.stringify(record));
}
