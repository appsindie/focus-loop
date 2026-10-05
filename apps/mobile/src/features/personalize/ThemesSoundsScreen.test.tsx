import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { createAudioPlayer } from "expo-audio";
import { palette } from "../../shared/theme";
import type { RewardedResult } from "../ads/rewardedAd";
import { ThemesSoundsScreen } from "./ThemesSoundsScreen";

const colors = palette.light;

type Props = Parameters<typeof ThemesSoundsScreen>[0];

function makeProps(overrides: Partial<Props> = {}): Props {
  return {
    colors,
    discColorId: "ember",
    focusSoundId: "silence",
    isPlus: false,
    isItemUnlocked: (id) =>
      id === "ember" || id === "silence" || id === "white-noise" || id === "brown-noise",
    trialEndsAt: () => null,
    onPick: jest.fn(),
    onUpgrade: jest.fn(),
    watchVideo: jest.fn(() => Promise.resolve<RewardedResult>("earned")),
    onTrialEarned: jest.fn(() => Promise.resolve()),
    onBack: jest.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ThemesSoundsScreen (J8 / P15)", () => {
  it("selects a free item immediately", async () => {
    const props = makeProps();
    const { getByLabelText } = await render(<ThemesSoundsScreen {...props} />);
    await fireEvent.press(getByLabelText("White noise"));
    expect(props.onPick).toHaveBeenCalledWith({ focusSoundId: "white-noise" });
  });

  it("plays a short preview when tapping an unlocked sound row (tap-to-hear)", async () => {
    const props = makeProps();
    const { getByLabelText } = await render(<ThemesSoundsScreen {...props} />);
    await fireEvent.press(getByLabelText("White noise"));
    expect(jest.mocked(createAudioPlayer)).toHaveBeenCalled();
  });

  it("does not preview a locked sound row", async () => {
    const props = makeProps();
    const { getByLabelText } = await render(<ThemesSoundsScreen {...props} />);
    await fireEvent.press(getByLabelText(/Rain on a window — locked/));
    expect(jest.mocked(createAudioPlayer)).not.toHaveBeenCalled();
    expect(props.onUpgrade).toHaveBeenCalled();
  });

  it("stops the playing preview when the screen unmounts", async () => {
    const props = makeProps();
    const { getByLabelText, unmount } = await render(<ThemesSoundsScreen {...props} />);
    await fireEvent.press(getByLabelText("White noise"));
    const player = jest.mocked(createAudioPlayer).mock.results[0]?.value as {
      remove: jest.Mock;
    };
    await act(async () => {
      await unmount();
    });
    expect(player.remove).toHaveBeenCalledTimes(1);
  });

  it("opens the 24h trial card for a locked trial-tier item (J8-R1/R2)", async () => {
    const props = makeProps();
    const { getByLabelText, getByText } = await render(<ThemesSoundsScreen {...props} />);
    await fireEvent.press(getByLabelText(/Ocean — locked/));
    expect(getByText("Try Ocean for 24 hours")).toBeTruthy();
    expect(getByText("Watch one short video. Or keep it forever with Plus.")).toBeTruthy();
  });

  it("earns the trial after the video completes — the item unlocks via onTrialEarned", async () => {
    const props = makeProps();
    const { getByLabelText, getByText } = await render(<ThemesSoundsScreen {...props} />);
    await fireEvent.press(getByLabelText(/Ocean — locked/));
    await fireEvent.press(getByText("Watch video"));
    await waitFor(() => expect(props.onTrialEarned).toHaveBeenCalledWith("ocean"));
    expect(props.watchVideo).toHaveBeenCalledTimes(1);
  });

  it("shows the retry copy when the ad cannot load (J8-R4)", async () => {
    const props = makeProps({
      watchVideo: jest.fn(() => Promise.resolve<RewardedResult>("load-failed")),
    });
    const { getByLabelText, getByText, queryByText } = await render(
      <ThemesSoundsScreen {...props} />,
    );
    await fireEvent.press(getByLabelText(/Ocean — locked/));
    await fireEvent.press(getByText("Watch video"));
    await waitFor(() => expect(getByText("Couldn't load the video. Try again")).toBeTruthy());
    expect(props.onTrialEarned).not.toHaveBeenCalled();
    expect(queryByText("Try again")).toBeTruthy();
  });

  it("does not grant a trial when the user closes the video early", async () => {
    const props = makeProps({
      watchVideo: jest.fn(() => Promise.resolve<RewardedResult>("closed")),
    });
    const { getByLabelText, getByText } = await render(<ThemesSoundsScreen {...props} />);
    await fireEvent.press(getByLabelText(/Ocean — locked/));
    await fireEvent.press(getByText("Watch video"));
    await waitFor(() => expect(props.watchVideo).toHaveBeenCalledTimes(1));
    expect(props.onTrialEarned).not.toHaveBeenCalled();
  });

  it("shows retry copy when the trial write fails after a watched ad (CR-33)", async () => {
    const props = makeProps({
      onTrialEarned: jest.fn(() => Promise.reject(new Error("storage gone"))),
    });
    const { getByLabelText, getByText } = await render(<ThemesSoundsScreen {...props} />);
    await fireEvent.press(getByLabelText(/Ocean — locked/));
    await fireEvent.press(getByText("Watch video"));
    // Never pretend the trial granted — same retry affordance as a load fail.
    await waitFor(() => expect(getByText("Couldn't load the video. Try again")).toBeTruthy());
    expect(props.onTrialEarned).toHaveBeenCalledWith("ocean");
  });

  it("sends Plus-only items straight to the paywall — no trial card (J8-R4)", async () => {
    const props = makeProps();
    const { getByLabelText, queryByText } = await render(<ThemesSoundsScreen {...props} />);
    await fireEvent.press(getByLabelText(/Rain on a window — locked/));
    expect(props.onUpgrade).toHaveBeenCalledTimes(1);
    expect(queryByText(/Try Rain on a window/)).toBeNull();
  });

  it("lets a live-trial item be picked until its expiry", async () => {
    const props = makeProps({
      isItemUnlocked: () => true,
      trialEndsAt: (id) => (id === "ocean" ? new Date("2026-10-04T10:00:00Z") : null),
    });
    const { getByLabelText } = await render(<ThemesSoundsScreen {...props} />);
    await fireEvent.press(getByLabelText("Ocean"));
    expect(props.onPick).toHaveBeenCalledWith({ discColorId: "ocean" });
  });

  it("marks the Plus badge on the Plus-only row", async () => {
    const props = makeProps();
    const { getByLabelText } = await render(<ThemesSoundsScreen {...props} />);
    expect(getByLabelText("Rain on a window — locked, Plus")).toBeTruthy();
  });
});
