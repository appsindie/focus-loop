import { describe, expect, it } from "@jest/globals";
import { FocusSession } from "./SessionLog";
import { computeWeekProgress, startOfWeekTimestamp } from "./weeklyGoal";

function session(endedAt: string, partial = false): FocusSession {
  return {
    id: endedAt,
    loopId: "l",
    roundIndex: 1,
    intention: null,
    outcome: null,
    startedAt: endedAt,
    endedAt,
    plannedSeconds: 1500,
    focusedSeconds: partial ? 300 : 1500,
    partial,
  };
}

describe("weeklyGoal", () => {
  it("starts the week on Monday (ISO)", () => {
    // 2026-10-04 is a Sunday — its week starts 2026-09-28.
    const start = startOfWeekTimestamp(new Date("2026-10-04T12:00:00"));
    expect(new Date(start).toISOString().slice(0, 10)).toBe("2026-09-28");
  });

  it("a day counts with one or more sessions, partial included; a missed day resets nothing", () => {
    // Week of Mon 2026-09-28 … Sun 2026-10-04.
    const sessions = [
      session("2026-09-28T08:00:00"), // Mon
      session("2026-09-28T20:00:00", true), // Mon partial — still the same day
      session("2026-09-30T08:00:00"), // Wed
      session("2026-10-02T08:00:00"), // Fri
      session("2026-10-03T08:00:00", true), // Sat partial counts
    ];
    const progress = computeWeekProgress(sessions, new Date("2026-10-04T12:00:00"), 4);
    expect(progress.daysMet).toBe(4);
    expect(progress.goalMet).toBe(true);
    expect(progress.days).toHaveLength(7);
    expect(progress.days[1]!.met).toBe(false); // Tuesday missed — no streak consequence
  });

  it("goal not met below the configured days", () => {
    const sessions = [session("2026-09-28T08:00:00"), session("2026-09-30T08:00:00")];
    const progress = computeWeekProgress(sessions, new Date("2026-10-04T12:00:00"), 4);
    expect(progress.daysMet).toBe(2);
    expect(progress.goalMet).toBe(false);
  });
});
