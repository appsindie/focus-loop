import * as Notifications from "expo-notifications";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import {
  cancelStepAlert,
  clearStepAlertsAtBoot,
  requestNotificationPermissions,
  syncStepAlert,
} from "./NotificationScheduler";

const getPermissions = jest.mocked(Notifications.getPermissionsAsync);
const schedule = jest.mocked(Notifications.scheduleNotificationAsync);
const cancelOne = jest.mocked(Notifications.cancelScheduledNotificationAsync);
const cancelAll = jest.mocked(Notifications.cancelAllScheduledNotificationsAsync);

const granted = { status: "granted" } as unknown as Awaited<
  ReturnType<typeof Notifications.getPermissionsAsync>
>;

beforeEach(async () => {
  jest.clearAllMocks();
  getPermissions.mockResolvedValue({ status: 0 } as never);
  await clearStepAlertsAtBoot(); // also resets the module's single-slot id
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
      content: { title: "Break time", body: expect.any(String), sound: true },
      trigger: { type: "timeInterval", seconds: 300 },
    });
  });

  it("schedules 'Back to it' for a break step and honours the sound flag", async () => {
    getPermissions.mockResolvedValue(granted);
    await syncStepAlert("break-end", 120, false);
    expect(schedule).toHaveBeenCalledWith({
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

  it("boot clears the whole OS queue (pre-kill ids were lost)", async () => {
    await clearStepAlertsAtBoot();
    expect(cancelAll).toHaveBeenCalledTimes(2); // beforeEach + this call
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
