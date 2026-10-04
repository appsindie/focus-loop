import * as Notifications from "expo-notifications";
import { PermissionStatus, SchedulableTriggerInputTypes } from "expo-notifications";
import { t } from "../../i18n";

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let status = existingStatus;
  if (existingStatus !== PermissionStatus.GRANTED) {
    const { status: nextStatus } = await Notifications.requestPermissionsAsync();
    status = nextStatus;
  }
  return status === PermissionStatus.GRANTED;
}

// P23 step-boundary alerts: "Break time" when a focus ends, "Back to it" when a
// break ends. At most one is ever pending — the next engine transition resyncs
// it. Paused/step-done/terminal phases carry no pending alert (a pause would let
// it fire early). Scheduled J5 reminders are a separate mechanism and get their
// own ids when that slice lands — keep them out of this single slot.
export type StepAlertKind = "focus-end" | "break-end";

function stepAlertCopy(kind: StepAlertKind): { title: string; body: string } {
  return kind === "focus-end"
    ? { title: t("Break time"), body: t("Nice focus — time for a break.") }
    : { title: t("Back to it"), body: t("Break's over — your next focus is ready.") };
}

// Every step alert posts under one fixed OS identifier. Scheduling replaces the
// pending request (a second single-slot guarantee after the queue below), and
// boot cleanup can find orphaned pre-kill alerts by id without touching J5
// reminders, which use their own identifiers.
export const STEP_ALERT_IDENTIFIER = "focus-loop-step-alert";

let scheduledStepAlertId: string | null = null;

// afterEngineChange fires syncs fire-and-forget on every engine mutation, so
// calls overlap. Check → cancel → schedule must run as one serialised job: a
// cancel racing a half-done sync reads a null slot and the sync's scheduled
// request is orphaned forever. Helpers that run INSIDE a job must use the
// unlocked versions — re-enqueueing from inside a job deadlocks the queue.
let alertQueue: Promise<void> = Promise.resolve();

function enqueueAlertJob(job: () => Promise<void>): Promise<void> {
  const next = alertQueue.then(job, job);
  alertQueue = next;
  return next;
}

async function cancelStepAlertUnlocked(): Promise<void> {
  if (scheduledStepAlertId != null) {
    const id = scheduledStepAlertId;
    scheduledStepAlertId = null;
    await Notifications.cancelScheduledNotificationAsync(id);
  }
}

export function cancelStepAlert(): Promise<void> {
  return enqueueAlertJob(cancelStepAlertUnlocked);
}

// Called after every engine mutation and once at boot. Without a granted
// permission nothing is scheduled (spec: reminders/alerts are silently
// unavailable — J5 failure mode).
export function syncStepAlert(
  kind: StepAlertKind | null,
  seconds: number,
  soundEnabled: boolean,
): Promise<void> {
  return enqueueAlertJob(async () => {
    const { status } = await Notifications.getPermissionsAsync();
    const scheduledSeconds = Math.max(0, Math.ceil(seconds));
    if (status !== PermissionStatus.GRANTED || kind == null || scheduledSeconds <= 0) {
      await cancelStepAlertUnlocked();
      return;
    }
    await cancelStepAlertUnlocked();
    scheduledStepAlertId = await Notifications.scheduleNotificationAsync({
      identifier: STEP_ALERT_IDENTIFIER,
      content: {
        ...stepAlertCopy(kind),
        sound: soundEnabled,
      },
      trigger: {
        type: SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: scheduledSeconds,
      },
    });
  });
}

// Boot only: alerts scheduled before an OS-kill are orphaned (their in-memory
// slot is gone). Cancel the ones still pending under our identifier — J5
// reminders live under different identifiers and survive. Runs before the
// no-snapshot early return so a dropped/corrupt snapshot still clears orphans.
export function clearStepAlertsAtBoot(): Promise<void> {
  return enqueueAlertJob(async () => {
    scheduledStepAlertId = null;
    const pending = await Notifications.getAllScheduledNotificationsAsync();
    for (const request of pending) {
      if (request.identifier === STEP_ALERT_IDENTIFIER) {
        await Notifications.cancelScheduledNotificationAsync(request.identifier);
      }
    }
  });
}
