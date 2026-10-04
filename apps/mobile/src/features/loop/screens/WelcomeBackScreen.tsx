import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Palette, typography } from "../../../shared/theme";
import { PrimaryButton, TextButton } from "../../../shared/ui/Buttons";

type Props = {
  colors: Palette;
  focusedSeconds: number;
  onHowDidItGo: () => void;
  onSkipToBreak: () => void;
};

// P13 Welcome back (J9): the app was killed mid-focus and the step expired while
// closed. Confirm the session was saved with zero blame copy, then route on.
export function WelcomeBackScreen({ colors, focusedSeconds, onHowDidItGo, onSkipToBreak }: Props) {
  const minutes = Math.max(1, Math.round(focusedSeconds / 60));
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]}>
      <View style={styles.center}>
        <Text style={[styles.kicker, { color: colors.muted }]}>WELCOME BACK</Text>
        <Text style={[styles.headline, { color: colors.ink }]}>
          Your {minutes}-minute focus was saved.
        </Text>
        <Text style={[styles.body, { color: colors.ink2 }]}>
          The app closed, but the time you put in still counts.
        </Text>
      </View>
      <View style={styles.actions}>
        <PrimaryButton
          label="How did it go?"
          onPress={onHowDidItGo}
          variant="ink"
          colors={colors}
        />
        <TextButton label="Skip to break" onPress={onSkipToBreak} colors={colors} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 24, paddingBottom: 24, justifyContent: "space-between" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  kicker: { ...typography.label, letterSpacing: 2 },
  headline: { ...typography.h1Screen, textAlign: "center" },
  body: { ...typography.body, textAlign: "center" },
  actions: { gap: 8 },
});
