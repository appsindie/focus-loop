import { FocusSession, startOfDayTimestamp } from "./SessionLog";

export const DEFAULT_WEEKLY_GOAL_DAYS = 4;

export type WeekDayEntry = {
  dayTimestamp: number;
  focusedSeconds: number;
  sessionCount: number;
  met: boolean;
};

export type WeekProgress = {
  weekStartTimestamp: number;
  goalDays: number;
  daysMet: number;
  goalMet: boolean;
  // Seven calendar entries, Monday-first.
  days: WeekDayEntry[];
};

// Spec J2-R6 / J6-R1/R2: a calendar day counts when at least one session, including a
// partial one, was recorded that day; a missed day resets nothing. Week = ISO week,
// Monday start.
export function startOfWeekTimestamp(date: Date): number {
  const copy = new Date(startOfDayTimestamp(date));
  const day = copy.getDay();
  const offsetToMonday = (day + 6) % 7;
  copy.setDate(copy.getDate() - offsetToMonday);
  return copy.getTime();
}

export function computeWeekProgress(
  sessions: FocusSession[],
  now: Date,
  goalDays: number = DEFAULT_WEEKLY_GOAL_DAYS,
): WeekProgress {
  const weekStart = startOfWeekTimestamp(now);
  const days: WeekDayEntry[] = [];

  for (let i = 0; i < 7; i += 1) {
    const dayStart = new Date(weekStart);
    dayStart.setDate(dayStart.getDate() + i);
    const dayTimestamp = dayStart.getTime();
    const nextDay = new Date(dayStart);
    nextDay.setDate(nextDay.getDate() + 1);

    const daySessions = sessions.filter((session) => {
      const ended = new Date(session.endedAt).getTime();
      return ended >= dayTimestamp && ended < nextDay.getTime();
    });

    days.push({
      dayTimestamp,
      focusedSeconds: daySessions.reduce((sum, s) => sum + s.focusedSeconds, 0),
      sessionCount: daySessions.length,
      met: daySessions.length > 0,
    });
  }

  const daysMet = days.filter((day) => day.met).length;
  return {
    weekStartTimestamp: weekStart,
    goalDays,
    daysMet,
    goalMet: daysMet >= goalDays,
    days,
  };
}
