import { FlexWidget, TextWidget } from "react-native-android-widget";
import { liveRunning, type WidgetSnapshot } from "../../surfaces/widgetData";
import { widgetPalette } from "./widgetPalette";

// J4-R1/R2 small home-screen widget: the whole tile is the Start target —
// one tap opens focusloop://start, which begins a session with the last-used
// rhythm without showing Home. Footer shows this week's goal progress.
export function FocusStartWidget({ snapshot }: { snapshot: WidgetSnapshot }) {
  // CR-19: derive liveness from endsAtMs at render time — a republish may
  // never arrive after background/kill, so an expired countdown falls back
  // to the idle tile instead of freezing "Focusing · Nm left" forever.
  const running = liveRunning(snapshot);
  const headline =
    running == null
      ? `Focus ${snapshot.focusMinutes}`
      : running.kind === "focus"
        ? running.paused
          ? `Paused · ${snapshot.focusMinutes}m`
          : `Focusing · ${Math.max(1, Math.ceil((running.endsAtMs - Date.now()) / 60000))}m left`
        : "On a break";
  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: "focusloop://start" }}
      accessibilityLabel="Start a focus session"
      style={{
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: widgetPalette.bg,
        borderRadius: 16,
      }}
    >
      <TextWidget
        text="Focus Loop"
        style={{ color: widgetPalette.muted, fontSize: 11, letterSpacing: 1 }}
      />
      <TextWidget
        text={headline}
        style={{ color: widgetPalette.ink, fontSize: 20, fontWeight: "bold", marginTop: 2 }}
      />
      <TextWidget
        text={
          running == null
            ? `${snapshot.weekDaysMet} of ${snapshot.weekGoalDays} days this week · tap to start`
            : `${snapshot.weekDaysMet} of ${snapshot.weekGoalDays} days this week`
        }
        style={{ color: widgetPalette.accent, fontSize: 12, marginTop: 4 }}
      />
    </FlexWidget>
  );
}
