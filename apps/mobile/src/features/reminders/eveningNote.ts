import { EVENING_NOTE_HOUR, EVENING_NOTE_MINUTE, ReminderPrefs } from "./reminderStore";

// J5-R2 evening note semantics ("If you haven't focused by 20:00 on a goal day").
// A "goal day" is any day while the weekly goal is still unmet — so a note is
// only worth firing while the goal is open. We can't know the future, so the
// scheduler places one-shot notes up to N days ahead and every app reconcile
// re-evaluates: after a focus completes or the goal is met, today's pending
// note is dropped and the horizon shifts forward.
export const EVENING_NOTE_HORIZON_DAYS = 7;

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Dates in the next `horizonDays` (inclusive of today) that should carry an
// evening note. `focusedToday` suppresses today's note — the P22 copy only
// nudges when nothing has been logged by 20:00 yet. Days the user already
// past 20:00 are skipped for today but future days stay.
export function eveningNoteDates(
  prefs: ReminderPrefs,
  focusedToday: boolean,
  now: Date,
  horizonDays = EVENING_NOTE_HORIZON_DAYS,
): Date[] {
  if (!prefs.eveningNote) {
    return [];
  }
  const today = startOfLocalDay(now);
  const todaysNote = new Date(today);
  todaysNote.setHours(EVENING_NOTE_HOUR, EVENING_NOTE_MINUTE, 0, 0);
  const dates: Date[] = [];
  for (let offset = 0; offset < horizonDays; offset += 1) {
    const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
    const noteAt = new Date(day);
    noteAt.setHours(EVENING_NOTE_HOUR, EVENING_NOTE_MINUTE, 0, 0);
    if (offset === 0 && (focusedToday || noteAt.getTime() <= now.getTime())) {
      continue;
    }
    dates.push(noteAt);
  }
  return dates;
}

// Deterministic OS identifier per note date — stable across reconciles so
// cancelling by id works without persisting a schedule map.
export function eveningNoteIdentifier(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `focus-loop-evening-${yyyy}${mm}${dd}`;
}
