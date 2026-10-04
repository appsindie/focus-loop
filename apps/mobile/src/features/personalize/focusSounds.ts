import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";
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
let audioModeSet = false;

// CR-34: without this, focus sounds die the moment the user locks the phone
// — the normal use. The config plugin already ships UIBackgroundModes:audio
// (enableBackgroundPlayback defaults true); the mode flags are the runtime
// half. Android note for SIT: sustained background past ~3min needs lock
// screen controls (setActiveForLockScreen) — an OS limitation, noted in the
// test plan rather than fought here.
function ensureAudioMode(): void {
  if (audioModeSet) {
    return;
  }
  audioModeSet = true;
  try {
    void setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
    }).catch(() => {});
  } catch {
    // best-effort — module absent in jest/Expo Go
  }
}

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
    ensureAudioMode();
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
