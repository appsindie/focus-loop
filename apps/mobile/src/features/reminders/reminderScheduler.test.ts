import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import * as Notifications from "expo-notifications";
import { PermissionStatus } from "expo-notifications";
import {
  clearReminderSchedules,
  reminderIdentifier,
  syncReminderSchedules,
  toExpoWeekday,
} from "./reminderScheduler";
import { ReminderPrefs } from "./reminderStore";

const schedule = jest.mocked(Notifications.scheduleNotificationAsync);
const cancel = jest.mocked(Notifications.cancelScheduledNotificationAsync);
const getAll = jest.mocked(Notifications.getAllScheduledNotificationsAsync);
const perms = jest.mocked(Notifications.getPermissionsAsync);

const PREFS: ReminderPrefs = {
  reminders: [
    { id: "r-1", hour: 9, minute: 0, days: [1, 2, 3, 4, 5], enabled: true },
    { id: "r-2", hour: 14, minute: 30, days: [6, 7], enabled: false },
  ],
  eveningNote: true,
};

const CONTEXT = {
  focusedToday: false,
  goalUnmet: true,
  now: new Date(2026, 9, 3, 10, 0),
};

beforeEach(() => {
  jest.clearAllMocks();
  perms.mockResolvedValue({ status: PermissionStatus.GRANTED } as never);
  getAll.mockResolvedValue([]);
});

describe("toExpoWeekday", () => {
  it("maps ISO Mon..Sun to expo 2..7/1", () => {
    expect(toExpoWeekday(1)).toBe(2);
    expect(toExpoWeekday(6)).toBe(7);
    expect(toExpoWeekday(7)).toBe(1);
  });
});

describe("syncReminderSchedules", () => {
  it("schedules one weekly trigger per enabled day (J5-R1)", async () => {
    await syncReminderSchedules(PREFS, CONTEXT);
    const reminderCalls = schedule.mock.calls.filter(([arg]) =>
      arg.identifier?.startsWith("focus-loop-reminder-"),
    );
    // 5 weekdays for r-1; r-2 disabled → nothing.
    expect(reminderCalls).toHaveLength(5);
    const first = reminderCalls[0]?.[0];
    expect(first?.trigger).toEqual({ type: "weekly", weekday: 2, hour: 9, minute: 0 });
    expect(first?.content.data).toEqual({ url: "focusloop://start" });
  });

  it("schedules evening one-shots for the horizon when the goal is unmet", async () => {
    await syncReminderSchedules(PREFS, CONTEXT);
    const eveningCalls = schedule.mock.calls.filter(([arg]) =>
      arg.identifier?.startsWith("focus-loop-evening-"),
    );
    expect(eveningCalls).toHaveLength(7);
    const trigger = eveningCalls[0]?.[0].trigger as { type?: string } | undefined;
    expect(trigger?.type).toBe("date");
  });

  it("schedules no evening notes once the weekly goal is met", async () => {
    await syncReminderSchedules(PREFS, { ...CONTEXT, goalUnmet: false });
    const eveningCalls = schedule.mock.calls.filter(([arg]) =>
      arg.identifier?.startsWith("focus-loop-evening-"),
    );
    expect(eveningCalls).toHaveLength(0);
  });

  it("is a silent no-op when permission is denied (J5 failure mode)", async () => {
    perms.mockResolvedValueOnce({ status: PermissionStatus.DENIED } as never);
    await syncReminderSchedules(PREFS, CONTEXT);
    expect(schedule).not.toHaveBeenCalled();
  });

  it("cancels stale identifiers and keeps wanted ones", async () => {
    const keep = reminderIdentifier("r-1", 1, 9, 0);
    getAll.mockResolvedValue([
      { identifier: keep },
      { identifier: "focus-loop-reminder-gone-d3" },
      { identifier: "focus-loop-evening-20260101" },
      { identifier: "focus-loop-step-alert" },
    ] as never);
    await syncReminderSchedules(PREFS, CONTEXT);
    const cancelled = cancel.mock.calls.map(([id]) => id);
    expect(cancelled).toContain("focus-loop-reminder-gone-d3");
    expect(cancelled).toContain("focus-loop-evening-20260101");
    // Wanted + step alerts are left alone.
    expect(cancelled).not.toContain(keep);
    expect(cancelled).not.toContain("focus-loop-step-alert");
    // And the kept id is not re-scheduled.
    const rescheduled = schedule.mock.calls.map(([arg]) => arg.identifier);
    expect(rescheduled).not.toContain(keep);
  });

  it("cancels the old time and schedules the new one on a time edit (S9-01)", async () => {
    // r-1 edited 9:00 → 9:30: the 9:00 identifiers are pending on device and
    // must be cancelled, the 9:30 ones scheduled fresh.
    const PREFS_EDITED: ReminderPrefs = {
      ...PREFS,
      reminders: [{ ...PREFS.reminders[0]!, minute: 30 }, PREFS.reminders[1]!],
    };
    getAll.mockResolvedValue(
      [1, 2, 3, 4, 5].map((d) => ({
        identifier: reminderIdentifier("r-1", d, 9, 0),
      })) as never,
    );
    await syncReminderSchedules(PREFS_EDITED, CONTEXT);
    const cancelled = cancel.mock.calls.map(([id]) => id);
    for (const d of [1, 2, 3, 4, 5]) {
      expect(cancelled).toContain(reminderIdentifier("r-1", d, 9, 0));
    }
    const scheduled = schedule.mock.calls.map(([arg]) => arg.identifier);
    for (const d of [1, 2, 3, 4, 5]) {
      expect(scheduled).toContain(reminderIdentifier("r-1", d, 9, 30));
    }
    const trigger = schedule.mock.calls[0]?.[0].trigger;
    expect(trigger).toEqual({ type: "weekly", weekday: 2, hour: 9, minute: 30 });
  });
});

describe("clearReminderSchedules", () => {
  it("removes reminder + evening ids but never step alerts (delete-all)", async () => {
    getAll.mockResolvedValue([
      { identifier: "focus-loop-reminder-r1-d2" },
      { identifier: "focus-loop-evening-20261003" },
      { identifier: "focus-loop-step-alert" },
      { identifier: "other-app-thing" },
    ] as never);
    await clearReminderSchedules();
    const cancelled = cancel.mock.calls.map(([id]) => id);
    expect(cancelled).toEqual(["focus-loop-reminder-r1-d2", "focus-loop-evening-20261003"]);
  });
});
