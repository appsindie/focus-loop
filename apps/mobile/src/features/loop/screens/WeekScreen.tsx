import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FocusSession } from "../SessionLog";
import { WeekProgress } from "../weeklyGoal";
import { computeWeekTotals, weekInsight } from "../weekStats";
import { t } from "../../../i18n";
import { Palette, typography } from "../../../shared/theme";
import { useIsTablet } from "../../../shared/layout";
import { ProgressTabs } from "./ProgressTabs";
import { TabletProgressBody, WeekCard } from "./progressShared";

// P17: week progress without streak shame — "N of G days", per-day minutes
// bars, totals, one insight line. Read-only per J6 SCR-week.
// T04: on tablet this is the left column of the merged "Week and history" view.
export function WeekScreen({
  sessions,
  week,
  isPlus,
  now,
  onBack,
  onHistory,
  onShare,
  colors,
}: {
  sessions: FocusSession[];
  week: WeekProgress;
  isPlus: boolean;
  now: Date;
  onBack: () => void;
  onHistory: () => void;
  onShare: () => void;
  colors: Palette;
}) {
  const isTablet = useIsTablet();
  const totals = useMemo(() => computeWeekTotals(sessions, week), [sessions, week]);
  const insight = useMemo(() => weekInsight(week, totals, now), [week, totals, now]);

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
        <Text style={[styles.title, { color: colors.ink }]}>{t("Your week")}</Text>
        <View style={styles.back} />
      </View>
      <ProgressTabs active="week" onWeek={() => {}} onHistory={onHistory} colors={colors} />
      <ScrollView contentContainerStyle={styles.body}>
        <WeekCard week={week} totals={totals} insight={insight} onShare={onShare} colors={colors} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 24 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  back: { width: 48, minHeight: 44, justifyContent: "center" },
  backText: { ...typography.body },
  title: { ...typography.title, flex: 1, textAlign: "center" },
  body: { paddingBottom: 32 },
});
