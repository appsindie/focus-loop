import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "../../../shared/ui/SafeAreaView";
import { DisplayMode } from "../../settings/SettingsStore";
import { t } from "../../../i18n";
import { Palette, typography } from "../../../shared/theme";
import { TABLET_PADDING, useIsTablet } from "../../../shared/layout";
import { PrimaryButton, SecondaryButton } from "../../../shared/ui/Buttons";
import { FocusDisc } from "../ui/FocusDisc";

const SUGGESTIONS = [
  () => t("Look far away. Let your eyes rest."),
  () => t("Water. Stand up. Slow breaths."),
  () => t("No feeds. The loop is still running."),
];

function formatClock(ms: number): string {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// P11: full break-bg, follows display choice (white disc or big numbers), three
// suggestions, +5 min secondary, Focus N now primary (white on dark-green fill).
export function BreakScreen({
  colors,
  displayMode,
  remainingSeconds,
  durationSeconds,
  nextFocusNumber,
  autoStart,
  onExtend,
  onStartFocus,
}: {
  colors: Palette;
  displayMode: DisplayMode;
  remainingSeconds: number;
  durationSeconds: number;
  nextFocusNumber: number;
  autoStart: boolean;
  onExtend: () => void;
  onStartFocus: () => void;
}) {
  const progress = durationSeconds > 0 ? 1 - remainingSeconds / durationSeconds : 0;
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const endsAt = formatClock(Date.now() + remainingSeconds * 1000);
  // On the break field everything renders in on-break/break-muted roles.
  const ink = colors.onBreak;
  const sub = colors.breakMuted;
  const discColors: Palette = {
    ...colors,
    focus: "#FFFFFF",
    track: "rgba(255,255,255,0.28)",
  };

  const isTablet = useIsTablet();
  return (
    <SafeAreaView
      style={[
        styles.root,
        { backgroundColor: colors.breakBg },
        // T03: the same centered break column, just wider margins.
        isTablet && {
          paddingHorizontal: TABLET_PADDING,
          maxWidth: 640,
          alignSelf: "center",
          width: "100%",
        },
      ]}
    >
      <Text style={[styles.kicker, { color: sub }]}>{t("BREAK")}</Text>
      <View style={styles.timeArea}>
        {displayMode === "disc" ? (
          <FocusDisc
            progress={progress}
            remainingMinutes={Math.ceil(remainingSeconds / 60)}
            colors={discColors}
            size={220}
            strokeWidth={12}
          />
        ) : (
          <Text style={[styles.minutes, { color: ink }]} maxFontSizeMultiplier={1.3}>
            {minutes}:{String(seconds).padStart(2, "0")}
          </Text>
        )}
        <Text style={[styles.until, { color: sub }]}>
          {autoStart
            ? t("Focus starts at {endsAt}", { endsAt })
            : t("Back at {endsAt}", { endsAt })}
        </Text>
      </View>

      <View style={styles.suggestions}>
        {SUGGESTIONS.map((suggestion, i) => (
          <Text key={i} style={[styles.suggestion, { color: sub }]}>
            · {suggestion()}
          </Text>
        ))}
      </View>

      <View style={styles.actions}>
        <SecondaryButton label={t("+5 min")} onPress={onExtend} colors={{ ...colors, ink }} />
        <PrimaryButton
          label={t("Focus {n} now", { n: nextFocusNumber })}
          onPress={onStartFocus}
          colors={colors}
          variant="light"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 24, gap: 12 },
  kicker: { ...typography.label, letterSpacing: 2, textAlign: "center" },
  timeArea: { flex: 1, alignItems: "center", justifyContent: "center", gap: 18 },
  minutes: {
    ...typography.timer,
    fontSize: 120,
    fontVariant: ["tabular-nums"],
  },
  until: { ...typography.body },
  suggestions: { gap: 6, alignItems: "center" },
  suggestion: { ...typography.caption, fontSize: 14 },
  actions: { gap: 10 },
});
