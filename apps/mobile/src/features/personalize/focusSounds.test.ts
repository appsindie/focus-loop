import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import {
  pauseFocusSound,
  previewFocusSound,
  startFocusSound,
  stopFocusSound,
  stopSoundPreview,
} from "./focusSounds";

const create = jest.mocked(createAudioPlayer);
const setMode = jest.mocked(setAudioModeAsync);

type FakePlayer = { play: jest.Mock; pause: jest.Mock; remove: jest.Mock; loop: boolean };
let lastPlayer: FakePlayer;

beforeEach(() => {
  stopFocusSound();
  create.mockReset().mockImplementation(() => {
    lastPlayer = { play: jest.fn(), pause: jest.fn(), remove: jest.fn(), loop: false };
    return lastPlayer as never;
  });
});

describe("focusSounds (J8)", () => {
  it("creates a looping player for a real sound id", () => {
    startFocusSound("white-noise");
    expect(create).toHaveBeenCalledTimes(1);
    expect(lastPlayer.loop).toBe(true);
    expect(lastPlayer.play).toHaveBeenCalledTimes(1);
    // CR-34: background/silent-mode audio flags are armed exactly once on the
    // first real sound (module state — asserting here keeps order honest).
    expect(setMode).toHaveBeenCalledTimes(1);
    expect(setMode).toHaveBeenCalledWith({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
    });
    startFocusSound("brown-noise");
    expect(setMode).toHaveBeenCalledTimes(1);
  });

  it("is a no-op for silence and unknown ids", () => {
    startFocusSound("silence");
    startFocusSound("gone");
    expect(create).not.toHaveBeenCalled();
  });

  it("resumes the same player on a repeated start of the same id", () => {
    startFocusSound("brown-noise");
    const player = lastPlayer;
    player.play.mockClear();
    startFocusSound("brown-noise");
    expect(create).toHaveBeenCalledTimes(1);
    expect(player.play).toHaveBeenCalledTimes(1);
  });

  it("releases the old player when the id changes", () => {
    startFocusSound("white-noise");
    const first = lastPlayer;
    startFocusSound("brown-noise");
    expect(first.remove).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledTimes(2);
  });

  it("pauses on a paused focus and releases on stop", () => {
    startFocusSound("white-noise");
    const player = lastPlayer;
    pauseFocusSound();
    expect(player.pause).toHaveBeenCalledTimes(1);
    stopFocusSound();
    expect(player.remove).toHaveBeenCalledTimes(1);
  });

  it("stays silent instead of crashing when the native module throws", () => {
    create.mockImplementationOnce(() => {
      throw new Error("no native module");
    });
    expect(() => startFocusSound("white-noise")).not.toThrow();
    expect(() => pauseFocusSound()).not.toThrow();
    expect(() => stopFocusSound()).not.toThrow();
  });
});

describe("previewFocusSound (picker tap-to-hear)", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    stopSoundPreview();
    jest.useRealTimers();
  });

  it("plays a sample that auto-stops after the preview window", () => {
    previewFocusSound("rain-on-window");
    expect(create).toHaveBeenCalledTimes(1);
    const player = lastPlayer;
    expect(player.loop).toBe(true);
    expect(player.play).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(4000);
    expect(player.remove).toHaveBeenCalledTimes(1);
  });

  it("silence stops a playing preview without starting a player", () => {
    previewFocusSound("white-noise");
    const player = lastPlayer;
    create.mockClear();
    previewFocusSound("silence");
    expect(create).not.toHaveBeenCalled();
    expect(player.remove).toHaveBeenCalledTimes(1);
  });

  it("pauses a live session sound so the two never double up", () => {
    startFocusSound("white-noise");
    const session = lastPlayer;
    previewFocusSound("brown-noise");
    expect(session.pause).toHaveBeenCalledTimes(1);
    expect(session.remove).not.toHaveBeenCalled();
  });

  it("defers a session-sound start issued mid-preview instead of layering", () => {
    previewFocusSound("white-noise");
    const previewPlayer = lastPlayer;
    create.mockClear();
    startFocusSound("brown-noise"); // controller re-render while preview runs
    expect(create).not.toHaveBeenCalled();
    stopSoundPreview();
    expect(create).toHaveBeenCalledTimes(1);
    expect(previewPlayer.remove).toHaveBeenCalledTimes(1);
  });

  it("resumes the paused session sound when the preview ends", () => {
    startFocusSound("white-noise");
    const session = lastPlayer;
    previewFocusSound("brown-noise");
    session.play.mockClear();
    stopSoundPreview();
    expect(session.play).toHaveBeenCalledTimes(1);
  });
});
