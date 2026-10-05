import AsyncStorage from "@react-native-async-storage/async-storage";

const SESSIONS_KEY = "focus-loop/v1/sessions";

// Spec J2-R4: written before the close-out screen shows; the outcome is optional.
export type SessionOutcome = "finished" | "moved-forward" | "got-stuck";

export type FocusSession = {
  id: string;
  loopId: string;
  // 1-based round index inside the loop.
  roundIndex: number;
  intention: string | null;
  outcome: SessionOutcome | null;
  startedAt: string;
  endedAt: string;
  plannedSeconds: number;
  // Actual focused time; equals plannedSeconds for a full focus, less for a partial.
  focusedSeconds: number;
  // Ended early via J3 — still counts toward the weekly goal (J3-R2).
  partial: boolean;
};

function isOutcome(value: unknown): value is SessionOutcome {
  return value === "finished" || value === "moved-forward" || value === "got-stuck";
}

function isFocusSession(value: unknown): value is FocusSession {
  if (typeof value !== "object" || value == null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate["id"] === "string" &&
    typeof candidate["loopId"] === "string" &&
    typeof candidate["roundIndex"] === "number" &&
    (candidate["intention"] === null || typeof candidate["intention"] === "string") &&
    (candidate["outcome"] === null || isOutcome(candidate["outcome"])) &&
    typeof candidate["startedAt"] === "string" &&
    typeof candidate["endedAt"] === "string" &&
    typeof candidate["plannedSeconds"] === "number" &&
    typeof candidate["focusedSeconds"] === "number" &&
    typeof candidate["partial"] === "boolean"
  );
}

export async function loadSessions(): Promise<FocusSession[]> {
  try {
    const raw = await AsyncStorage.getItem(SESSIONS_KEY);
    if (raw == null) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    // Drop malformed entries but keep the valid history — discarding the array here
    // would let the next recordSession overwrite the whole log (code review CR-01).
    return parsed.filter(isFocusSession);
  } catch {
    return [];
  }
}

export async function saveSessions(sessions: FocusSession[]): Promise<void> {
  await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export async function recordSession(session: Omit<FocusSession, "id">): Promise<FocusSession> {
  const sessions = await loadSessions();
  const recorded: FocusSession = {
    ...session,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  };
  sessions.push(recorded);
  await saveSessions(sessions);
  return recorded;
}

export async function updateSessionOutcome(
  id: string,
  outcome: SessionOutcome | null,
): Promise<void> {
  const sessions = await loadSessions();
  const index = sessions.findIndex((session) => session.id === id);
  if (index === -1) {
    return;
  }
  sessions[index] = { ...sessions[index]!, outcome };
  await saveSessions(sessions);
}

export function startOfDayTimestamp(date: Date): number {
  const copy = new Date(date.getTime());
  copy.setHours(0, 0, 0, 0);
  return copy.getTime();
}

export function localDayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function sessionsOnDay(sessions: FocusSession[], day: Date): FocusSession[] {
  const dayTimestamp = startOfDayTimestamp(day);
  return sessions.filter(
    (session) => startOfDayTimestamp(new Date(session.endedAt)) === dayTimestamp,
  );
}

export function sessionsInLoop(sessions: FocusSession[], loopId: string): FocusSession[] {
  return sessions
    .filter((session) => session.loopId === loopId)
    .sort((a, b) => a.roundIndex - b.roundIndex);
}
