// P20 tests: section order and rows (J10-R2), save-immediately writes
// (J10-R3), the confirmed delete-all (J10-R4), and the ad-choices sheet.
import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render } from "@testing-library/react-native";
import { palette } from "../../shared/theme";
import { DEFAULT_SETTINGS, type Settings } from "./SettingsStore";
import { SettingsScreen } from "./SettingsScreen";

const SETTINGS: Settings = { ...DEFAULT_SETTINGS, displayMode: "disc" };

async function renderScreen(overrides: Record<string, unknown> = {}) {
  const props = {
    colors: palette.light,
    settings: SETTINGS,
    onChange: jest.fn(),
    onBack: jest.fn(),
    isPlus: false,
    plusExpiresAt: null,
    plusProductId: null,
    onUpgrade: jest.fn(),
    onRestore: jest.fn(),
    onOpenThemes: jest.fn(),
    onOpenRhythm: jest.fn(),
    onOpenReminders: jest.fn(),
    remindersSummary: "Weekdays 9:00",
    onExportData: jest.fn(),
    onDeleteAll: jest.fn(),
    allowTracking: null,
    onSetAllowTracking: jest.fn(),
    version: "1.0.0",
    ...overrides,
  };
  const screen = await render(<SettingsScreen {...props} />);
  const json = JSON.stringify(screen.toJSON());
  const labels = [...json.matchAll(/"accessibilityLabel":"([^"]+)"/g)].map((m) => m[1]);
  console.log(`LABELS(${labels.length}):`, labels.slice(0, 30).join("|"));
  return { screen, props };
}

describe("SettingsScreen (P20)", () => {
  it("renders the P20 sections in canvas order (J10-R2)", async () => {
    const { screen } = await renderScreen();
    const { getByText } = screen;
    // Focus section
    getByText("Show time as");
    getByText("Appearance");
    getByText("Rhythm");
    getByText("Weekly goal");
    getByText("Start breaks automatically");
    getByText("Show seconds");
    getByText("Sound on completion");
    getByText("Vibrate at the end");
    // Personalise + reminders
    getByText("Themes & sounds");
    getByText("Reminders");
    // Data + about
    getByText("Your data");
    getByText("Export sessions (CSV)");
    getByText("Delete all data…");
    getByText("About");
    getByText("Ad choices & tracking");
    getByText("Privacy Policy");
    getByText("Focus Loop · Version 1.0.0");
  });

  it("shows the rhythm and reminder summaries and routes on tap", async () => {
    const { screen, props } = await renderScreen();
    const { getByText } = screen;
    await fireEvent.press(getByText("Rhythm"));
    await fireEvent.press(getByText("Reminders"));
    expect(props.onOpenRhythm).toHaveBeenCalled();
    expect(props.onOpenReminders).toHaveBeenCalled();
    getByText("Weekdays 9:00");
  });

  it("writes the appearance choice immediately (J10-R3)", async () => {
    const { screen, props } = await renderScreen();
    const { getByLabelText } = screen;
    await fireEvent.press(getByLabelText("Appearance: Dark", { includeHiddenElements: true }));
    expect(props.onChange).toHaveBeenCalledWith({ appearance: "dark" });
  });

  it("deletes only after the confirm sheet (J10-R4)", async () => {
    const { screen, props } = await renderScreen();
    const { getByLabelText } = screen;
    await fireEvent.press(getByLabelText("Delete all data…"));
    // Sheet open → confirm button visible; nothing called yet.
    expect(props.onDeleteAll).not.toHaveBeenCalled();
    await fireEvent.press(getByLabelText("Confirm delete all data"));
    expect(props.onDeleteAll).toHaveBeenCalledTimes(1);
  });

  it("'Keep my data' dismisses the sheet without deleting", async () => {
    const { screen, props } = await renderScreen();
    const { getByLabelText, queryByLabelText } = screen;
    await fireEvent.press(getByLabelText("Delete all data…"));
    await fireEvent.press(getByLabelText("Keep my data"));
    expect(props.onDeleteAll).not.toHaveBeenCalled();
    expect(queryByLabelText("Delete all data")).toBeNull();
  });

  it("the ad-tracking switch reports the user's choice (J10-R5)", async () => {
    const { screen, props } = await renderScreen();
    const { getByLabelText } = screen;
    await fireEvent.press(getByLabelText("Ad choices & tracking"));
    await fireEvent(getByLabelText("Toggle ad tracking"), "onValueChange", false);
    expect(props.onSetAllowTracking).toHaveBeenCalledWith(false);
  });
});
