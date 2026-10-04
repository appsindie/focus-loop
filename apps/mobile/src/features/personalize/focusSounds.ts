import { createAudioPlayer, type AudioPlayer } from "expo-audio";
import brownNoise from "../../assets/sounds/brown-noise.wav";
import rainOnWindow from "../../assets/sounds/rain-on-window.wav";
import whiteNoise from "../../assets/sounds/white-noise.wav";

// J8-R3: the chosen focus sound loops underneath a running focus step.
// Playback is best-effort — Expo Go and jest have no native audio module, so
// every entry point swallows the missing-module error instead of taking the
// timer down with it. "silence" and unknown ids are a no-op player state.
const SOURCES: Record<string, number> = {
  "white-noise": whiteNoise,
  "brown-noise": brownNoise,
  "rain-on-window": rainOnWindow,
};

let current: { id: string; player: AudioPlayer } | null = null;

// Idempotent: restarting the same id resumes it; switching ids rebuilds.
// The controller calls this on every focus-running render.
export function startFocusSound(id: string): void {
  if (current != null && current.id === id) {
    try {
      current.player.play();
    } catch {
      // best-effort
    }
    return;
  }
  stopFocusSound();
  const source = SOURCES[id];
  if (source == null) {
    return;
  }
  try {
    const player = createAudioPlayer(source);
    player.loop = true;
    player.play();
    current = { id, player };
  } catch {
    current = null;
  }
}

export function pauseFocusSound(): void {
  try {
    current?.player.pause();
  } catch {
    // best-effort
  }
}

export function stopFocusSound(): void {
  try {
    current?.player.remove();
  } catch {
    // best-effort
  }
  current = null;
}
