import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "../../../shared/ui/SafeAreaView";
import { t } from "../../../i18n";
import { Palette, typography } from "../../../shared/theme";
import { TABLET_PADDING, useIsTablet } from "../../../shared/layout";
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
  const isTablet = useIsTablet();
  return (
    <SafeAreaView
      style={[
        styles.root,
        { backgroundColor: colors.bg },
        isTablet && { paddingHorizontal: TABLET_PADDING },
      ]}
    >
      <View style={styles.center}>
        <Text style={[styles.kicker, { color: colors.muted }]}>{t("WELCOME BACK")}</Text>
        <Text style={[styles.headline, { color: colors.ink }]}>
          {t("Your {minutes}-minute focus was saved.", { minutes })}
        </Text>
        <Text style={[styles.body, { color: colors.ink2 }]}>
          {t("The app closed, but the time you put in still counts.")}
        </Text>
      </View>
      <View style={styles.actions}>
        <PrimaryButton
          label={t("How did it go?")}
          onPress={onHowDidItGo}
          variant="ink"
          colors={colors}
        />
        <TextButton label={t("Skip to break")} onPress={onSkipToBreak} colors={colors} />
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
