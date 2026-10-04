import AsyncStorage from "@react-native-async-storage/async-storage";
import { beforeEach, describe, expect, it } from "@jest/globals";
import {
  DEFAULT_WIDGET_SNAPSHOT,
  WIDGET_DATA_KEY,
  buildWidgetSnapshot,
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
