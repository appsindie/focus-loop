import { describe, expect, it } from "@jest/globals";
import { LoopEngine } from "./LoopEngine";
import { buildLoopPlan } from "./loopPlan";

const PLAN = buildLoopPlan({ focusMinutes: 10, breakMinutes: 2, rounds: 2, longBreakMinutes: 5 });
// steps: F(600s) B(120s) F(600s) LB(300s)

function makeEngine(nowRef: { t: number }, autoStartBreaks = false) {
  return new LoopEngine(PLAN, { now: () => nowRef.t, autoStartBreaks });
}

describe("LoopEngine", () => {
  it("runs focus → step-done with a completed focus record (spec J2-R4)", () => {
    const now = { t: 1_000_000 };
    const engine = makeEngine(now);
    engine.start("ship the spec");
    expect(engine.currentPhase).toBe("running");
    expect(engine.remainingSeconds()).toBe(600);

    now.t += 600_000;
    engine.tick();
    expect(engine.currentPhase).toBe("step-done");
    const record = engine.completedFocusRecord;
    expect(record).toMatchObject({
      roundIndex: 1,
      intention: "ship the spec",
      plannedSeconds: 600,
      focusedSeconds: 600,
      partial: false,
    });
  });

  it("advances through the whole loop: break → focus → loop-done → long break → finished", () => {
    const now = { t: 0 };
    const engine = makeEngine(now);
    engine.start();

    now.t += 600_000;
    engine.tick();
    engine.advance();
    expect(engine.currentStep!.kind).toBe("break");
    expect(engine.remainingSeconds()).toBe(120);

    now.t += 120_000;
    engine.tick();
    expect(engine.currentPhase).toBe("step-done");

    engine.advance("second");
    now.t += 600_000;
    engine.tick();
    expect(engine.currentPhase).toBe("loop-done");

    engine.advance();
    expect(engine.currentStep!.kind).toBe("longBreak");
    now.t += 300_000;
    engine.tick();
    expect(engine.currentPhase).toBe("finished");
  });

  it("auto-starts the next focus when a break ends and the P10 toggle is on (spec J2-R8)", () => {
    const now = { t: 0 };
    const engine = makeEngine(now, true);
    engine.start();
    now.t += 600_000;
    engine.tick();
    engine.advance();
    expect(engine.currentStep!.kind).toBe("break");
    now.t += 120_000;
    engine.tick();
    expect(engine.currentPhase).toBe("running");
    expect(engine.currentStep!.kind).toBe("focus");
    expect(engine.currentStep!.roundIndex).toBe(2);
  });

  it("pause and resume keep the remaining time honest", () => {
    const now = { t: 0 };
    const engine = makeEngine(now);
    engine.start();
    now.t += 100_000;
    engine.pause();
    expect(engine.currentPhase).toBe("paused");
    now.t += 999_999_000;
    engine.resume();
    expect(engine.currentPhase).toBe("running");
    expect(engine.remainingSeconds()).toBe(500);
  });

  it("end early emits a partial record and abandons the loop (spec J3-R2)", () => {
    const now = { t: 0 };
    const engine = makeEngine(now);
    engine.start();
    now.t += 150_000;
    engine.pause();
    const record = engine.endEarly();
    expect(record).toMatchObject({ focusedSeconds: 150, plannedSeconds: 600, partial: true });
    expect(engine.currentPhase).toBe("abandoned");
  });

  it("discard emits nothing and abandons (spec J3)", () => {
    const now = { t: 0 };
    const engine = makeEngine(now);
    engine.start();
    now.t += 50_000;
    engine.discard();
    expect(engine.currentPhase).toBe("abandoned");
    expect(engine.completedFocusRecord).toBeNull();
  });

  it("skips and extends a running break (spec J2 variants)", () => {
    const now = { t: 0 };
    const engine = makeEngine(now);
    engine.start();
    now.t += 600_000;
    engine.tick();
    engine.advance();
    expect(engine.currentStep!.kind).toBe("break");

    engine.extendBreak(300); // +5 min
    expect(engine.remainingSeconds()).toBe(420);

    engine.skipBreak();
    expect(engine.currentStep!.kind).toBe("focus");
    expect(engine.currentPhase).toBe("running");
  });

  it("snapshot + restore resumes a killed loop with time left (spec J9)", () => {
    const now = { t: 0 };
    const engine = makeEngine(now);
    engine.start();
    now.t += 100_000;
    const snap = engine.snapshot()!;

    const restored = makeEngine(now);
    restored.restore(snap);
    expect(restored.currentPhase).toBe("running");
    expect(restored.remainingSeconds()).toBe(500);
    expect(restored.currentLoopId).toBe(engine.currentLoopId);
  });

  it("restore of a focus that ended while closed emits the record for P13 recovery", () => {
    const now = { t: 0 };
    const engine = makeEngine(now);
    engine.start("deep work");
    const snap = engine.snapshot()!;
    now.t += 700_000; // focus (600s) completed while the app was dead

    const restored = makeEngine(now);
    restored.restore(snap);
    expect(restored.currentPhase).toBe("step-done");
    expect(restored.completedFocusRecord).toMatchObject({
      intention: "deep work",
      partial: false,
      focusedSeconds: 600,
    });
  });
});
