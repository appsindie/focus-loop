import AsyncStorage from "@react-native-async-storage/async-storage";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { isLoopSnapshot, loadEngineSnapshot, saveEngineSnapshot } from "./engineSnapshot";
import { buildLoopPlan } from "./loopPlan";
import { LoopSnapshot } from "./LoopEngine";

const PLAN = buildLoopPlan({ focusMinutes: 10, breakMinutes: 2, rounds: 2, longBreakMinutes: 5 });

const SNAPSHOT: LoopSnapshot = {
  loopId: "loop-1",
  stepIndex: 0,
  phase: "running",
  stepStartedAtMs: 1_000_000,
  pausedMs: 0,
  pausedAtMs: null,
  intention: "write tests",
  pendingFocusRecord: null,
  plan: PLAN,
};

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe("engine snapshot store (J9)", () => {
  it("round-trips a live snapshot", async () => {
    await saveEngineSnapshot(SNAPSHOT);
    await expect(loadEngineSnapshot()).resolves.toEqual(SNAPSHOT);
  });

  it("saving null clears the slot", async () => {
    await saveEngineSnapshot(SNAPSHOT);
    await saveEngineSnapshot(null);
    await expect(loadEngineSnapshot()).resolves.toBeNull();
  });

  it("a corrupt payload loads null and clears itself", async () => {
    await AsyncStorage.setItem("focus-loop/v1/engine-snapshot", "{not json");
    await expect(loadEngineSnapshot()).resolves.toBeNull();
    await expect(AsyncStorage.getItem("focus-loop/v1/engine-snapshot")).resolves.toBeNull();
  });

  it("rejects structurally invalid snapshots", () => {
    expect(isLoopSnapshot(null)).toBe(false);
    expect(isLoopSnapshot({ ...SNAPSHOT, stepIndex: 99 })).toBe(false); // beyond plan
    expect(isLoopSnapshot({ ...SNAPSHOT, phase: "idle" })).toBe(false);
    expect(isLoopSnapshot({ ...SNAPSHOT, plan: [] })).toBe(false);
    expect(
      isLoopSnapshot({
        ...SNAPSHOT,
        plan: [{ kind: "focus", roundIndex: 1, durationSeconds: -5 }],
      }),
    ).toBe(false);
    expect(isLoopSnapshot({ ...SNAPSHOT, stepStartedAtMs: "soon" })).toBe(false);
    expect(isLoopSnapshot(SNAPSHOT)).toBe(true);
  });
});
