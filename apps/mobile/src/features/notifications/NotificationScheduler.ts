import * as Notifications from "expo-notifications";
import { PermissionStatus, SchedulableTriggerInputTypes } from "expo-notifications";

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

const STEP_ALERT_COPY: Record<StepAlertKind, { title: string; body: string }> = {
  "focus-end": { title: "Break time", body: "Nice focus — time for a break." },
  "break-end": { title: "Back to it", body: "Break's over — your next focus is ready." },
};

let scheduledStepAlertId: string | null = null;

export async function cancelStepAlert(): Promise<void> {
  if (scheduledStepAlertId != null) {
    const id = scheduledStepAlertId;
    scheduledStepAlertId = null;
    await Notifications.cancelScheduledNotificationAsync(id);
  }
}

// Called after every engine mutation and once at boot. Without a granted
// permission nothing is scheduled (spec: reminders/alerts are silently
// unavailable — J5 failure mode).
export async function syncStepAlert(
  kind: StepAlertKind | null,
  seconds: number,
  soundEnabled: boolean,
): Promise<void> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== PermissionStatus.GRANTED || kind == null) {
    await cancelStepAlert();
    return;
  }
  const scheduledSeconds = Math.max(0, Math.ceil(seconds));
  if (scheduledSeconds <= 0) {
    await cancelStepAlert();
    return;
  }
  await cancelStepAlert();
  scheduledStepAlertId = await Notifications.scheduleNotificationAsync({
    content: {
      ...STEP_ALERT_COPY[kind],
      sound: soundEnabled,
    },
    trigger: {
      type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: scheduledSeconds,
    },
  });
}

// Boot only: alerts scheduled before an OS-kill are orphaned (their ids lived
// in memory). Everything this module schedules is derived from engine state, so
// wipe the OS queue and let the post-restore sync recreate what's still true.
export async function clearStepAlertsAtBoot(): Promise<void> {
  scheduledStepAlertId = null;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
