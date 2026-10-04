import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { wipeStoredData } from "./deleteAllData";

const cancel = jest.mocked(Notifications.cancelScheduledNotificationAsync);
const getAll = jest.mocked(Notifications.getAllScheduledNotificationsAsync);

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
  getAll.mockResolvedValue([]);
});

describe("wipeStoredData (S9-02 ordering)", () => {
  it("resets in-memory mirrors BEFORE the schedule clear begins", async () => {
    const order: string[] = [];
    getAll.mockImplementationOnce(() => {
      order.push("clear-enqueued");
      return Promise.resolve([{ identifier: "focus-loop-reminder-r1-d2-h9m0" }] as never);
    });
    await wipeStoredData(() => order.push("reset"));
    expect(order[0]).toBe("reset");
  });

  it("cancels every pending reminder + evening note but not step alerts", async () => {
    getAll.mockResolvedValue([
      { identifier: "focus-loop-reminder-r1-d2-h9m0" },
      { identifier: "focus-loop-evening-20261004" },
      { identifier: "focus-loop-step-alert" },
    ] as never);
    await wipeStoredData(() => {});
    const cancelled = cancel.mock.calls.map(([id]) => id);
    expect(cancelled).toEqual(["focus-loop-reminder-r1-d2-h9m0", "focus-loop-evening-20261004"]);
  });

  it("removes every focus-loop/ storage key and rewrites defaults", async () => {
    await AsyncStorage.setItem("focus-loop/v1/reminders", "{}");
    await AsyncStorage.setItem("focus-loop/v1/sessions", "[]");
    await AsyncStorage.setItem("someone-else/key", "keep");
    await wipeStoredData(() => {});
    expect(await AsyncStorage.getItem("focus-loop/v1/sessions")).toBeNull();
    expect(await AsyncStorage.getItem("someone-else/key")).toBe("keep");
  });
});
