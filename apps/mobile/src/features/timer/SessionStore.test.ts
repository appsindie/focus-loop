import AsyncStorage from "@react-native-async-storage/async-storage";
import { beforeEach, describe, expect, it } from "@jest/globals";
import {
  CompletedSession,
  computeStats,
  loadSessions,
  recordSession,
  saveSessions,
} from "./SessionStore";

describe("SessionStore", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("returns an empty list when nothing is stored", async () => {
    const sessions = await loadSessions();
    expect(sessions).toEqual([]);
  });

  it("records and reloads sessions", async () => {
    const startedAt = new Date("2026-08-06T12:00:00.000Z");
    await recordSession(startedAt, 1500);
    const sessions = await loadSessions();
    expect(sessions).toHaveLength(1);
    expect(sessions[0]!.durationSeconds).toBe(1500);
    expect(sessions[0]!.startedAt).toBe(startedAt.toISOString());
  });

  it("ignores corrupted storage and returns an empty list", async () => {
    await AsyncStorage.setItem("focus-loop/sessions", "not-json");
    const sessions = await loadSessions();
    expect(sessions).toEqual([]);
  });

  it("ignores storage with the wrong shape", async () => {
    await AsyncStorage.setItem("focus-loop/sessions", JSON.stringify([{ foo: "bar" }]));
    const sessions = await loadSessions();
    expect(sessions).toEqual([]);
  });

  it("counts sessions completed today", async () => {
    const today = new Date("2026-08-06T12:00:00.000Z");
    const yesterday = new Date("2026-08-05T12:00:00.000Z");
    const sessions: CompletedSession[] = [
      {
        id: "1",
        startedAt: today.toISOString(),
        endedAt: today.toISOString(),
        durationSeconds: 1500,
      },
      {
        id: "2",
        startedAt: yesterday.toISOString(),
        endedAt: yesterday.toISOString(),
        durationSeconds: 1500,
      },
    ];
    await saveSessions(sessions);
    const stats = computeStats(await loadSessions(), today);
    expect(stats.sessionsToday).toBe(1);
  });

  it("computes a streak that continues today", () => {
    const today = new Date("2026-08-06T12:00:00.000Z");
    const sessions: CompletedSession[] = [
      {
        id: "1",
        startedAt: new Date("2026-08-06T11:00:00.000Z").toISOString(),
        endedAt: today.toISOString(),
        durationSeconds: 1500,
      },
      {
        id: "2",
        startedAt: new Date("2026-08-05T11:00:00.000Z").toISOString(),
        endedAt: new Date("2026-08-05T11:00:00.000Z").toISOString(),
        durationSeconds: 1500,
      },
      {
        id: "3",
        startedAt: new Date("2026-08-04T11:00:00.000Z").toISOString(),
        endedAt: new Date("2026-08-04T11:00:00.000Z").toISOString(),
        durationSeconds: 1500,
      },
    ];
    const stats = computeStats(sessions, today);
    expect(stats.streakDays).toBe(3);
  });

  it("computes a streak that continues from yesterday", () => {
    const today = new Date("2026-08-06T12:00:00.000Z");
    const sessions: CompletedSession[] = [
      {
        id: "1",
        startedAt: new Date("2026-08-05T11:00:00.000Z").toISOString(),
        endedAt: new Date("2026-08-05T11:00:00.000Z").toISOString(),
        durationSeconds: 1500,
      },
      {
        id: "2",
        startedAt: new Date("2026-08-04T11:00:00.000Z").toISOString(),
        endedAt: new Date("2026-08-04T11:00:00.000Z").toISOString(),
        durationSeconds: 1500,
      },
    ];
    const stats = computeStats(sessions, today);
    expect(stats.streakDays).toBe(2);
  });

  it("resets the streak when a day is missed", () => {
    const today = new Date("2026-08-06T12:00:00.000Z");
    const sessions: CompletedSession[] = [
      {
        id: "1",
        startedAt: new Date("2026-08-04T11:00:00.000Z").toISOString(),
        endedAt: new Date("2026-08-04T11:00:00.000Z").toISOString(),
        durationSeconds: 1500,
      },
    ];
    const stats = computeStats(sessions, today);
    expect(stats.streakDays).toBe(0);
  });
});

describe("computeStreak DST handling", () => {
  it("uses calendar-day boundaries, not fixed 24h offsets", () => {
    // Simulate a DST "fall back" day where the real wall-clock gap is 25 hours.
    // Nov 1 2026 12:00 UTC is the day before a US fall-back transition.
    const nov1Noon = new Date("2026-11-01T12:00:00.000-04:00");
    const nov2Noon = new Date("2026-11-02T12:00:00.000-05:00");
    const nov3Noon = new Date("2026-11-03T12:00:00.000-05:00");

    const sessions: CompletedSession[] = [
      {
        id: "1",
        startedAt: nov3Noon.toISOString(),
        endedAt: nov3Noon.toISOString(),
        durationSeconds: 1500,
      },
      {
        id: "2",
        startedAt: nov2Noon.toISOString(),
        endedAt: nov2Noon.toISOString(),
        durationSeconds: 1500,
      },
      {
        id: "3",
        startedAt: nov1Noon.toISOString(),
        endedAt: nov1Noon.toISOString(),
        durationSeconds: 1500,
      },
    ];

    const stats = computeStats(sessions, nov3Noon);
    expect(stats.streakDays).toBe(3);
  });
});
