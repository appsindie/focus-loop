import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";
import brownNoise from "../../../assets/sounds/brown-noise.wav";
import deepCalm from "../../../assets/sounds/deep-calm.wav";
import oceanWaves from "../../../assets/sounds/ocean-waves.wav";
import rainOnWindow from "../../../assets/sounds/rain-on-window.wav";
import whiteNoise from "../../../assets/sounds/white-noise.wav";

// J8-R3: the chosen focus sound loops underneath a running focus step.
// Playback is best-effort — Expo Go and jest have no native audio module, so
// every entry point swallows the missing-module error instead of taking the
// timer down with it. "silence" and unknown ids are a no-op player state.
const SOURCES: Record<string, number> = {
  "white-noise": whiteNoise,
  "brown-noise": brownNoise,
  "deep-calm": deepCalm,
  "rain-on-window": rainOnWindow,
  "ocean-waves": oceanWaves,
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
      shouldPlayInBackground: false,
    }).catch(() => {});
  } catch {
    // best-effort — module absent in jest/Expo Go
  }
}

// While a preview is playing, a session-sound start is deferred instead of
// playing underneath it — that layering is the "sounds stack up" bug.
let pendingFocusSound: string | null = null;

// Idempotent: restarting the same id resumes it; switching ids rebuilds.
// The controller calls this on every focus-running render.
export function startFocusSound(id: string): void {
  if (preview != null) {
    pendingFocusSound = id;
    return;
  }
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

// Picker preview: tapping an unlocked sound row plays a short sample so the
// user hears what they picked before the next focus session. Uses its own
// player — never touches `current` — except pausing a live session sound so
// the two don't double up; stopSoundPreview hands playback back explicitly.
// The hand-back restores by the state CAPTURED at preview start — resuming
// unconditionally (vc6 defect) un-paused a paused session's loop with no
// timer left to stop it, so the sound played forever.
const PREVIEW_MS = 4000;
let preview: { player: AudioPlayer; timer: ReturnType<typeof setTimeout> } | null = null;
let resumeSessionAfterPreview = false;

export function stopSoundPreview(): void {
  if (preview == null) {
    return;
  }
  clearTimeout(preview.timer);
  try {
    // pause() before remove(): even if the native release misbehaves, a
    // paused player cannot keep sounding.
    preview.player.pause();
    preview.player.remove();
  } catch {
    // best-effort
  }
  preview = null;
  // Explicit hand-back: start whatever the controller asked for during the
  // preview, else resume the session sound we paused — but only when it was
  // actually playing before the preview ducked it.
  if (pendingFocusSound != null) {
    const next = pendingFocusSound;
    pendingFocusSound = null;
    startFocusSound(next);
  } else if (resumeSessionAfterPreview && current != null) {
    try {
      current.player.play();
    } catch {
      // best-effort
    }
  }
  resumeSessionAfterPreview = false;
}

export function previewFocusSound(id: string): void {
  stopSoundPreview();
  const source = SOURCES[id];
  if (source == null) {
    return;
  }
  let player: AudioPlayer | null = null;
  try {
    ensureAudioMode();
    resumeSessionAfterPreview = current != null && current.player.playing === true;
    pauseFocusSound();
    player = createAudioPlayer(source);
    player.loop = true;
    player.play();
    preview = { player, timer: setTimeout(stopSoundPreview, PREVIEW_MS) };
    player = null; // ownership moved into `preview`
  } catch {
    // A created-but-never-started player must not orphan a native media
    // object; a stale resume flag must not survive into the next preview's
    // hand-back; and the session we paused still deserves its play() back.
    if (player != null) {
      try {
        player.pause();
        player.remove();
      } catch {
        // best-effort
      }
    }
    if (resumeSessionAfterPreview && current != null) {
      try {
        current.player.play();
      } catch {
        // best-effort
      }
    }
    resumeSessionAfterPreview = false;
    preview = null;
  }
}

export function stopFocusSound(): void {
  pendingFocusSound = null;
  try {
    current?.player.pause();
    current?.player.remove();
  } catch {
    // best-effort
  }
  current = null;
}
