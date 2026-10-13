import { describe, expect, it } from "@jest/globals";
import { palette } from "./theme";

function luminance(hex: string): number {
  const [red = 0, green = 0, blue = 0] =
    hex
      .slice(1)
      .match(/.{2}/g)
      ?.map((channel) => {
        const value = parseInt(channel, 16) / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      }) ?? [];
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(first: string, second: string): number {
  const firstLuminance = luminance(first);
  const secondLuminance = luminance(second);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("selected-state palette contrast", () => {
  it.each(["light", "dark"] as const)(
    "%s selected fill and text meet WCAG contrast thresholds",
    (theme) => {
      const colors = palette[theme];
      expect(contrastRatio(colors.focus, colors.surface)).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(colors.focus, colors.bg)).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(colors.onFocus, colors.focus)).toBeGreaterThanOrEqual(4.5);
    },
  );
});
