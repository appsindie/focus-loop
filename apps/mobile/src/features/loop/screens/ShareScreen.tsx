import { useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { FocusSession } from "../SessionLog";
import { WeekProgress } from "../weeklyGoal";
import { computeWeekTotals } from "../weekStats";
import { Palette, typography } from "../../../shared/theme";

export type ShareCardStyle = "ink" | "paper" | "ember";

const CARD_STYLES: Record<ShareCardStyle, { bg: string; ink: string; muted: string }> = {
  // J6-R5: three card faces; every one carries the app name.
  ink: { bg: "#1C1917", ink: "#F6F3EE", muted: "#B8AFA4" },
  paper: { bg: "#FBF6EF", ink: "#26221C", muted: "#8A7F70" },
  ember: { bg: "#D4631F", ink: "#FFF7F0", muted: "#FFD9C4" },
};

const STYLE_ORDER: ShareCardStyle[] = ["ink", "paper", "ember"];

// The off-screen card rendered at a fixed 9:16 canvas so the shared image is
// identical on every device. Always carries the app name (J6-R5).
function ShareCard({
  week,
  totals,
  intentions,
  showWorkedOn,
  cardStyle,
}: {
  week: WeekProgress;
  totals: { totalSeconds: number; finished: number };
  intentions: string[];
  showWorkedOn: boolean;
  cardStyle: ShareCardStyle;
}) {
  const c = CARD_STYLES[cardStyle];
  return (
    <View style={[cardStyles.card, { backgroundColor: c.bg }]}>
      <Text style={[cardStyles.appName, { color: c.muted }]}>FOCUS LOOP</Text>
      <Text style={[cardStyles.headline, { color: c.ink }]}>
        {week.daysMet} of {week.goalDays} days
      </Text>
      <Text style={[cardStyles.sub, { color: c.muted }]}>focused this week</Text>
      <View style={cardStyles.rule} />
      <Text style={[cardStyles.stat, { color: c.ink }]}>
        {Math.round(totals.totalSeconds / 60)} min · {totals.finished} finished
      </Text>
      {showWorkedOn && intentions.length > 0 ? (
        <View style={cardStyles.workedOn}>
          {intentions.slice(0, 3).map((text) => (
            <Text key={text} style={[cardStyles.intention, { color: c.ink }]} numberOfLines={1}>
              “{text}”
            </Text>
          ))}
        </View>
      ) : null}
      <View style={cardStyles.spacer} />
      <Text style={[cardStyles.footer, { color: c.muted }]}>focusloop.app</Text>
    </View>
  );
}

const CARD_WIDTH = 720;
const CARD_HEIGHT = 1280; // 9:16

const cardStyles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    padding: 64,
    justifyContent: "flex-start",
  },
  appName: { fontSize: 30, fontWeight: "700", letterSpacing: 6, marginTop: 24 },
  headline: { fontSize: 120, fontWeight: "700", letterSpacing: -3, marginTop: 200 },
  sub: { fontSize: 40, marginTop: 8 },
  rule: { height: 2, backgroundColor: "rgba(128,128,128,0.35)", marginVertical: 48 },
  stat: { fontSize: 44, fontWeight: "600" },
  workedOn: { marginTop: 48, gap: 20 },
  intention: { fontSize: 36, fontStyle: "italic" },
  spacer: { flex: 1 },
  footer: { fontSize: 28, letterSpacing: 2 },
});

// P19: card preview → style pick → privacy toggle → share image via the
// system sheet. The image is captured from the off-screen 9:16 card, not the
// on-screen preview, so output resolution doesn't depend on the device.
export function ShareScreen({
  sessions,
  week,
  onBack,
  colors,
}: {
  sessions: FocusSession[];
  week: WeekProgress;
  onBack: () => void;
  colors: Palette;
}) {
  const [cardStyle, setCardStyle] = useState<ShareCardStyle>("paper");
  // J6-R5: "Show what I worked on" defaults OFF — intentions never leave the
  // device unless the user flips this on for THIS card.
  const [showWorkedOn, setShowWorkedOn] = useState(false);
  const [sharing, setSharing] = useState(false);
  const cardRef = useRef<View>(null);
  const totals = useMemo(() => computeWeekTotals(sessions, week), [sessions, week]);
  const intentions = useMemo(
    () =>
      sessions
        .filter((s) => Date.parse(s.endedAt) >= week.weekStartTimestamp && s.intention != null)
        .map((s) => s.intention!)
        .filter((text, index, all) => all.indexOf(text) === index),
    [sessions, week.weekStartTimestamp],
  );

  const shareImage = async () => {
    if (sharing) {
      return;
    }
    setSharing(true);
    try {
      const uri = await captureRef(cardRef, { format: "png", quality: 1 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Share your week" });
      }
    } catch {
      // Cancel or capture failure — nothing recorded (J6 exit-failure rule).
    } finally {
      setSharing(false);
    }
  };

  const preview = CARD_STYLES[cardStyle];
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onBack}
          hitSlop={8}
          style={styles.back}
        >
          <Text style={[styles.backText, { color: colors.ink }]}>Back</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.ink }]}>Share your week</Text>
        <View style={styles.back} />
      </View>

      <View style={[styles.preview, { backgroundColor: preview.bg }]}>
        <Text style={[styles.previewApp, { color: preview.muted }]}>FOCUS LOOP</Text>
        <Text style={[styles.previewHeadline, { color: preview.ink }]}>
          {week.daysMet} of {week.goalDays} days
        </Text>
        <Text style={[styles.previewSub, { color: preview.muted }]}>focused this week</Text>
      </View>

      <View style={styles.styleRow}>
        {STYLE_ORDER.map((name) => {
          const selected = name === cardStyle;
          return (
            <Pressable
              key={name}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`Card style ${name}`}
              onPress={() => setCardStyle(name)}
              style={[
                styles.styleChip,
                {
                  borderColor: selected ? colors.ink : colors.rule,
                  backgroundColor: CARD_STYLES[name].bg,
                },
              ]}
            >
              <Text style={[styles.styleChipText, { color: CARD_STYLES[name].ink }]}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.toggleRow}>
        <Text style={[styles.toggleLabel, { color: colors.ink }]}>Show what I worked on</Text>
        <Switch
          value={showWorkedOn}
          onValueChange={setShowWorkedOn}
          trackColor={{ true: colors.focus }}
          accessibilityLabel="Show what I worked on"
        />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Share image"
        onPress={() => void shareImage()}
        style={[styles.shareButton, { backgroundColor: colors.ink, opacity: sharing ? 0.6 : 1 }]}
      >
        {sharing ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <Text style={[styles.shareText, { color: colors.onPrimary }]}>Share image</Text>
        )}
      </Pressable>

      {/* Off-screen capture canvas — must stay mounted for view-shot. */}
      <View style={styles.offscreen} pointerEvents="none" collapsable={false}>
        <View ref={cardRef} collapsable={false}>
          <ShareCard
            week={week}
            totals={totals}
            intentions={intentions}
            showWorkedOn={showWorkedOn}
            cardStyle={cardStyle}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 24 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  back: { width: 48, minHeight: 44, justifyContent: "center" },
  backText: { ...typography.body },
  title: { ...typography.title, flex: 1, textAlign: "center" },
  preview: {
    alignSelf: "center",
    width: 200,
    height: 356, // 9:16 preview
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    justifyContent: "flex-start",
  },
  previewApp: { fontSize: 9, fontWeight: "700", letterSpacing: 2, marginTop: 6 },
  previewHeadline: { fontSize: 30, fontWeight: "700", letterSpacing: -1, marginTop: 56 },
  previewSub: { fontSize: 12, marginTop: 4 },
  styleRow: { flexDirection: "row", justifyContent: "center", gap: 10, marginBottom: 20 },
  styleChip: {
    borderRadius: 999,
    borderWidth: 2,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  styleChipText: { ...typography.label, fontSize: 13 },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  toggleLabel: { ...typography.body, fontSize: 16 },
  shareButton: { borderRadius: 999, paddingVertical: 14, alignItems: "center" },
  shareText: { ...typography.label },
  offscreen: { position: "absolute", left: -2000, top: 0 },
});
