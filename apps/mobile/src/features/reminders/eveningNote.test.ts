import { describe, expect, it } from "@jest/globals";
import { eveningNoteDates, eveningNoteIdentifier } from "./eveningNote";
import { ReminderPrefs } from "./reminderStore";

const PREFS_ON: ReminderPrefs = {
  reminders: [{ id: "r-1", hour: 9, minute: 0, days: [1, 2, 3, 4, 5], enabled: true }],
  eveningNote: true,
};

describe("eveningNoteDates", () => {
  it("returns nothing when the toggle is off (J5-R2 default)", () => {
    const now = new Date(2026, 9, 3, 10, 0); // Oct 3 2026, 10:00 local
    expect(eveningNoteDates({ ...PREFS_ON, eveningNote: false }, false, now)).toEqual([]);
  });

  it("places today's 20:00 plus six more days when nothing focused yet", () => {
    const now = new Date(2026, 9, 3, 10, 0);
    const dates = eveningNoteDates(PREFS_ON, false, now);
    expect(dates).toHaveLength(7);
    expect(dates[0]?.getHours()).toBe(20);
    expect(dates[0]?.getMinutes()).toBe(0);
    expect(dates[0]?.getDate()).toBe(3);
    expect(dates[6]?.getDate()).toBe(9);
  });

  it("suppresses today's note once a focus is logged", () => {
    const now = new Date(2026, 9, 3, 10, 0);
    const dates = eveningNoteDates(PREFS_ON, true, now);
    expect(dates).toHaveLength(6);
    expect(dates[0]?.getDate()).toBe(4);
  });

  it("skips today once 20:00 has passed", () => {
    const now = new Date(2026, 9, 3, 21, 0);
    const dates = eveningNoteDates(PREFS_ON, false, now);
    expect(dates[0]?.getDate()).toBe(4);
  });
});

describe("eveningNoteIdentifier", () => {
  it("is deterministic and date-keyed", () => {
    const a = eveningNoteIdentifier(new Date(2026, 0, 5));
    const b = eveningNoteIdentifier(new Date(2026, 0, 5));
    expect(a).toBe(b);
    expect(a).toContain("20260105");
    expect(eveningNoteIdentifier(new Date(2026, 0, 6))).not.toBe(a);
  });
});
