import { LoopStep } from "./loopPlan";

export type EnginePhase =
  | "idle" // no loop in flight
  | "running" // a step's timer is counting down
  | "paused" // timer held (pause, or the J3 end-early sheet is open)
  | "step-done" // a step finished; awaiting user advance (break skipped/finished without auto-start)
  | "loop-done" // all focuses finished — the P12 Loop-complete moment, before the long break
  | "abandoned" // ended early or discarded via J3; the partial record is emitted
  | "finished"; // long break ended — the loop is fully done

export type FocusRecord = {
  loopId: string;
  roundIndex: number;
  intention: string | null;
  startedAt: string;
  endedAt: string;
  plannedSeconds: number;
  focusedSeconds: number;
  partial: boolean;
};

// Persisted on every transition so an OS-killed loop can resume or recover (spec J9).
export type LoopSnapshot = {
  loopId: string;
  stepIndex: number;
  phase: "running" | "paused";
  stepStartedAtMs: number;
  pausedMs: number;
  pausedAtMs: number | null;
  intention: string | null;
};

export type LoopEngineOptions = {
  now?: () => number;
  // P10 "Start breaks automatically": when on, a finished break starts the next focus.
  autoStartBreaks?: boolean;
};

export class LoopEngine {
  private readonly plan: LoopStep[];
  private readonly now: () => number;
  private autoStartBreaks: boolean;

  private phase: EnginePhase = "idle";
  private stepIndex = 0;
  private stepStartedAtMs = 0;
  private pausedMs = 0;
  private pausedAtMs: number | null = null;
  private loopId = "";
  private intention: string | null = null;
  private pendingFocusRecord: FocusRecord | null = null;

  constructor(plan: LoopStep[], options: LoopEngineOptions = {}) {
    this.plan = plan;
    this.now = options.now ?? (() => Date.now());
    this.autoStartBreaks = options.autoStartBreaks ?? false;
  }

  get currentPhase(): EnginePhase {
    return this.phase;
  }

  get currentStepIndex(): number {
    return this.stepIndex;
  }

  get currentStep(): LoopStep | null {
    return this.phase === "idle" || this.phase === "finished" || this.phase === "abandoned"
      ? null
      : (this.plan[this.stepIndex] ?? null);
  }

  get currentLoopId(): string {
    return this.loopId;
  }

  // The record the app writes to the session log before showing P10 (spec J2-R4).
  get completedFocusRecord(): FocusRecord | null {
    return this.pendingFocusRecord;
  }

  clearFocusRecord(): void {
    this.pendingFocusRecord = null;
  }

  setAutoStartBreaks(enabled: boolean): void {
    this.autoStartBreaks = enabled;
  }

  start(intention: string | null = null): void {
    this.loopId = `${this.now()}-${Math.random().toString(36).slice(2, 9)}`;
    this.stepIndex = 0;
    this.intention = intention;
    this.startStep(0);
  }

  private startStep(index: number, atMs?: number): void {
    this.stepIndex = index;
    this.stepStartedAtMs = atMs ?? this.now();
    this.pausedMs = 0;
    this.pausedAtMs = null;
    this.phase = "running";
  }

  // The moment the step actually ended — start + planned + accumulated pause — NOT
  // the time tick()/restore() noticed it. endedAt and auto-advance anchor here so
  // day bucketing (weeklyGoal, sessionsOnDay) stays right across midnight/kill (CR-03).
  private stepEndMs(): number {
    const step = this.plan[this.stepIndex]!;
    return this.stepStartedAtMs + step.durationSeconds * 1000 + this.pausedMs;
  }

  private elapsedMs(): number {
    if (this.phase !== "running" && this.phase !== "paused") {
      return 0;
    }
    const pauseContribution =
      this.pausedAtMs == null ? this.pausedMs : this.pausedMs + (this.now() - this.pausedAtMs);
    return this.now() - this.stepStartedAtMs - pauseContribution;
  }

  remainingSeconds(): number {
    const step = this.currentStep;
    if (step == null || this.phase === "step-done" || this.phase === "loop-done") {
      return 0;
    }
    const remainingMs = step.durationSeconds * 1000 - this.elapsedMs();
    return Math.max(0, Math.ceil(remainingMs / 1000));
  }

  private buildFocusRecord(partial: boolean, endedAtMs: number): FocusRecord {
    const step = this.plan[this.stepIndex]!;
    const focusedSeconds = Math.max(0, Math.floor(this.elapsedMs() / 1000));
    return {
      loopId: this.loopId,
      roundIndex: step.roundIndex,
      intention: this.intention,
      startedAt: new Date(this.stepStartedAtMs).toISOString(),
      endedAt: new Date(endedAtMs).toISOString(),
      plannedSeconds: step.durationSeconds,
      focusedSeconds: partial
        ? Math.min(focusedSeconds, step.durationSeconds)
        : step.durationSeconds,
      partial,
    };
  }

  private onStepEnd(): void {
    const step = this.plan[this.stepIndex]!;
    const endMs = this.stepEndMs();
    if (step.kind === "focus") {
      this.pendingFocusRecord = this.buildFocusRecord(false, endMs);
      if (this.stepIndex === this.plan.length - 2) {
        // Last focus — P12 Loop complete; the long break waits behind it.
        this.phase = "loop-done";
      } else {
        this.phase = "step-done";
      }
      return;
    }
    if (step.kind === "longBreak") {
      this.phase = "finished";
      return;
    }
    // A break ending: auto-start the next focus when the P10 toggle is on, anchored
    // at the break's true end so elapsed counts real time, not notice time (CR-03).
    this.phase = "step-done";
    if (this.autoStartBreaks) {
      this.advance(null, endMs);
    }
  }

  // Poll on a 1s cadence from the hook; transitions when a step's time is up.
  tick(): EnginePhase {
    if (this.phase === "running" && this.remainingSeconds() === 0) {
      this.onStepEnd();
    }
    return this.phase;
  }

  pause(): void {
    if (this.phase !== "running") {
      return;
    }
    this.pausedAtMs = this.now();
    this.phase = "paused";
  }

  resume(): void {
    if (this.phase !== "paused" || this.pausedAtMs == null) {
      return;
    }
    this.pausedMs += this.now() - this.pausedAtMs;
    this.pausedAtMs = null;
    this.phase = "running";
    this.tick();
  }

  // Step-done → next step; loop-done → the long break. Focus steps take the next
  // intention (optional per J2-R2). `atMs` anchors the start — used by auto-advance
  // so the next step counts from the previous one's true end (CR-03).
  advance(nextIntention: string | null = null, atMs?: number): void {
    if (this.phase === "step-done") {
      this.intention = nextIntention;
      this.startStep(this.stepIndex + 1, atMs);
      return;
    }
    if (this.phase === "loop-done") {
      this.startStep(this.stepIndex + 1, atMs);
    }
  }

  // Spec variant: break skipped or extended (+5 min) is supported.
  skipBreak(): void {
    const step = this.plan[this.stepIndex];
    if ((this.phase === "running" || this.phase === "paused") && step?.kind === "break") {
      this.startStep(this.stepIndex + 1);
    }
  }

  extendBreak(extraSeconds: number): void {
    const step = this.plan[this.stepIndex];
    if ((this.phase === "running" || this.phase === "paused") && step?.kind === "break") {
      // Adding to pausedMs shortens computed elapsed → remaining grows by the extension.
      this.pausedMs += extraSeconds * 1000;
    }
  }

  // J3 "End and save N min": the partial session is emitted and the loop is abandoned.
  endEarly(): FocusRecord | null {
    const step = this.plan[this.stepIndex];
    if ((this.phase !== "running" && this.phase !== "paused") || step?.kind !== "focus") {
      return null;
    }
    if (this.pausedAtMs != null) {
      this.pausedMs += this.now() - this.pausedAtMs;
      this.pausedAtMs = null;
    }
    this.pendingFocusRecord = this.buildFocusRecord(true, this.now());
    this.phase = "abandoned";
    return this.pendingFocusRecord;
  }

  // J3 "Discard this session": nothing is recorded; the loop is abandoned.
  discard(): void {
    if (this.phase === "running" || this.phase === "paused" || this.phase === "step-done") {
      this.pendingFocusRecord = null;
      this.phase = "abandoned";
    }
  }

  snapshot(): LoopSnapshot | null {
    if (this.phase !== "running" && this.phase !== "paused") {
      return null;
    }
    return {
      loopId: this.loopId,
      stepIndex: this.stepIndex,
      phase: this.phase,
      stepStartedAtMs: this.stepStartedAtMs,
      pausedMs: this.pausedMs,
      pausedAtMs: this.pausedAtMs,
      intention: this.intention,
    };
  }

  // J9: restore after an OS kill. Time left → resume running; the step ended while the
  // app was closed → emit the record and land on step-done/loop-done so P13/P10 can
  // honestly recover it (the log is written on restore, spec P13).
  restore(snapshot: LoopSnapshot): void {
    this.loopId = snapshot.loopId;
    this.stepIndex = snapshot.stepIndex;
    this.stepStartedAtMs = snapshot.stepStartedAtMs;
    this.pausedMs = snapshot.pausedMs;
    this.pausedAtMs = snapshot.pausedAtMs;
    this.intention = snapshot.intention;
    this.phase = snapshot.phase;

    const step = this.plan[this.stepIndex];
    if (step == null) {
      this.phase = "idle";
      return;
    }
    if (snapshot.pausedAtMs != null) {
      this.pausedMs += this.now() - snapshot.pausedAtMs;
      this.pausedAtMs = null;
      this.phase = "running";
    }
    if (this.remainingSeconds() === 0) {
      this.onStepEnd();
    }
  }
}
