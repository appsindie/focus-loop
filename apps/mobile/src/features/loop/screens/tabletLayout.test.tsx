// T01–T06 (DESIGN.md §4): the tablet variants of the same screens — the
// layout hooks are mocked off globally in jest-setup; each test spies them on.
import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render } from "@testing-library/react-native";
import * as layout from "../../../shared/layout";
import { palette } from "../../../shared/theme";
import { HomeScreen } from "./HomeScreen";
import { WeekScreen } from "./WeekScreen";
import { FocusScreen } from "./FocusScreen";
import { SettingsScreen } from "../../settings/SettingsScreen";
import { DEFAULT_SETTINGS } from "../../settings/SettingsStore";
import { WeekProgress } from "../weeklyGoal";
import { FocusSession } from "../SessionLog";
import { LoopStep } from "../loopPlan";
import { ParkedThought } from "../parkedThoughts";

const TABLET_STEPS: LoopStep[] = [
  { kind: "focus", roundIndex: 1, durationSeconds: 1500 },
  { kind: "break", roundIndex: 1, durationSeconds: 300 },
  { kind: "focus", roundIndex: 2, durationSeconds: 1500 },
  { kind: "longBreak", roundIndex: 2, durationSeconds: 900 },
];

const WEEK: WeekProgress = {
  weekStartTimestamp: Date.now() - 6 * 86_400_000,
  days: [0, 1, 2, 3, 4, 5, 6].map((i) => ({
    dayTimestamp: Date.now() - (6 - i) * 86_400_000,
    focusedSeconds: i < 2 ? 1500 : 0,
    sessionCount: i < 2 ? 1 : 0,
    met: i < 2,
  })),
  goalDays: 4,
  daysMet: 2,
  goalMet: false,
};

const SESSIONS: FocusSession[] = [
  {
    id: "s1",
    loopId: "l1",
    roundIndex: 1,
    intention: "Draft the intro",
    outcome: "finished",
    startedAt: new Date().toISOString(),
    endedAt: new Date().toISOString(),
    plannedSeconds: 1500,
    focusedSeconds: 1500,
    partial: false,
  },
];

const PARKED: ParkedThought[] = [
  { id: "p1", text: "Book the dentist", createdAt: new Date().toISOString(), usedAt: null },
];

function asTablet() {
  const t = jest.spyOn(layout, "useIsTablet").mockReturnValue(true);
  const l = jest.spyOn(layout, "useIsLandscape").mockReturnValue(true);
  return () => {
    t.mockRestore();
    l.mockRestore();
  };
}

describe("HomeScreen (T01 tablet)", () => {
  function makeProps() {
    return {
      colors: palette.light,
      now: new Date(),
      plan: TABLET_STEPS,
      focusNumber: 1,
      totalFocus: 2,
      loopEndsAtMs: Date.now() + 4500_000,
      intention: "",
      onIntentionChange: jest.fn(),
      parked: PARKED[0]!,
      parkedThoughts: PARKED,
      onUseParkedThought: jest.fn(),
      week: WEEK,
      todayMinutes: 25,
      todayFocusCount: 1,
      isNewWeek: false,
      onStart: jest.fn(),
      onOpenSettings: jest.fn(),
      onOpenWeek: jest.fn(),
      bannerSlot: undefined,
    };
  }

  it("lays out the two columns — loop left, stats/parked right", async () => {
    const restore = asTablet();
    const { getByText } = await render(<HomeScreen {...makeProps()} />);
    // Right column: the canvas' stats block and the parked-thoughts panel.
    getByText("Today 1 focus · 25 min");
    getByText("This week 2 of 4 days");
    getByText("WAITING FROM LAST TIME");
    getByText("Book the dentist");
    // Left column: rest-of-loop schedule + Start.
    getByText("REST OF TODAY’S LOOP");
    getByText("Focus 1");
    getByText("Long break");
    restore();
  });

  it("phone keeps the single-column home (no schedule list)", async () => {
    const { queryByText } = await render(<HomeScreen {...makeProps()} />);
    expect(queryByText("REST OF TODAY’S LOOP")).toBeNull();
  });
});

describe("WeekScreen (T04 tablet)", () => {
  it("merges week card and history into one progress view", async () => {
    const restore = asTablet();
    const { getByText } = await render(
      <WeekScreen
        sessions={SESSIONS}
        week={WEEK}
        isPlus={false}
        now={new Date()}
        onBack={jest.fn()}
        onHistory={jest.fn()}
        onShare={jest.fn()}
        colors={palette.light}
      />,
    );
    // Left: week card. Right: the session list — no tab bar on tablet.
    getByText("Your progress");
    getByText("2 of 4 days");
    getByText(/Draft the intro/);
    restore();
  });
});

describe("FocusScreen (T02 tablet landscape)", () => {
  function makeProps() {
    return {
      colors: palette.light,
      displayMode: "numbers" as const,
      onDisplayModeChange: jest.fn(),
      showSeconds: true,
      focusNumber: 2,
      totalFocus: 4,
      intention: "Draft the intro",
      steps: TABLET_STEPS,
      currentIndex: 2,
      remainingSeconds: 630,
      durationSeconds: 1500,
      nextStep: TABLET_STEPS[1]!,
      paused: false,
      parkedThoughts: PARKED,
      elapsedSeconds: 870,
      onPause: jest.fn(),
      onResume: jest.fn(),
      onParkThought: jest.fn(),
      onEndEarlySave: jest.fn(),
      onEndEarlyDiscard: jest.fn(),
    };
  }

  it("splits the layout — time left, controls + parked panel right", async () => {
    const restore = asTablet();
    const { getByText } = await render(<FocusScreen {...makeProps()} />);
    getByText("PARKED");
    getByText("Book the dentist");
    getByText("Pause");
    getByText("Later, not now…");
    restore();
  });

  it("hides the parked panel when nothing is parked", async () => {
    const restore = asTablet();
    const { queryByText } = await render(<FocusScreen {...makeProps()} parkedThoughts={[]} />);
    expect(queryByText("PARKED")).toBeNull();
    restore();
  });
});

describe("SettingsScreen (T05 tablet)", () => {
  function makeProps() {
    return {
      colors: palette.light,
      settings: { ...DEFAULT_SETTINGS, displayMode: "disc" as const },
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
      remindersSummary: "Off",
      onExportData: jest.fn(),
      onDeleteAll: jest.fn(),
      allowTracking: null,
      shareDiagnostics: true,
      onSetShareDiagnostics: jest.fn(),
      onSetAllowTracking: jest.fn(),
      version: "1.0.0",
    };
  }

  it("master–detail: rail picks the section, detail pane swaps", async () => {
    const restore = asTablet();
    const { getByText, getByLabelText, queryByText } = await render(
      <SettingsScreen {...makeProps()} />,
    );
    // Default detail = Timer & display; Your data rows stay hidden in the rail.
    getByText("Show time as");
    expect(queryByText("Export sessions (CSV)")).toBeNull();
    await fireEvent.press(getByLabelText("Your data"));
    getByText("Export sessions (CSV)");
    getByText("Delete all data…");
    expect(queryByText("Show time as")).toBeNull();
    restore();
  });

  it("rail items for Themes and Reminders route to their screens", async () => {
    const restore = asTablet();
    const props = makeProps();
    const { getByLabelText } = await render(<SettingsScreen {...props} />);
    await fireEvent.press(getByLabelText("Themes & sounds"));
    await fireEvent.press(getByLabelText("Reminders"));
    expect(props.onOpenThemes).toHaveBeenCalled();
    expect(props.onOpenReminders).toHaveBeenCalled();
    restore();
  });
});

describe("Settings keepScreenOn (T05 row)", () => {
  it("writes the toggle immediately on both layouts", async () => {
    const props = {
      colors: palette.light,
      settings: { ...DEFAULT_SETTINGS, displayMode: "disc" as const },
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
      remindersSummary: "Off",
      onExportData: jest.fn(),
      onDeleteAll: jest.fn(),
      allowTracking: null,
      shareDiagnostics: true,
      onSetShareDiagnostics: jest.fn(),
      onSetAllowTracking: jest.fn(),
      version: "1.0.0",
    };
    // Phone hub: drill into the section holding the row.
    const { getByLabelText } = await render(<SettingsScreen {...props} />);
    await fireEvent.press(getByLabelText("Timer & display"));
    await fireEvent(getByLabelText("Toggle keep screen on during focus"), "onValueChange", false);
    expect(props.onChange).toHaveBeenCalledWith({ keepScreenOn: false });

    // Tablet master–detail: the row is in the preselected Timer detail pane.
    const restore = asTablet();
    const tabletProps = { ...props, onChange: jest.fn() };
    const second = await render(<SettingsScreen {...tabletProps} />);
    await fireEvent(
      second.getByLabelText("Toggle keep screen on during focus"),
      "onValueChange",
      false,
    );
    expect(tabletProps.onChange).toHaveBeenCalledWith({ keepScreenOn: false });
    restore();
  });
});
