import * as Notifications from "expo-notifications";
import { PermissionStatus, SchedulableTriggerInputTypes } from "expo-notifications";
import { eveningNoteDates, eveningNoteIdentifier } from "./eveningNote";
import { Reminder, ReminderPrefs } from "./reminderStore";
import { t } from "../../i18n";

// J5 reminders live under their own identifier family — step alerts
// (focus-loop-step-alert) are owned by NotificationScheduler and must never be
// cancelled by a reminder reconcile.
const REMINDER_ID_PREFIX = "focus-loop-reminder-";
const EVENING_ID_PREFIX = "focus-loop-evening-";

// ISO weekday (Mon=1..Sun=7) → expo-notifications weekly-trigger weekday
// (1=Sunday..7=Saturday, matching UNCalendar/iOS).
export function toExpoWeekday(isoDay: number): number {
  return isoDay === 7 ? 1 : isoDay + 1;
}

export function reminderIdentifier(reminderId: string, isoDay: number): string {
  return `${REMINDER_ID_PREFIX}${reminderId}-d${toExpoWeekday(isoDay)}`;
}

function reminderContent(reminder: Reminder): Notifications.NotificationContentInput {
  const hh = String(reminder.hour).padStart(2, "0");
  const mm = String(reminder.minute).padStart(2, "0");
  return {
    title: t("Focus time"),
    body: t("Your {time} focus is planned — tap to start your rhythm.", {
      time: `${hh}:${mm}`,
    }),
    // The tap routes through the same deep-link intent as the J4 widgets.
    data: { url: "focusloop://start" },
  };
}

function eveningNoteContent(): Notifications.NotificationContentInput {
  return {
    title: t("Still time to focus"),
    body: t("Goal day — a short focus still counts for your week."),
    data: { url: "focusloop://start" },
  };
}

// Serialise schedule mutations the same way step alerts do — reconciles fire
// from settings writes, foregrounding and session writes, so check→cancel→
// schedule must not interleave.
let queue: Promise<void> = Promise.resolve();

function enqueue(job: () => Promise<void>): Promise<void> {
  const next = queue.then(job, job);
  queue = next;
  return next;
}

async function scheduledIds(): Promise<string[]> {
  const pending = await Notifications.getAllScheduledNotificationsAsync();
  return pending.map((request) => request.identifier);
}

// Cancels every reminder + evening-note identifier, leaving step alerts intact.
export function clearReminderSchedules(): Promise<void> {
  return enqueue(async () => {
    for (const identifier of await scheduledIds()) {
      if (identifier.startsWith(REMINDER_ID_PREFIX) || identifier.startsWith(EVENING_ID_PREFIX)) {
        await Notifications.cancelScheduledNotificationAsync(identifier);
      }
    }
  });
}

export type SyncContext = {
  // True once a focus session is logged today — suppresses today's evening note.
  focusedToday: boolean;
  // True while the week's completed days are still under the goal — when the
  // goal is already met there is no "goal day" left to nudge on.
  goalUnmet: boolean;
  now: Date;
};

// Rebuild the full reminder schedule from prefs. J5 failure mode: permission
// denied → nothing is scheduled and the failure is silent (spec).
export function syncReminderSchedules(prefs: ReminderPrefs, context: SyncContext): Promise<void> {
  return enqueue(async () => {
    const wanted = new Set<string>();

    for (const reminder of prefs.reminders) {
      if (!reminder.enabled) {
        continue;
      }
      for (const isoDay of reminder.days) {
        wanted.add(reminderIdentifier(reminder.id, isoDay));
      }
    }
    if (context.goalUnmet) {
      for (const date of eveningNoteDates(prefs, context.focusedToday, context.now)) {
        wanted.add(eveningNoteIdentifier(date));
      }
    }

    const pending = new Set(await scheduledIds());
    const { status } = await Notifications.getPermissionsAsync();
    const granted = status === PermissionStatus.GRANTED;

    for (const identifier of pending) {
      const ours =
        identifier.startsWith(REMINDER_ID_PREFIX) || identifier.startsWith(EVENING_ID_PREFIX);
      if (ours && (!wanted.has(identifier) || !granted)) {
        await Notifications.cancelScheduledNotificationAsync(identifier);
      }
    }
    if (!granted) {
      return;
    }

    for (const reminder of prefs.reminders) {
      if (!reminder.enabled) {
        continue;
      }
      for (const isoDay of reminder.days) {
        const identifier = reminderIdentifier(reminder.id, isoDay);
        if (pending.has(identifier)) {
          continue;
        }
        await Notifications.scheduleNotificationAsync({
          identifier,
          content: reminderContent(reminder),
          trigger: {
            type: SchedulableTriggerInputTypes.WEEKLY,
            weekday: toExpoWeekday(isoDay),
            hour: reminder.hour,
            minute: reminder.minute,
          },
        });
      }
    }

    if (context.goalUnmet) {
      for (const date of eveningNoteDates(prefs, context.focusedToday, context.now)) {
        const identifier = eveningNoteIdentifier(date);
        if (pending.has(identifier)) {
          continue;
        }
        await Notifications.scheduleNotificationAsync({
          identifier,
          content: eveningNoteContent(),
          trigger: { type: SchedulableTriggerInputTypes.DATE, date },
        });
      }
    }
  });
}
