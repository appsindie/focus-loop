import AsyncStorage from "@react-native-async-storage/async-storage";

const SESSIONS_KEY = "focus-loop/sessions";

export type CompletedSession = {
  id: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
};

export type SessionStats = {
  sessionsToday: number;
  streakDays: number;
};

function startOfDayTimestamp(date: Date): number {
  const copy = new Date(date.getTime());
  copy.setHours(0, 0, 0, 0);
  return copy.getTime();
}

export async function loadSessions(): Promise<CompletedSession[]> {
  try {
    const raw = await AsyncStorage.getItem(SESSIONS_KEY);
    if (raw == null) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed as CompletedSession[];
  } catch {
    return [];
  }
}

export async function saveSessions(sessions: CompletedSession[]): Promise<void> {
  await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export async function recordSession(
  startedAt: Date,
  durationSeconds: number,
): Promise<CompletedSession> {
  const sessions = await loadSessions();
  const session: CompletedSession = {
    id: `${startedAt.getTime()}-${Math.random().toString(36).slice(2, 9)}`,
    startedAt: startedAt.toISOString(),
    endedAt: new Date().toISOString(),
    durationSeconds,
  };
  sessions.push(session);
  await saveSessions(sessions);
  return session;
}

export function computeStreak(sessions: CompletedSession[], now: Date): number {
  const uniqueDayTimestamps = new Set(
    sessions.map((session) => startOfDayTimestamp(new Date(session.endedAt))),
  );
  const uniqueDays = Array.from(uniqueDayTimestamps).sort((a, b) => b - a);

  const today = startOfDayTimestamp(now);
  const yesterday = today - 24 * 60 * 60 * 1000;
  const mostRecentDay = uniqueDays[0];

  if (mostRecentDay == null) {
    return 0;
  }

  if (mostRecentDay !== today && mostRecentDay !== yesterday) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < uniqueDays.length; i += 1) {
    const previousDay = uniqueDays[i - 1]! - 24 * 60 * 60 * 1000;
    const currentDay = uniqueDays[i]!;
    if (currentDay === previousDay) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

export function computeStats(sessions: CompletedSession[], now: Date): SessionStats {
  const todayTimestamp = startOfDayTimestamp(now);
  const sessionsToday = sessions.filter(
    (session) => startOfDayTimestamp(new Date(session.endedAt)) === todayTimestamp,
  ).length;

  return {
    sessionsToday,
    streakDays: computeStreak(sessions, now),
  };
}
