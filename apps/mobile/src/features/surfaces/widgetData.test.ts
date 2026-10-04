import AsyncStorage from "@react-native-async-storage/async-storage";
import { beforeEach, describe, expect, it } from "@jest/globals";
import {
  DEFAULT_WIDGET_SNAPSHOT,
  WIDGET_DATA_KEY,
  buildWidgetSnapshot,
  loadWidgetSnapshot,
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
