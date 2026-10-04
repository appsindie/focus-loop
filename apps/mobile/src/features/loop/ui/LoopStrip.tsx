import { StyleSheet, View } from "react-native";
import { LoopStep } from "../loopPlan";
import { Palette } from "../../../shared/theme";

// §3: one segment per focus/break, width ∝ duration, 3px gap.
// done = solid, current = fills with progress, pending = track.
export function LoopStrip({
  steps,
  currentIndex,
  currentProgress = 0,
  colors,
  height = 6,
}: {
  steps: readonly LoopStep[];
  currentIndex: number;
  currentProgress?: number; // 0..1 elapsed fraction of the current step
  colors: Palette;
  height?: number;
}) {
  const total = steps.reduce((sum, s) => sum + s.durationSeconds, 0);
  return (
    <View style={[styles.row, { height }]} accessibilityLabel="Loop progress">
      {steps.map((step, i) => {
        const isDone = i < currentIndex;
        const isCurrent = i === currentIndex;
        const base = step.kind === "focus" ? colors.track : colors.trackBreak;
        const fill = step.kind === "focus" ? colors.focus : colors.break;
        const width = `${Math.max(2, (step.durationSeconds / total) * 100)}%` as const;
        return (
          <View
            key={i}
            style={[styles.segment, { width, backgroundColor: isDone ? fill : base, height }]}
          >
            {isCurrent && currentProgress > 0 ? (
              <View
                style={[
                  styles.fill,
                  { backgroundColor: fill, width: `${Math.min(100, currentProgress * 100)}%` },
                ]}
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "stretch", gap: 3 },
  segment: { borderRadius: 3, overflow: "hidden" },
  fill: { position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 3 },
});
