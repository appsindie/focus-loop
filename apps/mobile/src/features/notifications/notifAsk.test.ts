import AsyncStorage from "@react-native-async-storage/async-storage";
import { beforeEach, describe, expect, it } from "@jest/globals";
import {
  NOTIF_REPROMPT_AFTER_MS,
  markNotificationsAsked,
  shouldAskForNotifications,
} from "./notifAsk";

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe("P03 notification pre-prompt timing (J3-R3)", () => {
  it("asks when it has never asked before", async () => {
    await expect(shouldAskForNotifications(new Date())).resolves.toBe(true);
  });

  it("stays quiet within 7 days of a Not-now answer", async () => {
    const asked = new Date("2026-10-01T12:00:00Z");
    await markNotificationsAsked(asked);
    const within = new Date(asked.getTime() + NOTIF_REPROMPT_AFTER_MS - 60_000);
    await expect(shouldAskForNotifications(within)).resolves.toBe(false);
  });

  it("may resurface once the 7-day window has passed", async () => {
    const asked = new Date("2026-10-01T12:00:00Z");
    await markNotificationsAsked(asked);
    const after = new Date(asked.getTime() + NOTIF_REPROMPT_AFTER_MS);
    await expect(shouldAskForNotifications(after)).resolves.toBe(true);
  });

  it("asks again if the stored timestamp is unreadable", async () => {
    await AsyncStorage.setItem("focus-loop/v1/notif-ask", "junk");
    await expect(shouldAskForNotifications(new Date())).resolves.toBe(true);
  });
});
