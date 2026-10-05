import AsyncStorage from "@react-native-async-storage/async-storage";
import { beforeEach, describe, expect, it } from "@jest/globals";
import {
  DEFAULT_WIDGET_SNAPSHOT,
  WIDGET_DATA_KEY,
  buildWidgetSnapshot,
  liveActivityStepStrings,
  liveRunning,
  loadWidgetSnapshot,
  type RunningStepSurface,
} from "./widgetData";

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe("buildWidgetSnapshot", () => {
  it("carries week progress, next parked thought, focus minutes and running state", () => {
    const running = {
      kind: "focus" as const,
      displayMode: "disc" as const,
      remainingSeconds: 300,
      endsAtMs: 1_700_000_000_000,
      paused: false,
      currentFocusNumber: 1,
      totalFocusCount: 4,
    };
    const snapshot = buildWidgetSnapshot({
      weekDaysMet: 2,
      weekGoalDays: 4,
      nextParkedText: "call the dentist",
      focusMinutes: 25,
      running,
    });
    expect(snapshot.schemaVersion).toBe(1);
    expect(snapshot.weekDaysMet).toBe(2);
    expect(snapshot.nextParkedText).toBe("call the dentist");
    expect(snapshot.running).toEqual(running);
  });
});

describe("loadWidgetSnapshot", () => {
  it("falls back to defaults when nothing was published", async () => {
    await expect(loadWidgetSnapshot()).resolves.toEqual(DEFAULT_WIDGET_SNAPSHOT);
  });

  it("falls back to defaults on corrupt JSON", async () => {
    await AsyncStorage.setItem(WIDGET_DATA_KEY, "{not json");
    await expect(loadWidgetSnapshot()).resolves.toEqual(DEFAULT_WIDGET_SNAPSHOT);
  });

  it("falls back to defaults when required fields are missing", async () => {
    await AsyncStorage.setItem(WIDGET_DATA_KEY, JSON.stringify({ weekDaysMet: "two" }));
    await expect(loadWidgetSnapshot()).resolves.toEqual(DEFAULT_WIDGET_SNAPSHOT);
  });

  it("round-trips a published snapshot", async () => {
    const snapshot = buildWidgetSnapshot({
      weekDaysMet: 3,
      weekGoalDays: 4,
      nextParkedText: null,
      focusMinutes: 15,
      running: null,
    });
    await AsyncStorage.setItem(WIDGET_DATA_KEY, JSON.stringify(snapshot));
    await expect(loadWidgetSnapshot()).resolves.toEqual(snapshot);
  });
});

describe("liveRunning (CR-19)", () => {
  const running = (overrides: Partial<RunningStepSurface> = {}): RunningStepSurface => ({
    kind: "focus",
    displayMode: "disc",
    remainingSeconds: 300,
    endsAtMs: 1_800_000_000_000,
    paused: false,
    currentFocusNumber: 1,
    totalFocusCount: 4,
    ...overrides,
  });
  const withRunning = (r: RunningStepSurface | null) =>
    buildWidgetSnapshot({
      weekDaysMet: 0,
      weekGoalDays: 4,
      nextParkedText: null,
      focusMinutes: 25,
      running: r,
    });

  it("is null when nothing is running", () => {
    expect(liveRunning(withRunning(null))).toBeNull();
  });

  it("is live while endsAtMs is ahead of render time", () => {
    const snapshot = withRunning(running({ endsAtMs: 10_000 }));
    expect(liveRunning(snapshot, 5_000)).not.toBeNull();
  });

  it("falls back to idle once endsAtMs has passed (app never republished)", () => {
    const snapshot = withRunning(running({ endsAtMs: 10_000 }));
    expect(liveRunning(snapshot, 10_001)).toBeNull();
  });

  it("a paused step stays live — it has no wall-clock end", () => {
    const snapshot = withRunning(running({ paused: true, endsAtMs: 0 }));
    expect(liveRunning(snapshot, Number.MAX_SAFE_INTEGER)).not.toBeNull();
  });
});

describe("liveActivityStepStrings", () => {
  const strings = {
    focusCounter: "Focus {n} of {total}",
    breakLabel: "Break",
    longBreakLabel: "Long break",
    nextUp: "Next up: {text}",
  };
  const surface = (overrides: Partial<RunningStepSurface> = {}): RunningStepSurface => ({
    kind: "focus",
    displayMode: "disc",
    remainingSeconds: 300,
    endsAtMs: 1_800_000_000_000,
    paused: false,
    currentFocusNumber: 1,
    totalFocusCount: 4,
    ...overrides,
  });

  it("focus title resolves to the numbered round", () => {
    expect(liveActivityStepStrings(surface({ currentFocusNumber: 2 }), strings)).toEqual({
      stepTitle: "Focus 2 of 4",
    });
  });

  it("break shows the next focus round coming up", () => {
    expect(
      liveActivityStepStrings(surface({ kind: "break", currentFocusNumber: 1 }), strings),
    ).toEqual({ stepTitle: "Break", nextStep: "Next up: Focus 2 of 4" });
  });

  it("long break names itself and the last break has no next round", () => {
    expect(
      liveActivityStepStrings(surface({ kind: "longBreak", currentFocusNumber: 4 }), strings),
    ).toEqual({ stepTitle: "Long break", nextStep: "" });
  });

  it("falls back to English literals when strings are absent", () => {
    expect(liveActivityStepStrings(surface({ kind: "break" }), {})).toEqual({
      stepTitle: "Break",
      nextStep: "Next up: Focus 2 of 4",
    });
  });
});
