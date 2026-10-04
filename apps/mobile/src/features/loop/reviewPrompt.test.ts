import AsyncStorage from "@react-native-async-storage/async-storage";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { maybePromptStoreReview } from "./reviewPrompt";
import { FocusSession } from "./SessionLog";

const session = (overrides: Partial<FocusSession>): FocusSession => ({
  id: `${Math.random()}`,
  loopId: "loop-1",
  roundIndex: 1,
  intention: null,
  outcome: null,
  startedAt: "2026-10-01T09:00:00.000Z",
  endedAt: "2026-10-01T09:25:00.000Z",
  plannedSeconds: 1500,
  focusedSeconds: 1500,
  partial: false,
  ...overrides,
});

describe("maybePromptStoreReview (J6-R6)", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("does not request when the completed loop has no finished outcome", async () => {
    const request = jest.fn(() => Promise.resolve(true));
    const sessions = [session({ loopId: "l1", outcome: "moved-forward" })];
    await expect(maybePromptStoreReview("l1", sessions, request)).resolves.toBe(false);
    expect(request).not.toHaveBeenCalled();
  });

  it("does not request before the third qualified loop", async () => {
    const request = jest.fn(() => Promise.resolve(true));
    for (const loopId of ["l1", "l2"]) {
      const sessions = [session({ loopId, outcome: "finished" })];
      await expect(maybePromptStoreReview(loopId, sessions, request)).resolves.toBe(false);
    }
    expect(request).not.toHaveBeenCalled();
  });

  it("requests on the third qualified loop, exactly once", async () => {
    const request = jest.fn(() => Promise.resolve(true));
    for (const loopId of ["l1", "l2"]) {
      await maybePromptStoreReview(loopId, [session({ loopId, outcome: "finished" })], request);
    }
    const third = [session({ loopId: "l3", outcome: "finished" })];
    await expect(maybePromptStoreReview("l3", third, request)).resolves.toBe(true);
    expect(request).toHaveBeenCalledTimes(1);

    // A fourth qualified loop must not re-prompt.
    const fourth = [session({ loopId: "l4", outcome: "finished" })];
    await expect(maybePromptStoreReview("l4", fourth, request)).resolves.toBe(false);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it("does not spend the one-shot when the sheet is unavailable (CR-22)", async () => {
    const unavailable = jest.fn(() => Promise.resolve(false));
    for (const loopId of ["l1", "l2", "l3"]) {
      await maybePromptStoreReview(loopId, [session({ loopId, outcome: "finished" })], unavailable);
    }
    // Third qualified loop reached the requester but the sheet was unavailable —
    // the one-shot must not be spent.
    expect(unavailable).toHaveBeenCalledTimes(1);

    const available = jest.fn(() => Promise.resolve(true));
    const fourth = [session({ loopId: "l4", outcome: "finished" })];
    await expect(maybePromptStoreReview("l4", fourth, available)).resolves.toBe(true);
    expect(available).toHaveBeenCalledTimes(1);
  });

  it("ignores a loop id that already qualified", async () => {
    const request = jest.fn(() => Promise.resolve(true));
    const sessions = [session({ loopId: "l1", outcome: "finished" })];
    await maybePromptStoreReview("l1", sessions, request);
    // Re-completion of the same loopId (crash/retry) must not double-count.
    await maybePromptStoreReview("l1", sessions, request);
    const second = [session({ loopId: "l2", outcome: "finished" })];
    await maybePromptStoreReview("l2", second, request);
    const third = [session({ loopId: "l3", outcome: "finished" })];
    await expect(maybePromptStoreReview("l3", third, request)).resolves.toBe(true);
    expect(request).toHaveBeenCalledTimes(1);
  });
});
