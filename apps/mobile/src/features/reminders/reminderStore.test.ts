import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setLocaleForTests } from "../../i18n";
import {
  DEFAULT_REMINDER_PREFS,
  dayChipLetters,
  loadReminderPrefs,
  newReminderId,
  normalizeReminders,
  saveReminderPrefs,
} from "./reminderStore";

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe("reminderStore", () => {
  it("returns defaults when nothing is stored", async () => {
    await expect(loadReminderPrefs()).resolves.toEqual(DEFAULT_REMINDER_PREFS);
  });

  it("round-trips prefs", async () => {
    const prefs = {
      reminders: [{ id: "r-1", hour: 9, minute: 30, days: [1, 3, 5], enabled: true }],
      eveningNote: true,
    };
    await saveReminderPrefs(prefs);
    await expect(loadReminderPrefs()).resolves.toEqual(prefs);
  });

  it("degrades to defaults on corrupt JSON", async () => {
    await AsyncStorage.setItem("focus-loop/v1/reminders", "{oops");
    await expect(loadReminderPrefs()).resolves.toEqual(DEFAULT_REMINDER_PREFS);
  });
});

describe("normalizeReminders", () => {
  it("drops malformed rows and keeps valid ones", () => {
    const rows = normalizeReminders([
      { id: "ok", hour: 9, minute: 0, days: [1], enabled: true },
      { id: "bad-hour", hour: 25, minute: 0, days: [1], enabled: true },
      { id: "bad-days", hour: 9, minute: 0, days: [0, 8], enabled: true },
      "junk",
      { id: "x", hour: 9, minute: 0, days: "monday", enabled: true },
    ]);
    expect(rows).toEqual([{ id: "ok", hour: 9, minute: 0, days: [1], enabled: true }]);
  });

  it("dedupes and sorts weekday chips", () => {
    const rows = normalizeReminders([
      { id: "r", hour: 9, minute: 0, days: [5, 1, 1, 3], enabled: false },
    ]);
    expect(rows[0]?.days).toEqual([1, 3, 5]);
  });
});

describe("newReminderId", () => {
  it("generates distinct ids", () => {
    const a = newReminderId(new Date("2026-01-01T00:00:00Z"));
    const b = newReminderId(new Date("2026-01-01T00:00:00Z"));
    expect(a).not.toBe(b);
  });
});

describe("dayChipLetters (S10-03)", () => {
  afterEach(() => setLocaleForTests("en"));

  it("returns 7 weekday letters for English", () => {
    expect(dayChipLetters()).toHaveLength(7);
  });

  it("gives CLDR's own initials where they differ (es: X for Wednesday)", () => {
    setLocaleForTests("es");
    const letters = dayChipLetters();
    // es narrow: L M X J V S D — Tuesday≠Thursday was impossible via t("T").
    expect(letters).toEqual(["L", "M", "X", "J", "V", "S", "D"]);
  });

  it("uses CJK day numerals in zh-Hans", () => {
    setLocaleForTests("zh-Hans");
    expect(dayChipLetters()).toEqual(["一", "二", "三", "四", "五", "六", "日"]);
  });
});
