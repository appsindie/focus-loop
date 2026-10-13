// T01–T06 (DESIGN.md §4): the tablet variants of the same screens — the
// layout hooks are mocked off globally in jest-setup; each test spies them on.
import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen, within } from "@testing-library/react-native";
import { StyleSheet, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { SafeAreaProvider, type Metrics } from "react-native-safe-area-context";
import * as layout from "../../../shared/layout";
import { palette } from "../../../shared/theme";
import { SafeAreaView } from "../../../shared/ui/SafeAreaView";
import { HomeBanner } from "../../ads/HomeBanner";
import { HomeScreen } from "./HomeScreen";
import { WeekScreen } from "./WeekScreen";
import { FocusScreen } from "./FocusScreen";
import { BreakScreen } from "./BreakScreen";
import { SettingsScreen } from "../../settings/SettingsScreen";
import { DEFAULT_SETTINGS } from "../../settings/SettingsStore";
import { WeekProgress } from "../weeklyGoal";
import { FocusSession } from "../SessionLog";
import { LoopStep } from "../loopPlan";
import { ParkedThought } from "../parkedThoughts";

jest.mock("@appsindie/react-native-ads", () => ({
  Banner: () => null,
}));

jest.mock("../../ads/AdsProvider", () => ({
  useAdsConsent: () => ({
    adsReady: true,
    canRequestAds: true,
    privacyOptionsRequired: false,
    resolved: true,
    showPrivacyOptions: async () => {},
  }),
}));

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

const HOME_METRICS: Metrics = {
  insets: { top: 0, right: 0, bottom: 34, left: 0 },
  frame: { x: 0, y: 0, width: 1280, height: 800 },
};

const HOME_METRICS_WITHOUT_BOTTOM_INSET: Metrics = {
  ...HOME_METRICS,
  insets: { ...HOME_METRICS.insets, bottom: 0 },
};

function asTablet(isLandscape = true) {
  const t = jest.spyOn(layout, "useIsTablet").mockReturnValue(true);
  const l = jest.spyOn(layout, "useIsLandscape").mockReturnValue(isLandscape);
  return () => {
    t.mockRestore();
    l.mockRestore();
  };
}

function asPhone() {
  const t = jest.spyOn(layout, "useIsTablet").mockReturnValue(false);
  const l = jest.spyOn(layout, "useIsLandscape").mockReturnValue(false);
  return () => {
    t.mockRestore();
    l.mockRestore();
  };
}

async function layoutAt(testId: string, width: number, height: number) {
  await fireEvent(screen.getByTestId(testId), "layout", {
    nativeEvent: { layout: { x: 0, y: 0, width, height } },
  });
}

function discSize(): number {
  return screen.getByTestId("focus-disc").props["width"] as number;
}

function reservedHeightAt(testId: string, caption: RegExp | string): number {
  const area = screen.getByTestId(testId);
  const captionText = screen.getByText(caption);
  const gap = StyleSheet.flatten(area.props["style"] as StyleProp<ViewStyle>).gap;
  const lineHeight = StyleSheet.flatten(
    captionText.props["style"] as StyleProp<TextStyle>,
  ).lineHeight;
  return Number(gap ?? 0) + (lineHeight ?? 0);
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
    };
  }

  async function renderHomeWithBanner(
    props: ReturnType<typeof makeProps>,
    metrics: Metrics = HOME_METRICS,
  ) {
    return render(
      <SafeAreaProvider initialMetrics={metrics}>
        <>
          <HomeScreen {...props} />
          <SafeAreaView
            testID="home-banner-dock"
            edges={["bottom"]}
            style={{ backgroundColor: palette.light.bg }}
          >
            <HomeBanner
              entitlementLoaded={true}
              hasAdsRemoval={false}
              backgroundColor={palette.light.bg}
            />
          </SafeAreaView>
        </>
      </SafeAreaProvider>,
    );
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
    const restore = asPhone();
    const { getAllByTestId, getByTestId, queryByTestId, queryByText } =
      await renderHomeWithBanner(makeProps());
    expect(queryByText("REST OF TODAY’S LOOP")).toBeNull();
    expect(queryByTestId("home-main-scroll")).toBeNull();
    expect(queryByTestId("home-side-scroll")).toBeNull();
    expect(getAllByTestId("home-banner")).toHaveLength(1);
    expect(within(getByTestId("home-banner-dock")).getByTestId("home-banner")).toBeTruthy();
    restore();
  });

  it("keeps the portrait tablet banner below Home, outside its columns", async () => {
    const restore = asTablet(false);
    const { getAllByTestId, getByTestId } = await renderHomeWithBanner(makeProps());
    expect(getAllByTestId("home-banner")).toHaveLength(1);
    expect(within(getByTestId("home-side-column")).queryByTestId("home-banner")).toBeNull();
    expect(within(getByTestId("home-banner-dock")).getByTestId("home-banner")).toBeTruthy();
    restore();
  });

  it("pins the landscape banner below Home and leaves the bottom inset to its dock", async () => {
    const restore = asTablet(true);
    const { getAllByTestId, getByTestId, unmount } = await renderHomeWithBanner(makeProps());
    expect(getAllByTestId("home-banner")).toHaveLength(1);
    const root = getByTestId("home-root");
    const rootStyle = StyleSheet.flatten(root.props["style"] as StyleProp<ViewStyle>);
    const bannerDock = getByTestId("home-banner-dock");
    const bannerDockStyle = StyleSheet.flatten(bannerDock.props["style"] as StyleProp<ViewStyle>);
    expect(bannerDockStyle.paddingBottom).toBe(HOME_METRICS.insets.bottom);
    expect(within(root).queryByTestId("home-banner")).toBeNull();
    expect(within(getByTestId("home-side-column")).queryByTestId("home-banner")).toBeNull();
    expect(within(bannerDock).getByTestId("home-banner")).toBeTruthy();
    const paddingWithInset = Number(rootStyle.paddingBottom);
    await unmount();

    const withoutInset = await renderHomeWithBanner(makeProps(), HOME_METRICS_WITHOUT_BOTTOM_INSET);
    const rootStyleWithoutInset = StyleSheet.flatten(
      withoutInset.getByTestId("home-root").props["style"] as StyleProp<ViewStyle>,
    );
    expect(paddingWithInset - Number(rootStyleWithoutInset.paddingBottom)).toBe(0);
    restore();
  });

  it("scrolls landscape columns above a pinned Start button", async () => {
    const restore = asTablet(true);
    const { getByTestId } = await render(<HomeScreen {...makeProps()} />);
    const mainColumn = getByTestId("home-main-column");
    const mainScroll = within(mainColumn).getByTestId("home-main-scroll");
    expect(within(mainScroll).getByText("REST OF TODAY’S LOOP")).toBeTruthy();
    expect(within(mainColumn).getByLabelText("Start a 25-minute focus")).toBeTruthy();
    expect(within(mainScroll).queryByLabelText("Start a 25-minute focus")).toBeNull();

    const sideScroll = within(getByTestId("home-side-column")).getByTestId("home-side-scroll");
    expect(within(sideScroll).getByText("Today 1 focus · 25 min")).toBeTruthy();
    expect(within(sideScroll).getByText("Book the dentist")).toBeTruthy();
    restore();
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

  it("renders tablet landscape Numbers timer only in the left measured area", async () => {
    const restore = asTablet();
    await render(<FocusScreen {...makeProps()} />);
    expect(screen.getAllByText("10")).toHaveLength(1);
    restore();
  });

  it("sizes the portrait tablet disc to the measured area width", async () => {
    const restore = asTablet(false);
    await render(<FocusScreen {...makeProps()} displayMode="disc" />);
    expect(discSize()).toBe(280);
    await layoutAt("focus-time-area", 936, 1100);
    expect(discSize()).toBe(936);
    expect(discSize()).toBeGreaterThan(280);
    restore();
  });

  it("fits the split tablet disc below its caption", async () => {
    const restore = asTablet();
    await render(<FocusScreen {...makeProps()} displayMode="disc" />);
    expect(discSize()).toBe(280);
    await layoutAt("focus-split-left", 560, 504);
    const reserved = reservedHeightAt("focus-split-left", "about 11 min left");
    expect(discSize()).toBe(504 - reserved);
    restore();
  });

  it("keeps the phone disc capped at 280 in a large area", async () => {
    const restore = asPhone();
    await render(<FocusScreen {...makeProps()} displayMode="disc" />);
    await layoutAt("focus-time-area", 936, 1100);
    expect(discSize()).toBe(280);
    restore();
  });

  it("derives portrait tablet Numbers size from the measured area", async () => {
    const restore = asTablet(false);
    await render(<FocusScreen {...makeProps()} />);
    const initialMinutes = screen.getByText("10");
    expect(StyleSheet.flatten(initialMinutes.props["style"] as StyleProp<TextStyle>).fontSize).toBe(
      380,
    );
    await layoutAt("focus-time-area", 504, 1100);
    const minutes = screen.getByText("10");
    const minuteStyle = StyleSheet.flatten(minutes.props["style"] as StyleProp<TextStyle>);
    expect(minuteStyle.fontSize).toBe(Math.floor(Math.min(1100 * 0.6, 504 * 0.45)));
    expect(minutes.props["maxFontSizeMultiplier"]).toBe(1.3);
    expect(minutes.props["adjustsFontSizeToFit"]).toBe(true);
    expect(minutes.props["numberOfLines"]).toBe(1);
    restore();
  });

  it("fits split tablet Numbers within a 520 by 410 area", async () => {
    const restore = asTablet();
    await render(<FocusScreen {...makeProps()} />);
    await layoutAt("focus-split-left", 520, 410);
    const minutes = screen.getAllByText("10")[0]!;
    const minuteStyle = StyleSheet.flatten(minutes.props["style"] as StyleProp<TextStyle>);
    expect(minuteStyle.fontSize).toBe(Math.floor(Math.min(410 * 0.6, 520 * 0.45)));
    expect(minutes.props["adjustsFontSizeToFit"]).toBe(true);
    expect(minutes.props["numberOfLines"]).toBe(1);
    restore();
  });
});

describe("BreakScreen (T03 tablet)", () => {
  it("keeps the break background full-bleed around its centered content", async () => {
    const restore = asTablet();
    await render(
      <BreakScreen
        colors={palette.light}
        displayMode="disc"
        remainingSeconds={300}
        durationSeconds={300}
        nextFocusNumber={2}
        autoStart={false}
        onExtend={jest.fn()}
        onStartFocus={jest.fn()}
      />,
    );
    const root = screen.getByTestId("break-background");
    const content = screen.getByTestId("break-content");
    expect(StyleSheet.flatten(root.props["style"] as StyleProp<ViewStyle>).backgroundColor).toBe(
      palette.light.breakBg,
    );
    expect(
      StyleSheet.flatten(root.props["style"] as StyleProp<ViewStyle>).maxWidth,
    ).toBeUndefined();
    expect(StyleSheet.flatten(content.props["style"] as StyleProp<ViewStyle>).maxWidth).toBe(640);
    restore();
  });

  it("fits the tablet disc below the return-time caption", async () => {
    const restore = asTablet(false);
    await render(
      <BreakScreen
        colors={palette.light}
        displayMode="disc"
        remainingSeconds={300}
        durationSeconds={300}
        nextFocusNumber={2}
        autoStart={false}
        onExtend={jest.fn()}
        onStartFocus={jest.fn()}
      />,
    );
    expect(discSize()).toBe(220);
    await layoutAt("break-time-area", 900, 700);
    const reserved = reservedHeightAt("break-time-area", /^Back at /);
    expect(discSize()).toBe(700 - reserved);
    restore();
  });

  it("fits tablet Numbers within a 520 by 410 area", async () => {
    const restore = asTablet();
    await render(
      <BreakScreen
        colors={palette.light}
        displayMode="numbers"
        remainingSeconds={300}
        durationSeconds={300}
        nextFocusNumber={2}
        autoStart={false}
        onExtend={jest.fn()}
        onStartFocus={jest.fn()}
      />,
    );
    await layoutAt("break-time-area", 520, 410);
    const minutes = screen.getByText("5:00");
    const minuteStyle = StyleSheet.flatten(minutes.props["style"] as StyleProp<TextStyle>);
    expect(minuteStyle.fontSize).toBe(Math.floor(Math.min(410 * 0.5, 520 * 0.3)));
    expect(minutes.props["adjustsFontSizeToFit"]).toBe(true);
    expect(minutes.props["numberOfLines"]).toBe(1);
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
      privacyOptionsRequired: false,
      onShowPrivacyOptions: async () => {},
      shareDiagnostics: true,
      onSetShareDiagnostics: jest.fn(),
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
      privacyOptionsRequired: false,
      onShowPrivacyOptions: async () => {},
      shareDiagnostics: true,
      onSetShareDiagnostics: jest.fn(),
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
