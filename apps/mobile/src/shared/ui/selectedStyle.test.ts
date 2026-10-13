import { describe, expect, it } from "@jest/globals";
import { palette } from "../theme";
import { selectedCardStyle } from "./selectedStyle";

describe("selectedCardStyle", () => {
  it("uses the focus outline and surface fill when selected", () => {
    expect(selectedCardStyle(palette.light, true)).toEqual({
      backgroundColor: palette.light.surface,
      borderColor: palette.light.focus,
      borderWidth: 2,
    });
  });

  it("uses the rule outline when unselected", () => {
    expect(selectedCardStyle(palette.light, false)).toEqual({
      backgroundColor: palette.light.surface,
      borderColor: palette.light.rule,
      borderWidth: 2,
    });
  });
});
