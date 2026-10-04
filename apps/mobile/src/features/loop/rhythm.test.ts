import { describe, expect, it } from "@jest/globals";
import {
  DEFAULT_RHYTHM,
  RHYTHM_PRESETS,
  loopDurationSeconds,
  loopSummary,
  resolveRhythm,
} from "./rhythm";

describe("rhythm", () => {
  it("defaults to Classic 25/5 ×4 + 15 (spec J2-R1)", () => {
    expect(DEFAULT_RHYTHM).toEqual({
      focusMinutes: 25,
      breakMinutes: 5,
      rounds: 4,
      longBreakMinutes: 15,
    });
  });

  it("offers the three design presets (spec J10-R1)", () => {
    expect(RHYTHM_PRESETS.gentle.focusMinutes).toBe(15);
    expect(RHYTHM_PRESETS["deep-work"]).toMatchObject({
      focusMinutes: 50,
      breakMinutes: 10,
      rounds: 3,
    });
  });

  it("resolves the custom rhythm when the custom preset is selected", () => {
    const custom = { focusMinutes: 30, breakMinutes: 7, rounds: 2, longBreakMinutes: 20 };
    expect(resolveRhythm("custom", custom)).toEqual(custom);
    expect(resolveRhythm("classic", custom)).toEqual(RHYTHM_PRESETS.classic);
  });

  it("computes the loop duration: N focuses + (N-1) breaks + long break", () => {
    // Classic: 4×25 + 3×5 + 15 = 130 minutes.
    expect(loopDurationSeconds(RHYTHM_PRESETS.classic)).toBe(130 * 60);
  });

  it("renders the live 'One loop = …' summary", () => {
    expect(loopSummary(RHYTHM_PRESETS.classic)).toBe("One loop = 25/5 ×4 + 15 ≈ 2h 10m");
  });
});
