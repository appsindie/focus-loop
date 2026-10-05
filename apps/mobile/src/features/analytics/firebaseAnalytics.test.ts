import { afterEach, describe, expect, it, jest } from "@jest/globals";

import { trackEvent, setEventSink } from "./events";

const mockLogEvent = jest
  .fn<(name: string, params: Record<string, string | number | boolean>) => Promise<void>>()
  .mockResolvedValue(undefined);
jest.mock("@react-native-firebase/analytics", () => ({
  __esModule: true,
  default: jest.fn(() => ({ logEvent: mockLogEvent })),
}));

import { registerFirebaseAnalytics } from "./firebaseAnalytics";

describe("registerFirebaseAnalytics", () => {
  afterEach(() => {
    setEventSink(null);
    mockLogEvent.mockClear();
  });

  it("forwards trackEvent calls to Firebase mockLogEvent", () => {
    expect(registerFirebaseAnalytics()).toBe(true);
    trackEvent("goal_day_met", { day: "2026-10-05" });
    expect(mockLogEvent).toHaveBeenCalledWith("goal_day_met", { day: "2026-10-05" });
  });

  it("drops null props but keeps strings, numbers and booleans", () => {
    expect(registerFirebaseAnalytics()).toBe(true);
    trackEvent("rewarded_ad_failed", { itemId: "dark", result: "closed", count: 3, flag: true });
    expect(mockLogEvent).toHaveBeenCalledWith("rewarded_ad_failed", {
      itemId: "dark",
      result: "closed",
      count: 3,
      flag: true,
    });
    trackEvent("focus_session_completed", { plannedSeconds: 1500, endedEarly: false, extra: null });
    expect(mockLogEvent).toHaveBeenLastCalledWith("focus_session_completed", {
      plannedSeconds: 1500,
      endedEarly: false,
    });
  });

  it("swallows mockLogEvent rejections so analytics never breaks the app", async () => {
    expect(registerFirebaseAnalytics()).toBe(true);
    mockLogEvent.mockRejectedValueOnce(new Error("offline"));
    expect(() => trackEvent("loop_completed", { loopId: "l1" })).not.toThrow();
    await Promise.resolve();
  });
});
