import * as Notifications from "expo-notifications";
import type { RunningStepSurface } from "./widgetData";

// Android running-session surface (J4-R3 parity / P23): an ongoing, non-
// dismissible notification on a low-importance channel — the managed-workflow
// equivalent of the spec's foreground-service notification. A fixed identifier
// means each update replaces the previous one; LOW importance keeps it silent.
const LIVE_CHANNEL_ID = "focus-loop-live";
const LIVE_NOTIFICATION_ID = "focus-loop-live";

function formatUntil(endsAtMs: number): string {
  const end = new Date(endsAtMs);
  const hh = String(end.getHours()).padStart(2, "0");
  const mm = String(end.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function copyFor(state: RunningStepSurface): { title: string; body: string } {
  const label =
    state.kind === "focus"
      ? `Focus ${state.currentFocusNumber} of ${state.totalFocusCount}`
      : "Break";
  if (state.paused) {
    return { title: label, body: "Paused" };
  }
  const minutes = Math.max(1, Math.ceil(state.remainingSeconds / 60));
  return { title: label, body: `~${minutes} min left · until ${formatUntil(state.endsAtMs)}` };
}

export async function syncLiveSurface(state: RunningStepSurface | null): Promise<void> {
  try {
    if (state == null) {
      // CR-17: dismiss unconditionally — the notification outlives this
      // process (sticky + autoDismiss:false), so an in-memory "was it mine"
      // flag is false after every OS kill. Dismissing an absent id is a no-op.
      await Notifications.dismissNotificationAsync(LIVE_NOTIFICATION_ID);
      return;
    }
    await Notifications.setNotificationChannelAsync(LIVE_CHANNEL_ID, {
      name: "Focus Loop — in progress",
      importance: Notifications.AndroidImportance.LOW,
    });
    const { title, body } = copyFor(state);
    await Notifications.scheduleNotificationAsync({
      identifier: LIVE_NOTIFICATION_ID,
      content: {
        title,
        body,
        sticky: true,
        autoDismiss: false,
      },
      // An Android channelId-only trigger posts immediately on our channel.
      trigger: { channelId: LIVE_CHANNEL_ID },
    });
  } catch {
    // Notification permission denied or channel unavailable — silent per spec.
  }
}
