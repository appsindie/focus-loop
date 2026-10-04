import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DisplayMode } from "../../settings/SettingsStore";
import { t } from "../../../i18n";
import { Palette, typography } from "../../../shared/theme";
import { TABLET_PADDING, useIsTablet } from "../../../shared/layout";
import { FocusDisc } from "../ui/FocusDisc";

// P02: shown once. Two full-width cards; a tap saves the display choice AND
// starts the first focus — no Start button, no onboarding pages (J1-R2/R3).
export function FirstLaunchScreen({
  colors,
  onChoose,
}: {
  colors: Palette;
  onChoose: (mode: DisplayMode) => void;
}) {
  const isTablet = useIsTablet();
  return (
    <SafeAreaView
      style={[
        styles.root,
        { backgroundColor: colors.bg },
        isTablet && { paddingHorizontal: TABLET_PADDING },
      ]}
    >
      <Text style={[styles.headline, { color: colors.ink }]}>
        {t("One thing.")}
        {"\n"}
        {t("Then a break.")}
      </Text>
      <Text style={[styles.sub, { color: colors.muted }]}>{t("How do you want to see time?")}</Text>
      <View style={styles.cards}>
        <Pressable
          onPress={() => onChoose("disc")}
          accessibilityRole="button"
          accessibilityLabel={t("See it — a disc that shrinks as time passes")}
          style={({ pressed }) => [
            styles.card,
            { backgroundColor: colors.surface, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <FocusDisc
            progress={0.35}
            remainingMinutes={16}
            colors={colors}
            size={180}
            strokeWidth={12}
          />
          <Text style={[styles.cardTitle, { color: colors.ink }]}>{t("See it")}</Text>
          <Text style={[styles.cardBody, { color: colors.muted }]}>
            {t("A disc that shrinks as the minutes pass.")}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onChoose("numbers")}
          accessibilityRole="button"
          accessibilityLabel={t("Read it — big numbers counting down")}
          style={({ pressed }) => [
            styles.card,
            { backgroundColor: colors.surface, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <View style={styles.numbersPreview}>
            <Text style={[styles.numbersDigits, { color: colors.ink }]}>24</Text>
            <Text style={[styles.numbersSeconds, { color: colors.faint }]}>58</Text>
          </View>
          <Text style={[styles.cardTitle, { color: colors.ink }]}>{t("Read it")}</Text>
          <Text style={[styles.cardBody, { color: colors.muted }]}>
            {t("Big numbers, down to the second if you want them.")}
          </Text>
        </Pressable>
      </View>
      <Text style={[styles.footnote, { color: colors.faint }]}>
        {t("Picking one starts your first 25 minutes.")}
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 24, justifyContent: "space-between" },
  headline: { ...typography.h1Screen, marginTop: 24 },
  sub: { ...typography.body, marginTop: -8 },
  cards: { gap: 16 },
  card: {
    borderRadius: 24,
    padding: 20,
    minHeight: 200,
  },
  cardTitle: { ...typography.title, marginTop: 12 },
  cardBody: { ...typography.caption, fontSize: 15, marginTop: 2 },
  numbersPreview: { flexDirection: "row", alignItems: "baseline", height: 180 },
  numbersDigits: {
    fontSize: 120,
    fontWeight: "600",
    letterSpacing: -6,
    fontVariant: ["tabular-nums"],
  },
  numbersSeconds: { ...typography.timerSeconds, marginLeft: 6, fontVariant: ["tabular-nums"] },
  footnote: { ...typography.caption, textAlign: "center" },
});
