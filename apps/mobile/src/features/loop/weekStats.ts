import { locale, t } from "../../i18n";
import { FocusSession } from "./SessionLog";
import { WeekProgress } from "./weeklyGoal";

export type WeekTotals = {
  totalSeconds: number;
  finished: number;
  movedForward: number;
  gotStuck: number;
  noOutcome: number;
};

// J6-R1: totals for the Week screen — outcomes counted across the same sessions
// that marked the days, so the numbers always agree with the bars.
export function computeWeekTotals(sessions: FocusSession[], week: WeekProgress): WeekTotals {
  const inWeek = sessions.filter((s) => Date.parse(s.endedAt) >= week.weekStartTimestamp);
  const totals: WeekTotals = {
    totalSeconds: 0,
    finished: 0,
    movedForward: 0,
    gotStuck: 0,
    noOutcome: 0,
  };
  for (const session of inWeek) {
    totals.totalSeconds += session.focusedSeconds;
    if (session.outcome === "finished") {
      totals.finished += 1;
    } else if (session.outcome === "moved-forward") {
      totals.movedForward += 1;
    } else if (session.outcome === "got-stuck") {
      totals.gotStuck += 1;
    } else {
      totals.noOutcome += 1;
    }
  }
  return totals;
}

export function weekdayLabels(): string[] {
  return [t("Mon"), t("Tue"), t("Wed"), t("Thu"), t("Fri"), t("Sat"), t("Sun")];
}

// One plain-language insight per J6 SCR-week — a single honest sentence, never
// a streak. Priority: goal met > best day > most-progress hint > empty week.
export function weekInsight(week: WeekProgress, totals: WeekTotals, now: Date): string {
  if (week.daysMet === 0) {
    return t("One focused session marks the day — any minute counts.");
  }
  if (week.goalMet) {
    return t("Goal met — {daysMet} of {goalDays} days focused this week.", {
      daysMet: week.daysMet,
      goalDays: week.goalDays,
    });
  }
  const best = week.days.reduce(
    (acc, day) => (day.focusedSeconds > acc.focusedSeconds ? day : acc),
    week.days[0]!,
  );
  const bestDate = new Date(best.dayTimestamp);
  const isToday =
    bestDate.getFullYear() === now.getFullYear() &&
    bestDate.getMonth() === now.getMonth() &&
    bestDate.getDate() === now.getDate();
  if (!isToday && best.focusedSeconds > 0) {
    const label = bestDate.toLocaleDateString(locale(), { weekday: "long" });
    return t("{day} was your deepest day — {minutes} min focused.", {
      day: label,
      minutes: Math.round(best.focusedSeconds / 60),
    });
  }
  const remaining = week.goalDays - week.daysMet;
  return remaining === 1
    ? t("1 more day to hit this week's goal.")
    : t("{remaining} more days to hit this week's goal.", { remaining });
}
