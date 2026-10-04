import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook } from "@testing-library/react-native";
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { useLoopController } from "./useLoopController";
import { buildLoopPlan } from "./loopPlan";
import { LoopSnapshot } from "./LoopEngine";
import { DEFAULT_SETTINGS, Settings } from "../settings/SettingsStore";
import { saveEngineSnapshot } from "./engineSnapshot";

const SETTINGS: Settings = { ...DEFAULT_SETTINGS, displayMode: "disc" };

const flushBoot = async () => {
  // Boot is async (storage loads + effects); let React act flush everything.
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
};

beforeEach(async () => {
  await AsyncStorage.clear();
});

afterEach(() => {
  // A running engine holds a setInterval that poisons the next mount's act
  // flush under fake timers — clear whatever is pending between tests.
  jest.clearAllTimers();
});

describe("useLoopController", () => {
  it("boots to home with a saved display mode", async () => {
    const { result } = await renderHook(() => useLoopController(SETTINGS, false));
    await flushBoot();
    expect(result.current.route).toBe("home");
  });

  it("boots to first-launch when no display mode was ever saved", async () => {
    const { result } = await renderHook(() =>
      useLoopController({ ...SETTINGS, displayMode: null }, false),
    );
    await flushBoot();
    expect(result.current.route).toBe("first-launch");
  });

  it("CR-06: changing displayMode while on the focus screen never re-routes", async () => {
    let settings = SETTINGS;
    const { result, rerender } = await renderHook(() => useLoopController(settings, false));
    await flushBoot();
    expect(result.current.route).toBe("home");

    await act(async () => {
      result.current.startFocus();
      await Promise.resolve();
    });
    expect(result.current.route).toBe("focus");

    // The user flips the Disc/Numbers toggle on the Focus screen — the settings
    // object changes identity, the boot effect must NOT re-run its routing.
    settings = { ...SETTINGS, displayMode: "numbers" };
    await act(async () => {
      await rerender({});
    });
    expect(result.current.route).toBe("focus");
    await flushBoot();
    expect(result.current.route).toBe("focus");
  });

  it("J9: a snapshot of a still-running focus resumes straight to the timer", async () => {
    const plan = buildLoopPlan({
      focusMinutes: 25,
      breakMinutes: 5,
      rounds: 4,
      longBreakMinutes: 15,
    });
    const snapshot: LoopSnapshot = {
      loopId: "kill-1",
      stepIndex: 0,
      phase: "running",
      stepStartedAtMs: Date.now() - 60_000, // 1 min into a 25-min focus
      pausedMs: 0,
      pausedAtMs: null,
      intention: "resume",
      pendingFocusRecord: null,
      plan,
    };
    await saveEngineSnapshot(snapshot);

    const { result } = await renderHook(() => useLoopController(SETTINGS, false));
    await flushBoot();
    expect(result.current.route).toBe("focus");
    expect(result.current.engine.currentLoopId).toBe("kill-1");
    expect(result.current.engine.remainingSeconds()).toBeGreaterThan(1400);
  });

  it("J9: a focus that expired while closed routes to welcome-back (P13)", async () => {
    const plan = buildLoopPlan({
      focusMinutes: 25,
      breakMinutes: 5,
      rounds: 4,
      longBreakMinutes: 15,
    });
    const snapshot: LoopSnapshot = {
      loopId: "kill-2",
      stepIndex: 0,
      phase: "running",
      stepStartedAtMs: Date.now() - 26 * 60_000, // focus ended a minute ago
      pausedMs: 0,
      pausedAtMs: null,
      intention: null,
      pendingFocusRecord: null,
      plan,
    };
    await saveEngineSnapshot(snapshot);

    const { result } = await renderHook(() => useLoopController(SETTINGS, false));
    await flushBoot();
    expect(result.current.route).toBe("welcome-back");
    // J9-R3: the recovered session was logged like any other — record drained.
    await flushBoot();
    expect(result.current.lastSession?.loopId).toBe("kill-2");

    await act(async () => {
      result.current.welcomeHowDidItGo();
      await Promise.resolve();
    });
    expect(result.current.route).toBe("closeout");
  });

  it("J9: welcome-back 'Skip to break' advances straight into the break", async () => {
    const plan = buildLoopPlan({
      focusMinutes: 25,
      breakMinutes: 5,
      rounds: 4,
      longBreakMinutes: 15,
    });
    const snapshot: LoopSnapshot = {
      loopId: "kill-3",
      stepIndex: 0,
      phase: "running",
      stepStartedAtMs: Date.now() - 26 * 60_000,
      pausedMs: 0,
      pausedAtMs: null,
      intention: null,
      pendingFocusRecord: null,
      plan,
    };
    await saveEngineSnapshot(snapshot);

    const { result } = await renderHook(() => useLoopController(SETTINGS, false));
    await flushBoot();
    await act(async () => {
      result.current.welcomeSkipToBreak();
      await Promise.resolve();
    });
    expect(result.current.route).toBe("break");
    expect(result.current.engine.currentStep?.kind).toBe("break");
  });

  it("J9: a snapshot killed on the close-out returns to close-out, not welcome-back", async () => {
    const plan = buildLoopPlan({
      focusMinutes: 25,
      breakMinutes: 5,
      rounds: 4,
      longBreakMinutes: 15,
    });
    const snapshot: LoopSnapshot = {
      loopId: "kill-4",
      stepIndex: 0,
      phase: "step-done",
      stepStartedAtMs: Date.now() - 25 * 60_000,
      pausedMs: 0,
      pausedAtMs: null,
      intention: null,
      pendingFocusRecord: {
        loopId: "kill-4",
        roundIndex: 1,
        intention: null,
        startedAt: new Date(Date.now() - 25 * 60_000).toISOString(),
        endedAt: new Date(Date.now()).toISOString(),
        plannedSeconds: 1500,
        focusedSeconds: 1500,
        partial: false,
      },
      plan,
    };
    await saveEngineSnapshot(snapshot);

    const { result } = await renderHook(() => useLoopController(SETTINGS, false));
    await flushBoot();
    expect(result.current.route).toBe("closeout");
    await flushBoot();
    // The unwritten record still reaches the log (J9-R3).
    expect(result.current.lastSession?.loopId).toBe("kill-4");
  });
});
