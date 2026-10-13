import { describe, expect, it } from "@jest/globals";
import { render } from "@testing-library/react-native";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { palette } from "../theme";
import { AppearanceControl } from "./AppearanceControl";

describe("AppearanceControl", () => {
  it("keeps each option content-sized without wrapping the label", async () => {
    const { getByLabelText, getByText } = await render(
      <AppearanceControl appearance="system" colors={palette.light} onChange={() => {}} />,
    );
    const option = getByLabelText("Appearance: Light");
    const style = StyleSheet.flatten(option.props["style"] as StyleProp<ViewStyle>);

    expect(style.flex).toBeUndefined();
    expect(style.flexGrow).toBe(1);
    expect(style.flexShrink).toBe(0);
    expect(style.paddingHorizontal).toBe(12);
    expect(getByText("Light").props["numberOfLines"]).toBe(1);
  });
});
