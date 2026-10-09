import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FocusSession } from "../SessionLog";
import { WeekProgress } from "../weeklyGoal";
import { t } from "../../../i18n";
import { Palette, typography } from "../../../shared/theme";
import { useIsTablet } from "../../../shared/layout";
import { ProgressTabs } from "./ProgressTabs";
import { SessionDayList, TabletProgressBody, groupByDay } from "./progressShared";

// P18: grouped by day, "time · intention · outcome". Free tier shows the
// last 7 days then the Plus footer (J6-R3); "Share my week" opens P19.
// T04: on tablet the list is the right column of the merged progress view.
export function HistoryScreen({
  sessions,
  week,
  now,
  isPlus,
  onBack,
  onWeek,
  onShare,
  colors,
}: {
  sessions: FocusSession[];
  week: WeekProgress;
  now: Date;
  isPlus: boolean;
  onBack: () => void;
  onWeek: () => void;
  onShare: () => void;
  colors: Palette;
}) {
  const isTablet = useIsTablet();
  const cutoff = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  const visible = isPlus ? sessions : sessions.filter((s) => Date.parse(s.endedAt) >= cutoff);
  const groups = useMemo(() => groupByDay(visible), [visible]);

  if (isTablet) {
    return (
      <TabletProgressBody
        sessions={sessions}
        week={week}
        isPlus={isPlus}
        now={now}
        title={t("Your progress")}
        onBack={onBack}
        onShare={onShare}
        colors={colors}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("Back to home")}
          onPress={onBack}
          hitSlop={8}
          style={({ pressed }) => [styles.back, pressed && { opacity: 0.55 }]}
        >
          <Text style={[styles.backText, { color: colors.ink }]}>{t("Back")}</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.ink }]}>{t("History")}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("Share my week")}
          onPress={onShare}
          hitSlop={8}
          style={({ pressed }) => [styles.back, pressed && { opacity: 0.55 }]}
        >
          <Text style={[styles.shareLink, { color: colors.focusText }]}>{t("Share")}</Text>
        </Pressable>
      </View>
      <ProgressTabs active="history" onWeek={onWeek} onHistory={() => {}} colors={colors} />
      {groups.length === 0 ? (
        <Text style={[styles.empty, { color: colors.muted }]}>{t("No sessions yet.")}</Text>
      ) : (
        <SessionDayList groups={groups} isPlus={isPlus} colors={colors} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Same chrome as WeekScreen — paddingHorizontal-only keeps the title at the
  // same Y as every other detail screen (padded top caused the tab "jump").
  root: { flex: 1, paddingHorizontal: 24, paddingBottom: 24 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  back: { width: 48, minHeight: 44, justifyContent: "center" },
  backText: { ...typography.body },
  shareLink: { ...typography.label, fontSize: 13, textAlign: "right" },
  title: { ...typography.title, flex: 1, textAlign: "center" },
  empty: { ...typography.body, textAlign: "center", marginTop: 48 },
});
