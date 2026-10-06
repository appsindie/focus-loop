// P22 tests: reminder cards (time + day chips + toggle + remove), the
// add-reminder row (J5-R1 cap at MAX_REMINDERS), and the evening-note card —
// every control is save-immediately (J10-R3), so assertions land on onChange.
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { Linking } from "react-native";
import * as Notifications from "expo-notifications";
import { PermissionStatus } from "expo-notifications";
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

// Permission nudge: reminder scheduling silently no-ops without the OS grant,
// so the screen surfaces a deep-link card whenever something is armed while
// denied, and fires the real OS prompt on an explicit enable while still
// undetermined.
describe("RemindersScreen notification permission", () => {
  type PermResponse = Awaited<ReturnType<typeof Notifications.getPermissionsAsync>>;
  const PERM = (status: PermissionStatus) => ({ status }) as PermResponse;
  const NUDGE = "Notifications are off — reminders won't fire.";
  const getPerms = jest.mocked(Notifications.getPermissionsAsync);
  const reqPerms = jest.mocked(Notifications.requestPermissionsAsync);
  let openSettings: jest.SpiedFunction<typeof Linking.openSettings>;

  beforeEach(() => {
    jest.clearAllMocks();
    getPerms.mockResolvedValue(PERM(PermissionStatus.UNDETERMINED));
    reqPerms.mockResolvedValue(PERM(PermissionStatus.GRANTED));
    openSettings = jest.spyOn(Linking, "openSettings").mockResolvedValue(true as never);
  });

  it("shows the nudge on mount when a reminder is armed but permission is denied", async () => {
    getPerms.mockResolvedValue(PERM(PermissionStatus.DENIED));
    const { findByText } = await renderScreen(); // PREFS.r-1 is enabled
    await findByText(NUDGE);
  });

  it("hides the nudge while denied when nothing is enabled", async () => {
    getPerms.mockResolvedValue(PERM(PermissionStatus.DENIED));
    const { queryByText } = await renderScreen({
      reminders: [{ id: "r-1", hour: 9, minute: 0, days: [1], enabled: false }],
      eveningNote: false,
    });
    await waitFor(() => expect(getPerms).toHaveBeenCalled());
    expect(queryByText(NUDGE)).toBeNull();
  });

  it("asks the OS on an explicit enable while undetermined — granted leaves no nudge", async () => {
    const { getByLabelText, queryByText } = await renderScreen({
      reminders: [{ id: "r-1", hour: 9, minute: 0, days: [1], enabled: false }],
      eveningNote: false,
    });
    await fireEvent(getByLabelText("9:00 reminder toggle"), "onValueChange", true);
    await waitFor(() => expect(reqPerms).toHaveBeenCalled());
    expect(queryByText(NUDGE)).toBeNull();
  });

  it("shows the nudge when the OS prompt comes back denied", async () => {
    reqPerms.mockResolvedValue(PERM(PermissionStatus.DENIED));
    const { getByLabelText, findByText } = await renderScreen({
      reminders: [{ id: "r-1", hour: 9, minute: 0, days: [1], enabled: false }],
      eveningNote: false,
    });
    await fireEvent(getByLabelText("9:00 reminder toggle"), "onValueChange", true);
    await findByText(NUDGE);
  });

  it("shows the nudge on toggle when permission is already denied (no OS re-ask)", async () => {
    getPerms.mockResolvedValue(PERM(PermissionStatus.DENIED));
    const { getByLabelText, findByText } = await renderScreen({
      reminders: [{ id: "r-1", hour: 9, minute: 0, days: [1], enabled: false }],
      eveningNote: false,
    });
    await fireEvent(getByLabelText("9:00 reminder toggle"), "onValueChange", true);
    await findByText(NUDGE);
    expect(reqPerms).not.toHaveBeenCalled();
  });

  it("deep-links to app settings from the nudge", async () => {
    getPerms.mockResolvedValue(PERM(PermissionStatus.DENIED));
    const { findByLabelText } = await renderScreen();
    await fireEvent.press(await findByLabelText("Open settings"));
    expect(openSettings).toHaveBeenCalled();
  });
});
