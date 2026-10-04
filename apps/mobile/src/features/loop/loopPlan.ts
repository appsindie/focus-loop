import { Rhythm } from "./rhythm";

export type LoopStepKind = "focus" | "break" | "longBreak";

export type LoopStep = {
  kind: LoopStepKind;
  // 1-based round index for focus/break steps; longBreak carries the final round count.
  roundIndex: number;
  durationSeconds: number;
  // P10 "Keep going" inserts an extra focus inside the same round. It shows on the
  // strip but is NOT a numbered focus — N/M counters and ad triggers skip it (CR-07).
  extension?: boolean;
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
  return plan.filter((step) => step.kind === "focus" && step.extension !== true).length;
}

// Value equality — plans rebuilt per render share no identity.
export function sameLoopPlan(a: readonly LoopStep[], b: readonly LoopStep[]): boolean {
  return (
    a.length === b.length &&
    a.every(
      (s, i) =>
        s.kind === b[i]!.kind &&
        s.roundIndex === b[i]!.roundIndex &&
        s.durationSeconds === b[i]!.durationSeconds &&
        (s.extension ?? false) === (b[i]!.extension ?? false),
    )
  );
}
