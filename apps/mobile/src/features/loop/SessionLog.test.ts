import AsyncStorage from "@react-native-async-storage/async-storage";
import { beforeEach, describe, expect, it } from "@jest/globals";
import {
  loadSessions,
  recordSession,
  sessionsInLoop,
  sessionsOnDay,
  updateSessionOutcome,
} from "./SessionLog";

const BASE = {
  loopId: "loop-1",
  roundIndex: 1,
  intention: null,
  outcome: null,
  startedAt: "2026-10-03T10:00:00.000Z",
  endedAt: "2026-10-03T10:25:00.000Z",
  plannedSeconds: 1500,
  focusedSeconds: 1500,
  partial: false,
};

describe("SessionLog", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("records and loads sessions (spec J2-R4)", async () => {
    const saved = await recordSession(BASE);
    expect(saved.id).toBeTruthy();
    const sessions = await loadSessions();
    expect(sessions).toHaveLength(1);
    expect(sessions[0]!.roundIndex).toBe(1);
  });

  it("returns an empty log when storage holds a corrupted payload", async () => {
    await AsyncStorage.setItem("focus-loop/v1/sessions", "{not json");
    await expect(loadSessions()).resolves.toEqual([]);
    await AsyncStorage.setItem("focus-loop/v1/sessions", '{"wrong": true}');
    await expect(loadSessions()).resolves.toEqual([]);
  });

  it("updates the outcome chosen on P10 (optional)", async () => {
    const saved = await recordSession(BASE);
    await updateSessionOutcome(saved.id, "moved-forward");
    const sessions = await loadSessions();
    expect(sessions[0]!.outcome).toBe("moved-forward");
    await updateSessionOutcome("missing-id", "finished");
    expect(sessions).toHaveLength(1);
  });

  it("filters sessions by calendar day and by loop", async () => {
    await recordSession(BASE);
    await recordSession({ ...BASE, roundIndex: 2, endedAt: "2026-10-03T11:00:00.000Z" });
    await recordSession({ ...BASE, loopId: "loop-2", endedAt: "2026-10-04T11:00:00.000Z" });

    expect(sessionsOnDay(await loadSessions(), new Date("2026-10-03T15:00:00"))).toHaveLength(2);
    expect(sessionsOnDay(await loadSessions(), new Date("2026-10-04T15:00:00"))).toHaveLength(1);
    const loopOne = sessionsInLoop(await loadSessions(), "loop-1");
    expect(loopOne.map((s) => s.roundIndex)).toEqual([1, 2]);
  });
});
