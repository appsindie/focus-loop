import * as Notifications from "expo-notifications";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import {
  cancelStepAlert,
  clearStepAlertsAtBoot,
  requestNotificationPermissions,
  STEP_ALERT_IDENTIFIER,
  syncStepAlert,
} from "./NotificationScheduler";

const getPermissions = jest.mocked(Notifications.getPermissionsAsync);
const schedule = jest.mocked(Notifications.scheduleNotificationAsync);
const cancelOne = jest.mocked(Notifications.cancelScheduledNotificationAsync);
const getAll = jest.mocked(Notifications.getAllScheduledNotificationsAsync);

const granted = { status: "granted" } as unknown as Awaited<
  ReturnType<typeof Notifications.getPermissionsAsync>
>;

beforeEach(async () => {
  jest.clearAllMocks();
  getPermissions.mockResolvedValue({ status: 0 } as never);
  getAll.mockResolvedValue([]);
  await clearStepAlertsAtBoot(); // drains the queue + resets the module's slot
});

describe("step alerts (P23)", () => {
  it("schedules nothing while permission is not granted", async () => {
    await syncStepAlert("focus-end", 300, true);
    expect(schedule).not.toHaveBeenCalled();
  });

  it("schedules 'Break time' at a focus step's remaining seconds when granted", async () => {
    getPermissions.mockResolvedValue(granted);
    await syncStepAlert("focus-end", 300, true);
    expect(schedule).toHaveBeenCalledTimes(1);
    expect(schedule).toHaveBeenCalledWith({
      identifier: STEP_ALERT_IDENTIFIER,
      content: { title: "Break time", body: expect.any(String), sound: true },
      trigger: { type: "timeInterval", seconds: 300 },
    });
  });

  it("schedules 'Back to it' for a break step and honours the sound flag", async () => {
    getPermissions.mockResolvedValue(granted);
    await syncStepAlert("break-end", 120, false);
    expect(schedule).toHaveBeenCalledWith({
      identifier: STEP_ALERT_IDENTIFIER,
      content: { title: "Back to it", body: expect.any(String), sound: false },
      trigger: { type: "timeInterval", seconds: 120 },
    });
  });

  it("keeps a single pending alert — a resync cancels the previous one", async () => {
    getPermissions.mockResolvedValue(granted);
    await syncStepAlert("focus-end", 300, true);
    await syncStepAlert("break-end", 120, true);
    expect(cancelOne).toHaveBeenCalledWith("mock-notification-id");
    expect(schedule).toHaveBeenCalledTimes(2);
  });

  it("a null kind cancels the pending alert without scheduling", async () => {
    getPermissions.mockResolvedValue(granted);
    await syncStepAlert("focus-end", 300, true);
    await syncStepAlert(null, 0, true);
    expect(cancelOne).toHaveBeenCalledTimes(1);
    expect(schedule).toHaveBeenCalledTimes(1);
  });

  it("a non-positive duration schedules nothing", async () => {
    getPermissions.mockResolvedValue(granted);
    await syncStepAlert("focus-end", 0, true);
    await syncStepAlert("focus-end", -5, true);
    expect(schedule).not.toHaveBeenCalled();
  });

  it("cancelStepAlert after cancel is a no-op", async () => {
    getPermissions.mockResolvedValue(granted);
    await cancelStepAlert();
    expect(cancelOne).not.toHaveBeenCalled();
  });

  // CR-12: overlapping fire-and-forget calls must serialise — a cancel racing a
  // half-done sync used to read a null slot and orphan the scheduled request.
  it("an overlapping sync-then-cancel leaves nothing scheduled", async () => {
    getPermissions.mockResolvedValue(granted);
    const pending = syncStepAlert("focus-end", 300, true);
    const cancel = cancelStepAlert();
    await Promise.all([pending, cancel]);
    expect(schedule).toHaveBeenCalledTimes(1);
    expect(cancelOne).toHaveBeenCalledWith("mock-notification-id");
  });

  it("overlapping syncs leave exactly one pending alert", async () => {
    getPermissions.mockResolvedValue(granted);
    const first = syncStepAlert("focus-end", 300, true);
    const second = syncStepAlert("break-end", 120, true);
    await Promise.all([first, second]);
    expect(schedule).toHaveBeenCalledTimes(2);
    // First alert was cancelled by the second sync — exactly one stays pending.
    expect(cancelOne).toHaveBeenCalledTimes(1);
    expect(schedule).toHaveBeenLastCalledWith({
      identifier: STEP_ALERT_IDENTIFIER,
      content: { title: "Back to it", body: expect.any(String), sound: true },
      trigger: { type: "timeInterval", seconds: 120 },
    });
  });

  it("boot cancels only step-alert requests — other identifiers survive", async () => {
    getAll.mockResolvedValue([
      { identifier: STEP_ALERT_IDENTIFIER },
      { identifier: "j5-weekly-reminder" },
    ] as never);
    await clearStepAlertsAtBoot();
    expect(cancelOne).toHaveBeenCalledTimes(1);
    expect(cancelOne).toHaveBeenCalledWith(STEP_ALERT_IDENTIFIER);
  });
});

describe("requestNotificationPermissions", () => {
  it("returns false when the OS keeps the permission undetermined", async () => {
    await expect(requestNotificationPermissions()).resolves.toBe(false);
  });

  it("short-circuits to true when already granted", async () => {
    getPermissions.mockResolvedValue(granted);
    await expect(requestNotificationPermissions()).resolves.toBe(true);
    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
  });
});
