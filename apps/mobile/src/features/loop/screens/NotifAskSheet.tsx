import { StyleSheet, Text } from "react-native";
import { Palette, typography } from "../../../shared/theme";
import { PrimaryButton, TextButton } from "../../../shared/ui/Buttons";
import { Sheet } from "../../../shared/ui/Sheet";

// P03: shown once after the first completed focus, before the OS dialog. Lists
// exactly the three notification types the app sends. "Not now" handled by the
// 7-day re-ask window in notifications/notifAsk.
export function NotifAskSheet({
  visible,
  colors,
  onAllow,
  onNotNow,
}: {
  visible: boolean;
  colors: Palette;
  onAllow: () => void;
  onNotNow: () => void;
}) {
  return (
    <Sheet
      visible={visible}
      onDismiss={onNotNow}
      colors={colors}
      accessibilityLabel="Turn on notifications"
    >
      <Text style={[styles.title, { color: colors.ink }]}>A nudge, only when it helps</Text>
      <Text style={[styles.item, { color: colors.ink2 }]}>· Break time — when a focus ends</Text>
      <Text style={[styles.item, { color: colors.ink2 }]}>· Back to it — when a break ends</Text>
      <Text style={[styles.item, { color: colors.ink2 }]}>
        · Time to focus — a reminder you set
      </Text>
      <Text style={[styles.note, { color: colors.muted }]}>Nothing else. No marketing.</Text>
      <PrimaryButton label="Turn on notifications" onPress={onAllow} colors={colors} />
      <TextButton label="Not now" onPress={onNotNow} colors={colors} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.title },
  item: { ...typography.body },
  note: { ...typography.caption, fontSize: 14 },
});
