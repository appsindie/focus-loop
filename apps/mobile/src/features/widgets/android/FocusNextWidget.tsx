import { FlexWidget, TextWidget } from "react-native-android-widget";
import { liveRunning, type WidgetSnapshot } from "../../surfaces/widgetData";
import { widgetPalette } from "./widgetPalette";

// J4-R2 medium home-screen widget: week progress, the next parked thought to
// pick up (P06), and an explicit Start button deep-linking focusloop://start.
export function FocusNextWidget({ snapshot }: { snapshot: WidgetSnapshot }) {
  // CR-19: an expired running state renders as "next up", not a frozen session.
  const running = liveRunning(snapshot);
  const nextLine =
    running != null
      ? running.kind === "focus"
        ? "Focusing now"
        : "On a break"
      : snapshot.nextParkedText != null
        ? `Next up: ${snapshot.nextParkedText}`
        : `Next up: Focus ${snapshot.focusMinutes}`;
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        backgroundColor: widgetPalette.bg,
        borderRadius: 16,
      }}
    >
      <FlexWidget style={{ flex: 1, flexDirection: "column", justifyContent: "center" }}>
        <TextWidget
          text={`${snapshot.weekDaysMet} of ${snapshot.weekGoalDays} days this week`}
          style={{ color: widgetPalette.accent, fontSize: 12 }}
        />
        <TextWidget
          text={nextLine}
          truncate="END"
          maxLines={2}
          style={{ color: widgetPalette.ink, fontSize: 15, fontWeight: "bold", marginTop: 4 }}
        />
      </FlexWidget>
      <FlexWidget
        clickAction="OPEN_URI"
        clickActionData={{ uri: "focusloop://start" }}
        accessibilityLabel="Start"
        style={{
          justifyContent: "center",
          paddingHorizontal: 18,
          paddingVertical: 10,
          backgroundColor: widgetPalette.accent,
          borderRadius: 999,
        }}
      >
        <TextWidget
          text="Start"
          style={{ color: widgetPalette.bg, fontSize: 14, fontWeight: "bold" }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
