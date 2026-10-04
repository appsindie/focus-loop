import { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FocusSession } from "../SessionLog";
import { Palette, typography } from "../../../shared/theme";
import { ProgressTabs } from "./ProgressTabs";

const OUTCOME_LABEL: Record<string, string> = {
  finished: "Finished",
  "moved-forward": "Moved forward",
  "got-stuck": "Got stuck",
};

type DayGroup = { dayLabel: string; items: FocusSession[] };

function groupByDay(sessions: FocusSession[]): DayGroup[] {
  const groups = new Map<string, FocusSession[]>();
  const sorted = [...sessions].sort(
    (a, b) => new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime(),
  );
  for (const s of sorted) {
    const d = new Date(s.endedAt);
    const key = d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    const list = groups.get(key);
    if (list) {
      list.push(s);
    } else {
      groups.set(key, [s]);
    }
  }
  return [...groups.entries()].map(([dayLabel, items]) => ({ dayLabel, items }));
}

function formatClock(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function rowText(s: FocusSession): { main: string; meta: string } {
  const minutes = Math.round(s.focusedSeconds / 60);
  const intention = s.intention ?? "No note";
  const outcome = OUTCOME_LABEL[s.outcome ?? ""] ?? "";
  const ended = s.partial ? " · Ended early" : "";
  return {
    main: `${formatClock(s.endedAt)} · ${intention}`,
    meta: `${minutes} min${outcome ? ` · ${outcome}` : ""}${ended}`,
  };
}

// P18: grouped by day, "time · intention · outcome". Free tier shows the
// last 7 days then the Plus footer (J6-R3); "Share my week" opens P19.
export function HistoryScreen({
  sessions,
  isPlus,
  onBack,
  onWeek,
  onShare,
  colors,
}: {
  sessions: FocusSession[];
  isPlus: boolean;
  onBack: () => void;
  onWeek: () => void;
  onShare: () => void;
  colors: Palette;
}) {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const visible = isPlus ? sessions : sessions.filter((s) => Date.parse(s.endedAt) >= cutoff);
  const groups = useMemo(() => groupByDay(visible), [visible]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to home"
          onPress={onBack}
          hitSlop={8}
          style={styles.back}
        >
          <Text style={[styles.backText, { color: colors.ink }]}>Back</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.ink }]}>History</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Share my week"
          onPress={onShare}
          hitSlop={8}
          style={styles.back}
        >
          <Text style={[styles.shareLink, { color: colors.focusText }]}>Share</Text>
        </Pressable>
      </View>
      <ProgressTabs active="history" onWeek={onWeek} onHistory={() => {}} colors={colors} />
      {groups.length === 0 ? (
        <Text style={[styles.empty, { color: colors.muted }]}>No sessions yet.</Text>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(g) => g.dayLabel}
          renderItem={({ item }) => (
            <View style={styles.group}>
              <Text style={[styles.dayLabel, { color: colors.muted }]}>{item.dayLabel}</Text>
              {item.items.map((s) => {
                const { main, meta } = rowText(s);
                return (
                  <View key={s.id} style={[styles.row, { borderBottomColor: colors.rule }]}>
                    <Text
                      style={[styles.rowMain, { color: s.intention ? colors.ink : colors.muted }]}
                    >
                      {main}
                    </Text>
                    <Text style={[styles.rowMeta, { color: colors.muted }]}>{meta}</Text>
                  </View>
                );
              })}
            </View>
          )}
          ListFooterComponent={
            isPlus ? null : (
              <Text style={[styles.footer, { color: colors.muted }]}>See all with Plus</Text>
            )
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 24 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  back: { width: 48, minHeight: 44, justifyContent: "center" },
  backText: { ...typography.body },
  shareLink: { ...typography.label, fontSize: 13, textAlign: "right" },
  title: { ...typography.title, flex: 1, textAlign: "center" },
  empty: { ...typography.body, textAlign: "center", marginTop: 48 },
  group: { marginBottom: 20 },
  dayLabel: { ...typography.label, marginBottom: 4 },
  row: { minHeight: 54, justifyContent: "center", borderBottomWidth: 1, paddingVertical: 8 },
  rowMain: { ...typography.body, fontWeight: "500" },
  rowMeta: { ...typography.caption, marginTop: 2 },
  footer: { ...typography.caption, fontSize: 14, textAlign: "center", paddingVertical: 20 },
});
