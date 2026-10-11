// P20 tests: hub lists the sections, drill-in shows each section's rows,
// save-immediately writes (J10-R3), the confirmed delete-all (J10-R4), and
// the ad-choices sheet (J10-R5).
import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render } from "@testing-library/react-native";
import { Linking } from "react-native";
import { palette } from "../../shared/theme";
import { DEFAULT_SETTINGS, type Settings } from "./SettingsStore";
import { SettingsScreen } from "./SettingsScreen";
import { CONTACT_URL, STUDIO_URL } from "./about";

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
    shareDiagnostics: true,
    onSetShareDiagnostics: jest.fn(),
    onSetAllowTracking: jest.fn(),
    version: "1.0.0",
    ...overrides,
  };
  const screen = await render(<SettingsScreen {...props} />);
  return { screen, props };
}

// Phone layout is hub-and-detail: tap a section row first, then assert.
async function drill(screen: Awaited<ReturnType<typeof render>>, sectionLabel: string) {
  await fireEvent.press(screen.getByLabelText(sectionLabel));
}

describe("SettingsScreen (P20)", () => {
  it("hub lists every section and drills in and back (J10-R2)", async () => {
    const { screen } = await renderScreen();
    const { getByText, getByLabelText, queryByText } = screen;
    getByText("Timer & display");
    getByText("Themes & sounds");
    getByText("Reminders");
    getByText("Focus Loop Plus");
    getByText("Your data");
    getByText("About & legal");
    getByText("Focus Loop · Version 1.0.0");
    expect(queryByText("Show time as")).toBeNull();

    await drill(screen, "Timer & display");
    getByText("Show time as");
    getByText("Appearance");
    getByText("Rhythm");
    getByText("Weekly goal");
    getByText("Start breaks automatically");
    getByText("Show seconds");
    getByText("Sound on completion");
    getByText("Vibrate at the end");

    await fireEvent.press(getByLabelText("Back to settings"));
    getByText("About & legal");

    await drill(screen, "Your data");
    getByText("Export sessions (CSV)");
    getByText("Delete all data…");

    await fireEvent.press(getByLabelText("Back to settings"));
    await drill(screen, "About & legal");
    getByText("Ad choices & tracking");
    getByText("Privacy Policy");
  });

  it("shows the rhythm and reminder summaries and routes on tap", async () => {
    const { screen, props } = await renderScreen();
    const { getByText, getByLabelText } = screen;
    getByText("Weekdays 9:00");
    await fireEvent.press(getByLabelText("Reminders"));
    expect(props.onOpenReminders).toHaveBeenCalled();
    await drill(screen, "Timer & display");
    await fireEvent.press(getByText("Rhythm"));
    expect(props.onOpenRhythm).toHaveBeenCalled();
  });

  it("routes Themes & sounds to its own screen", async () => {
    const { screen, props } = await renderScreen();
    await fireEvent.press(screen.getByLabelText("Themes & sounds"));
    expect(props.onOpenThemes).toHaveBeenCalled();
  });

  it("writes the appearance choice immediately (J10-R3)", async () => {
    const { screen, props } = await renderScreen();
    const { getByLabelText } = screen;
    await drill(screen, "Timer & display");
    await fireEvent.press(getByLabelText("Appearance: Dark", { includeHiddenElements: true }));
    expect(props.onChange).toHaveBeenCalledWith({ appearance: "dark" });
  });

  it("deletes only after the confirm sheet (J10-R4)", async () => {
    const { screen, props } = await renderScreen();
    const { getByLabelText } = screen;
    await drill(screen, "Your data");
    await fireEvent.press(getByLabelText("Delete all data…"));
    // Sheet open → confirm button visible; nothing called yet.
    expect(props.onDeleteAll).not.toHaveBeenCalled();
    await fireEvent.press(getByLabelText("Confirm delete all data"));
    expect(props.onDeleteAll).toHaveBeenCalledTimes(1);
  });

  it("'Keep my data' dismisses the sheet without deleting", async () => {
    const { screen, props } = await renderScreen();
    const { getByLabelText, queryByLabelText } = screen;
    await drill(screen, "Your data");
    await fireEvent.press(getByLabelText("Delete all data…"));
    await fireEvent.press(getByLabelText("Keep my data"));
    expect(props.onDeleteAll).not.toHaveBeenCalled();
    expect(queryByLabelText("Delete all data")).toBeNull();
  });

  it("the ad-tracking switch reports the user's choice (J10-R5)", async () => {
    const { screen, props } = await renderScreen();
    const { getByLabelText } = screen;
    await drill(screen, "About & legal");
    await fireEvent.press(getByLabelText("Ad choices & tracking"));
    await fireEvent(getByLabelText("Toggle ad tracking"), "onValueChange", false);
    expect(props.onSetAllowTracking).toHaveBeenCalledWith(false);
  });

  it("contact goes through the OS intent router, not the in-app browser", async () => {
    // vc6 defect: mailto routed through WebBrowser was a dead tap on every
    // device. Legal https links still open the in-app browser.
    const openURL = jest.spyOn(Linking, "openURL").mockResolvedValue(true);
    const { screen } = await renderScreen();
    await drill(screen, "About & legal");
    await fireEvent.press(screen.getByLabelText("Contact & feedback"));
    expect(openURL).toHaveBeenCalledWith(CONTACT_URL);
    openURL.mockRestore();
  });

  it("shows the contact fallback sheet when no mail app takes the intent", async () => {
    const openURL = jest.spyOn(Linking, "openURL").mockRejectedValue(new Error("no handler"));
    const { screen } = await renderScreen();
    await drill(screen, "About & legal");
    await fireEvent.press(screen.getByLabelText("Contact & feedback"));
    // The rejected open resolves the fallback sheet with the address and a
    // way out to the studio site.
    await screen.findByLabelText("Visit appsindie.com");
    await fireEvent.press(screen.getByLabelText("Close"));
    expect(screen.queryByLabelText("Visit appsindie.com")).toBeNull();
    openURL.mockRestore();
  });

  it("routes the studio link through the OS intent router, not the in-app browser", async () => {
    // iOS sim E2E: an in-app browser presented over a mid-dismissal Sheet
    // wedges the app behind an invisible presentation layer (repro'd even
    // when deferred via InteractionManager). The external intent sidesteps
    // the presentation race; the sheet stays under it as the copy path.
    // mailto has no handler → sheet; https intents route through too.
    const openURL = jest
      .spyOn(Linking, "openURL")
      .mockRejectedValueOnce(new Error("no handler"))
      .mockResolvedValue(true);
    const { screen } = await renderScreen();
    await drill(screen, "About & legal");
    await fireEvent.press(screen.getByLabelText("Contact & feedback"));
    await screen.findByLabelText("Visit appsindie.com");
    openURL.mockClear();
    await fireEvent.press(screen.getByLabelText("Visit appsindie.com"));
    expect(openURL).toHaveBeenCalledWith(STUDIO_URL);
    openURL.mockRestore();
  });
});
