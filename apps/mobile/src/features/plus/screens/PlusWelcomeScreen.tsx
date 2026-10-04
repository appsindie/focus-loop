import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { t } from "../../../i18n";
import { Palette, typography } from "../../../shared/theme";
import { PrimaryButton } from "../../../shared/ui/Buttons";

// P16: confirms Plus and routes back — ads-gone line plus the three most
// valuable unlocks (history, themes/sounds, share) per the canvas.
export function PlusWelcomeScreen({
  colors,
  onContinue,
}: {
  colors: Palette;
  onContinue: () => void;
}) {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.body}>
        <Text style={[styles.mark, { color: colors.focus }]} allowFontScaling>
          ✦
        </Text>
        <Text style={[styles.title, { color: colors.ink }]} allowFontScaling>
          {t("Welcome to Plus")}
        </Text>
        <Text style={[styles.line, { color: colors.ink2 }]} allowFontScaling>
          {t("Ads are gone for good.")}
        </Text>
        <View style={styles.unlocks}>
          <Text style={[styles.unlock, { color: colors.ink2 }]} allowFontScaling>
            {t("Full focus history")}
          </Text>
          <Text style={[styles.unlock, { color: colors.ink2 }]} allowFontScaling>
            {t("All themes & sounds")}
          </Text>
          <Text style={[styles.unlock, { color: colors.ink2 }]} allowFontScaling>
            {t("Unlimited share cards")}
          </Text>
        </View>
      </View>
      <View style={styles.footer}>
        <PrimaryButton label={t("Back to my loop")} onPress={onContinue} colors={colors} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  body: { flex: 1, alignItems: "center", justifyContent: "center" },
  mark: { fontSize: 48, marginBottom: 16 },
  title: { ...typography.h1Screen, marginBottom: 12 },
  line: { ...typography.body, marginBottom: 24 },
  unlocks: { gap: 8 },
  unlock: { ...typography.body, textAlign: "center" },
  footer: { paddingBottom: 8 },
});
