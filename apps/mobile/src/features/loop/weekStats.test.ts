import { describe, expect, it } from "@jest/globals";
import { FocusSession } from "./SessionLog";
import { computeWeekProgress } from "./weeklyGoal";
import { computeWeekTotals, weekInsight } from "./weekStats";

const session = (endedAt: string, overrides: Partial<FocusSession> = {}): FocusSession => ({
  id: `${Math.random()}`,
  loopId: "l1",
  roundIndex: 1,
  intention: null,
  outcome: null,
  startedAt: endedAt,
  endedAt,
  plannedSeconds: 1500,
  focusedSeconds: 1500,
  partial: false,
  ...overrides,
});

// Monday 2026-09-28 .. Sunday 2026-10-04 is one ISO week.
const NOW = new Date("2026-10-03T12:00:00");

describe("computeWeekTotals", () => {
  it("counts outcomes and seconds inside the week only", () => {
    const sessions = [
      session("2026-09-29T10:00:00", { outcome: "finished", focusedSeconds: 1500 }),
      session("2026-10-01T10:00:00", { outcome: "moved-forward", focusedSeconds: 600 }),
      session("2026-08-01T10:00:00", { outcome: "finished", focusedSeconds: 999 }),
    ];
    const week = computeWeekProgress(sessions, NOW, 4);
    const totals = computeWeekTotals(sessions, week);
    expect(totals.totalSeconds).toBe(2100);
    expect(totals.finished).toBe(1);
    expect(totals.movedForward).toBe(1);
    expect(totals.gotStuck).toBe(0);
  });
});

describe("weekInsight", () => {
  it("empty week → any-minute hint, never a streak", () => {
    const week = computeWeekProgress([], NOW, 4);
    const totals = computeWeekTotals([], week);
    expect(weekInsight(week, totals, NOW)).toContain("any minute counts");
  });

  it("goal met → says so", () => {
    const sessions = [
      session("2026-09-28T10:00:00"),
      session("2026-09-29T10:00:00"),
      session("2026-09-30T10:00:00"),
      session("2026-10-01T10:00:00"),
    ];
    const week = computeWeekProgress(sessions, NOW, 4);
    expect(weekInsight(week, computeWeekTotals(sessions, week), NOW)).toContain("Goal met");
  });

  it("partial week with a best past day → names the deepest day", () => {
    const sessions = [
      session("2026-09-29T10:00:00", { focusedSeconds: 3600 }),
      session("2026-10-03T09:00:00", { focusedSeconds: 300 }), // today
    ];
    const week = computeWeekProgress(sessions, NOW, 4);
    const insight = weekInsight(week, computeWeekTotals(sessions, week), NOW);
    expect(insight).toContain("Tuesday");
    expect(insight).toContain("60 min");
  });

  it("partial week where today is the only/best day → days-remaining nudge", () => {
    const sessions = [session("2026-10-03T09:00:00")];
    const week = computeWeekProgress(sessions, NOW, 4);
    expect(weekInsight(week, computeWeekTotals(sessions, week), NOW)).toBe(
      "3 more days to hit this week's goal.",
    );
  });
});
