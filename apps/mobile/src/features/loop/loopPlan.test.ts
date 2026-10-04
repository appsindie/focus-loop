import { describe, expect, it } from "@jest/globals";
import { buildLoopPlan, countFocusSteps } from "./loopPlan";
import { RHYTHM_PRESETS } from "./rhythm";

describe("buildLoopPlan", () => {
  it("sequences focuses with short breaks and one long break (spec J2-R1)", () => {
    const plan = buildLoopPlan(RHYTHM_PRESETS.classic);
    expect(plan.map((step) => step.kind)).toEqual([
      "focus",
      "break",
      "focus",
      "break",
      "focus",
      "break",
      "focus",
      "longBreak",
    ]);
    expect(countFocusSteps(plan)).toBe(4);
    expect(plan[7]).toEqual({ kind: "longBreak", roundIndex: 4, durationSeconds: 15 * 60 });
  });

  it("carries 1-based round indices", () => {
    const plan = buildLoopPlan({
      focusMinutes: 10,
      breakMinutes: 2,
      rounds: 2,
      longBreakMinutes: 5,
    });
    expect(plan.map((step) => step.roundIndex)).toEqual([1, 1, 2, 2]);
    expect(plan[0]!.durationSeconds).toBe(600);
    expect(plan[1]!.durationSeconds).toBe(120);
  });

  it("handles a single-round loop (no short breaks)", () => {
    const plan = buildLoopPlan({
      focusMinutes: 15,
      breakMinutes: 5,
      rounds: 1,
      longBreakMinutes: 10,
    });
    expect(plan.map((step) => step.kind)).toEqual(["focus", "longBreak"]);
  });
});
