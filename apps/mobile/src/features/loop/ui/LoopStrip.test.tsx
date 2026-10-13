import { describe, expect, it } from "@jest/globals";
import { render } from "@testing-library/react-native";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { palette } from "../../../shared/theme";
import { LoopStep } from "../loopPlan";
import { LoopStrip } from "./LoopStrip";

describe("LoopStrip", () => {
  it("sizes segments by duration without fixed widths", async () => {
    const steps: LoopStep[] = [
      { kind: "focus", roundIndex: 1, durationSeconds: 1500 },
      { kind: "break", roundIndex: 1, durationSeconds: 300 },
      { kind: "longBreak", roundIndex: 2, durationSeconds: 900 },
    ];
    const { getByTestId } = await render(
      <LoopStrip steps={steps} currentIndex={-1} colors={palette.light} />,
    );
    const segments = steps.map((_, index) => getByTestId(`loop-strip-segment-${index}`));
    const styles = segments.map((segment) =>
      StyleSheet.flatten(segment.props["style"] as StyleProp<ViewStyle>),
    );

    expect(styles.map((style) => style.flex)).toEqual([1500, 300, 900]);
    expect(styles.every((style) => style.width == null)).toBe(true);
  });
});
