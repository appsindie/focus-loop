import { describe, expect, it } from "@jest/globals";
import { discStrokeWidth, fitDiscSize, fitTimerFontSize } from "./layout";

describe("fitTimerFontSize", () => {
  it("uses the Focus tablet height and width factors", () => {
    expect(fitTimerFontSize({ width: 1504, height: 1400 })).toBe(676);
  });
});

describe("fitDiscSize", () => {
  it("uses the available width when it is the limiting dimension", () => {
    expect(fitDiscSize({ width: 500, height: 900 }, 40)).toBe(500);
  });

  it("uses the available height after reserving the caption", () => {
    expect(fitDiscSize({ width: 900, height: 700 }, 50)).toBe(650);
  });

  it("respects the phone size cap", () => {
    expect(fitDiscSize({ width: 900, height: 900 }, 40, 280)).toBe(280);
  });

  it("keeps the minimum size floor", () => {
    expect(fitDiscSize({ width: 100, height: 150 }, 80)).toBe(160);
  });
});

describe("discStrokeWidth", () => {
  it("scales with the disc size", () => {
    expect(discStrokeWidth(280)).toBe(14);
    expect(discStrokeWidth(720)).toBe(36);
  });
});
