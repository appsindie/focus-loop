// P22 tests: reminder cards (time + day chips + toggle + remove), the
// add-reminder row (J5-R1 cap at MAX_REMINDERS), and the evening-note card —
// every control is save-immediately (J10-R3), so assertions land on onChange.
import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render } from "@testing-library/react-native";
import { palette } from "../../shared/theme";
import { RemindersScreen } from "./RemindersScreen";
import { DEFAULT_REMINDER_PREFS, MAX_REMINDERS, type ReminderPrefs } from "./reminderStore";

const PREFS: ReminderPrefs = {
  reminders: [
    { id: "r-1", hour: 9, minute: 0, days: [1, 2, 3, 4, 5], enabled: true },
    { id: "r-2", hour: 18, minute: 30, days: [6, 7], enabled: false },
  ],
  eveningNote: false,
};

async function renderScreen(prefs = PREFS) {
  const onChange = jest.fn();
  const screen = await render(
    <RemindersScreen colors={palette.light} prefs={prefs} onChange={onChange} onBack={jest.fn()} />,
  );
  return { ...screen, onChange };
}

describe("RemindersScreen (P22)", () => {
  it("lists each reminder with its time label", async () => {
    const { getByText } = await renderScreen();
    getByText("9:00");
    getByText("18:30");
  });

  it("toggles a reminder on via onChange without mutating others (J5-R1)", async () => {
    const { getByLabelText, onChange } = await renderScreen();
    await fireEvent(getByLabelText("18:30 reminder toggle"), "onValueChange", true);
    expect(onChange).toHaveBeenCalledWith({
      reminders: [PREFS.reminders[0], { ...PREFS.reminders[1], enabled: true }],
      eveningNote: false,
    });
  });

  it("removes a reminder", async () => {
    const { getByLabelText, onChange } = await renderScreen();
    await fireEvent.press(getByLabelText("Remove 9:00 reminder"));
    expect(onChange).toHaveBeenCalledWith({
      reminders: [PREFS.reminders[1]],
      eveningNote: false,
    });
  });

  it("appends a weekday-9am reminder via 'Add a reminder'", async () => {
    const { getByLabelText, onChange } = await renderScreen();
    await fireEvent.press(getByLabelText("Add a reminder"));
    const prefs = onChange.mock.calls[0]?.[0] as ReminderPrefs;
    expect(prefs.reminders).toHaveLength(3);
    const added = prefs.reminders[2];
    expect(added?.hour).toBe(9);
    expect(added?.days).toEqual([1, 2, 3, 4, 5]);
    expect(added?.enabled).toBe(true);
  });

  it("hides the add row at MAX_REMINDERS (cap)", async () => {
    const full: ReminderPrefs = {
      reminders: Array.from({ length: MAX_REMINDERS }, (_, i) => ({
        id: `r-${i}`,
        hour: 9,
        minute: 0,
        days: [1],
        enabled: true,
      })),
      eveningNote: false,
    };
    const { queryByLabelText } = await renderScreen(full);
    expect(queryByLabelText("Add a reminder")).toBeNull();
  });

  it("turns the evening note on — default OFF per J5-R2", async () => {
    const { getByLabelText, onChange } = await renderScreen();
    await fireEvent(getByLabelText("Evening goal-day note"), "onValueChange", true);
    expect(onChange).toHaveBeenCalledWith({
      reminders: PREFS.reminders,
      eveningNote: true,
    });
  });

  it("keeps the evening note reachable behind a ScrollView at cap (S9-03)", async () => {
    const prefs: ReminderPrefs = {
      reminders: Array.from({ length: MAX_REMINDERS }, (_, i) => ({
        id: `r-${i}`,
        hour: 9,
        minute: 0,
        days: [1],
        enabled: true,
      })),
      eveningNote: false,
    };
    const { getByTestId, getByLabelText } = await renderScreen(prefs);
    // The whole reminder list + evening card scroll — the toggle can never be
    // pushed off-screen by a long list.
    getByTestId("reminders-scroll");
    const toggle = getByLabelText("Evening goal-day note");
    await fireEvent(toggle, "onValueChange", true);
    expect(toggle).toBeTruthy();
  });

  it("still offers the add row on an empty default state", async () => {
    const { getByLabelText } = await renderScreen(DEFAULT_REMINDER_PREFS);
    getByLabelText("Add a reminder");
  });
});
