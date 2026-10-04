import { Rhythm } from "./rhythm";

export type LoopStepKind = "focus" | "break" | "longBreak";

export type LoopStep = {
  kind: LoopStepKind;
  // 1-based round index for focus/break steps; longBreak carries the final round count.
  roundIndex: number;
  durationSeconds: number;
};

// Spec J2-R1: a loop is N rounds of (focus + break) + one long break. The long break
// follows the Loop-complete screen (P12); the Nth focus's own break is the long break.
export function buildLoopPlan(rhythm: Rhythm): LoopStep[] {
  const steps: LoopStep[] = [];
  for (let round = 1; round <= rhythm.rounds; round += 1) {
    steps.push({
      kind: "focus",
      roundIndex: round,
      durationSeconds: rhythm.focusMinutes * 60,
    });
    if (round < rhythm.rounds) {
      steps.push({
        kind: "break",
        roundIndex: round,
        durationSeconds: rhythm.breakMinutes * 60,
      });
    }
  }
  steps.push({
    kind: "longBreak",
    roundIndex: rhythm.rounds,
    durationSeconds: rhythm.longBreakMinutes * 60,
  });
  return steps;
}

export function countFocusSteps(plan: LoopStep[]): number {
  return plan.filter((step) => step.kind === "focus").length;
}
