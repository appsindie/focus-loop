import { useMemo } from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { t } from "../../../i18n";
import { Palette } from "../../../shared/theme";

// §3 Disc: conic fill — `focus` for remaining, `track` for elapsed — starting at
// 12 o'clock and shrinking clockwise. Accessibility: role=img "About X minutes left".
export function FocusDisc({
  progress,
  remainingMinutes,
  colors,
  size = 280,
  strokeWidth = 14,
}: {
  progress: number; // 0..1 elapsed fraction
  remainingMinutes: number;
  colors: Palette;
  size?: number;
  strokeWidth?: number;
}) {
  const p = Math.min(1, Math.max(0, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Dash draws the elapsed arc clockwise from 12 o'clock; the remaining fraction
  // shows the focus colour underneath — the disc shrinks as time passes.
  const elapsedArc = Math.max(0.5, p * circumference);
  const remainingArc = Math.max(0, (1 - p) * circumference);
  const dash = useMemo(
    () => `${elapsedArc} ${circumference - elapsedArc}`,
    [elapsedArc, circumference],
  );

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={t("About {minutes} minutes left", { minutes: remainingMinutes })}
    >
      <Svg width={size} height={size}>
        {/* Remaining time = focus colour */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.focus}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${remainingArc} ${circumference - remainingArc}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        {/* Elapsed time = track colour drawn over it */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.track}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={dash}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
    </View>
  );
}
