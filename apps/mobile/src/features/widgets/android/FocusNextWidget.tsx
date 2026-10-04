import { FlexWidget, TextWidget } from "react-native-android-widget";
import { t } from "../../../i18n";
import { formatEndTime, liveRunning, type WidgetSnapshot } from "../../surfaces/widgetData";
import { widgetPalette } from "./widgetPalette";

// J4-R2 medium home-screen widget: week progress, the next parked thought to
// pick up (P06), and an explicit Start button deep-linking focusloop://start.
export function FocusNextWidget({ snapshot }: { snapshot: WidgetSnapshot }) {
  // CR-19: an expired running state renders as "next up", not a frozen session.
  const running = liveRunning(snapshot);
  const nextLine =
    running != null
      ? running.kind === "focus"
        ? t("Focusing until {endsAt}", { endsAt: formatEndTime(running.endsAtMs) })
        : t("On a break until {endsAt}", { endsAt: formatEndTime(running.endsAtMs) })
      : snapshot.nextParkedText != null
        ? t("Next up: {text}", { text: snapshot.nextParkedText })
        : t("Next up: Focus {minutes}", { minutes: snapshot.focusMinutes });
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
          text={t("{daysMet} of {goalDays} days this week", {
            daysMet: snapshot.weekDaysMet,
            goalDays: snapshot.weekGoalDays,
          })}
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
        accessibilityLabel={t("Start")}
        style={{
          justifyContent: "center",
          paddingHorizontal: 18,
          paddingVertical: 10,
          backgroundColor: widgetPalette.accent,
          borderRadius: 999,
        }}
      >
        <TextWidget
          text={t("Start")}
          style={{ color: widgetPalette.bg, fontSize: 14, fontWeight: "bold" }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
