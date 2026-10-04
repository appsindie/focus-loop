import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook } from "@testing-library/react-native";
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { useLoopController } from "./useLoopController";
import { buildLoopPlan } from "./loopPlan";
import { LoopSnapshot } from "./LoopEngine";
import { DEFAULT_SETTINGS, Settings } from "../settings/SettingsStore";
import { saveEngineSnapshot } from "./engineSnapshot";
import { requireNativeModule } from "expo-modules-core";

// CR-17: spy on the iOS native surface module so the unconditional endActivity
// teardown is observable from jest (Platform.OS === "ios" under jest-expo).
jest.mock("expo-modules-core", () => {
  const actual = jest.requireActual<typeof import("expo-modules-core")>("expo-modules-core");
  const module = {
    areActivitiesEnabled: () => true,
    startActivity: jest.fn(),
    updateActivity: jest.fn(),
    endActivity: jest.fn(),
    setSharedData: jest.fn(),
    reloadWidgetTimelines: jest.fn(),
  };
  return {
    ...actual,
    // Our module answers with the spy; every other native lookup (expo's own
    // winter runtime included) passes through to the real implementation.
    requireNativeModule: jest.fn((name: string) =>
      name === "ReactNativeWidgetExtension" ? module : actual.requireNativeModule(name),
    ),
  };
});

type NativeModuleSpy = {
  endActivity: jest.MockedFunction<() => void>;
};
const nativeModuleSpy = (): NativeModuleSpy => {
  const mod: unknown = requireNativeModule("ReactNativeWidgetExtension");
  return mod as NativeModuleSpy;
};

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

  it("CR-10: non-default rhythm + live snapshot restores into the post-swap engine", async () => {
    // Saved rhythm is Gentle but the pre-load engine was built on Classic —
    // the swap must land BEFORE boot restores, or the session strands.
    const plan = buildLoopPlan({
      focusMinutes: 15,
      breakMinutes: 5,
      rounds: 4,
      longBreakMinutes: 15,
    });
    const snapshot: LoopSnapshot = {
      loopId: "kill-5",
      stepIndex: 0,
      phase: "running",
      stepStartedAtMs: Date.now() - 60_000,
      pausedMs: 0,
      pausedAtMs: null,
      intention: null,
      pendingFocusRecord: null,
      plan,
    };
    await saveEngineSnapshot(snapshot);

    const { result, rerender } = await renderHook(
      ({ settings, loading }: { settings: Settings; loading: boolean }) =>
        useLoopController(settings, loading),
      { initialProps: { settings: DEFAULT_SETTINGS, loading: true } },
    );
    await act(async () => {
      await rerender({ settings: { ...SETTINGS, rhythmPresetId: "gentle" }, loading: false });
      await Promise.resolve();
      await Promise.resolve();
    });
    await flushBoot();
    expect(result.current.route).toBe("focus");
    expect(result.current.engine.currentLoopId).toBe("kill-5");
    expect(result.current.engine.currentPhase).toBe("running");
    expect(result.current.engine.remainingSeconds()).toBeGreaterThan(800);
  });

  it("CR-11: a mid-loop rhythm change applies to the next loop", async () => {
    let settings: Settings = { ...SETTINGS, rhythmPresetId: "classic" };
    const { result, rerender } = await renderHook(() => useLoopController(settings, false));
    await flushBoot();
    await act(async () => {
      result.current.startFocus();
      await Promise.resolve();
    });
    const runningEngine = result.current.engine;
    expect(runningEngine.baseSteps[0]?.durationSeconds).toBe(25 * 60);

    // Change the preset mid-loop: the running engine keeps its plan...
    settings = { ...settings, rhythmPresetId: "gentle" };
    await act(async () => {
      await rerender({});
    });
    expect(result.current.engine).toBe(runningEngine);

    // ...and once the loop goes terminal, the swap lands — next start uses Gentle.
    await act(async () => {
      result.current.endEarlyDiscard();
      await Promise.resolve();
    });
    await flushBoot();
    expect(result.current.engine).not.toBe(runningEngine);
    expect(result.current.engine.baseSteps[0]?.durationSeconds).toBe(15 * 60);
  });

  it("J4-R1: a widget start intent boots straight into a running focus", async () => {
    const { result } = await renderHook(() =>
      useLoopController(SETTINGS, false, undefined, "start"),
    );
    await flushBoot();
    expect(result.current.route).toBe("focus");
    expect(result.current.engine.currentPhase).toBe("running");
    expect(result.current.engine.currentStep?.kind).toBe("focus");
  });

  it("J4-R1: a live snapshot outranks the widget start intent", async () => {
    const plan = buildLoopPlan({
      focusMinutes: 25,
      breakMinutes: 5,
      rounds: 4,
      longBreakMinutes: 15,
    });
    const snapshot: LoopSnapshot = {
      loopId: "kill-9",
      stepIndex: 0,
      phase: "running",
      stepStartedAtMs: Date.now() - 60_000,
      pausedMs: 0,
      pausedAtMs: null,
      intention: null,
      pendingFocusRecord: null,
      plan,
    };
    await saveEngineSnapshot(snapshot);

    const { result } = await renderHook(() =>
      useLoopController(SETTINGS, false, undefined, "start"),
    );
    await flushBoot();
    // The recovered session wins — the intent must not spawn a second loop.
    expect(result.current.engine.currentLoopId).toBe("kill-9");
  });

  it("J4: deep-link 'start' mid-session is a no-op; 'pause' pauses the step", async () => {
    const { result } = await renderHook(() => useLoopController(SETTINGS, false));
    await flushBoot();
    await act(async () => {
      result.current.startFocus();
      await Promise.resolve();
    });
    const engine = result.current.engine;
    await act(async () => {
      result.current.handleDeepLinkIntent("start");
      await Promise.resolve();
    });
    expect(result.current.engine).toBe(engine);
    expect(result.current.engine.currentPhase).toBe("running");

    await act(async () => {
      result.current.handleDeepLinkIntent("pause");
      await Promise.resolve();
    });
    expect(result.current.engine.currentPhase).toBe("paused");
  });

  it("CR-17: boot with a null snapshot ends a Live Activity a dead process left behind", async () => {
    // The OS keeps a Live Activity for hours after the app is killed — the
    // in-memory flag is false on the next boot, so teardown must be
    // unconditional on the first null-surface sync.
    await renderHook(() => useLoopController(SETTINGS, false));
    await flushBoot();
    expect(nativeModuleSpy().endActivity).toHaveBeenCalled();
  });
});
