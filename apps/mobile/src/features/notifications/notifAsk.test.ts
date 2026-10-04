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

describe("P03 notification pre-prompt timing (J3-R3, CR-08)", () => {
  it("asks when it has never asked before", async () => {
    await expect(shouldAskForNotifications(new Date())).resolves.toBe(true);
  });

  it("never re-asks after Allow — the OS prompt already ran", async () => {
    const asked = new Date("2026-10-01T12:00:00Z");
    await markNotificationsAsked("allowed", asked);
    const later = new Date(asked.getTime() + 30 * 24 * 3600 * 1000);
    await expect(shouldAskForNotifications(later)).resolves.toBe(false);
  });

  it("stays quiet within 7 days of a Not-now answer", async () => {
    const asked = new Date("2026-10-01T12:00:00Z");
    await markNotificationsAsked("declined", asked);
    const within = new Date(asked.getTime() + NOTIF_REPROMPT_AFTER_MS - 60_000);
    await expect(shouldAskForNotifications(within)).resolves.toBe(false);
  });

  it("may resurface once the 7-day window has passed", async () => {
    const asked = new Date("2026-10-01T12:00:00Z");
    await markNotificationsAsked("declined", asked);
    const after = new Date(asked.getTime() + NOTIF_REPROMPT_AFTER_MS);
    await expect(shouldAskForNotifications(after)).resolves.toBe(true);
  });

  it("treats a legacy bare-timestamp payload as a declined ask", async () => {
    const asked = new Date("2026-10-01T12:00:00Z");
    await AsyncStorage.setItem("focus-loop/v1/notif-ask", asked.toISOString());
    const within = new Date(asked.getTime() + 24 * 3600 * 1000);
    await expect(shouldAskForNotifications(within)).resolves.toBe(false);
    const after = new Date(asked.getTime() + NOTIF_REPROMPT_AFTER_MS);
    await expect(shouldAskForNotifications(after)).resolves.toBe(true);
  });

  it("asks again if the stored payload is unreadable", async () => {
    await AsyncStorage.setItem("focus-loop/v1/notif-ask", "junk");
    await expect(shouldAskForNotifications(new Date())).resolves.toBe(true);
  });
});
