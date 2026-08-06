import * as Notifications from "expo-notifications";
import { PermissionStatus, SchedulableTriggerInputTypes } from "expo-notifications";

let scheduledNotificationId: string | null = null;

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let status = existingStatus;
  if (existingStatus !== PermissionStatus.GRANTED) {
    const { status: nextStatus } = await Notifications.requestPermissionsAsync();
    status = nextStatus;
  }
  return status === PermissionStatus.GRANTED;
}

export async function scheduleTimerCompletionNotification(seconds: number): Promise<void> {
  await cancelTimerNotification();

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Focus Loop",
      body: "Focus session complete. Time for a break.",
      sound: true,
    },
    trigger: {
      type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
    },
  });

  scheduledNotificationId = id;
}

export async function cancelTimerNotification(): Promise<void> {
  if (scheduledNotificationId) {
    await Notifications.cancelScheduledNotificationAsync(scheduledNotificationId);
    scheduledNotificationId = null;
  }
}
