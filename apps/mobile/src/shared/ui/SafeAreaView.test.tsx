// The wrapper must pad the safe area ON TOP of the caller's own padding —
// the native-backed SafeAreaView applies insets additively, and a regression
// that writes insets before `style` lets a screen's `padding` erase them
// (Android nav bar overlaps bottom actions; headers sit under the status bar).
import { describe, expect, it } from "@jest/globals";
import { render } from "@testing-library/react-native";
import { StyleSheet, Text, type ViewStyle } from "react-native";
import { SafeAreaProvider, type Metrics } from "react-native-safe-area-context";
import { SafeAreaView } from "./SafeAreaView";

const METRICS: Metrics = {
  insets: { top: 47, right: 0, bottom: 34, left: 0 },
  frame: { x: 0, y: 0, width: 390, height: 844 },
};

function paddingOf(style: unknown) {
  const flat = (StyleSheet.flatten(style) ?? {}) as ViewStyle;
  return {
    top: flat.paddingTop ?? 0,
    right: flat.paddingRight ?? 0,
    bottom: flat.paddingBottom ?? 0,
    left: flat.paddingLeft ?? 0,
  };
}

describe("SafeAreaView", () => {
  it("adds insets on top of the caller's padding", async () => {
    const { getByTestId } = await render(
      <SafeAreaProvider initialMetrics={METRICS}>
        <SafeAreaView testID="v" style={{ padding: 24 }}>
          <Text>x</Text>
        </SafeAreaView>
      </SafeAreaProvider>,
    );
    expect(paddingOf(getByTestId("v").props["style"])).toEqual({
      top: 71,
      right: 24,
      bottom: 58,
      left: 24,
    });
  });

  it("keeps caller padding on edges that are not requested", async () => {
    const { getByTestId } = await render(
      <SafeAreaProvider initialMetrics={METRICS}>
        <SafeAreaView testID="v" edges={["bottom"]} style={{ paddingTop: 10, paddingBottom: 24 }}>
          <Text>x</Text>
        </SafeAreaView>
      </SafeAreaProvider>,
    );
    expect(paddingOf(getByTestId("v").props["style"])).toEqual({
      top: 10,
      right: 0,
      bottom: 58,
      left: 0,
    });
  });

  it("applies plain insets when the caller sets no padding", async () => {
    const { getByTestId } = await render(
      <SafeAreaProvider initialMetrics={METRICS}>
        <SafeAreaView testID="v" style={{ flex: 1 }}>
          <Text>x</Text>
        </SafeAreaView>
      </SafeAreaProvider>,
    );
    expect(paddingOf(getByTestId("v").props["style"])).toEqual({
      top: 47,
      right: 0,
      bottom: 34,
      left: 0,
    });
  });
});
