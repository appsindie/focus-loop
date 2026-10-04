import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import { pauseFocusSound, startFocusSound, stopFocusSound } from "./focusSounds";

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
