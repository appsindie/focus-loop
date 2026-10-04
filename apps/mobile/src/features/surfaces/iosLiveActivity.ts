import { requireNativeModule } from "expo-modules-core";
import type { RunningStepSurface } from "./widgetData";

// iOS running-session surface (J4-R3 / P23): an ActivityKit Live Activity on
// the lock screen + Dynamic Island. Module.swift owns the ActivityKit calls;
// this file tracks which activity is live so a step or display-mode change
// ends the old one and requests a new one (attributes are immutable).
type LiveActivityModule = {
  areActivitiesEnabled(): boolean;
  startActivity(
    stepKind: string,
    displayMode: string,
    endsAtMs: number,
    remainingSeconds: number,
    paused: boolean,
  ): void;
  updateActivity(remainingSeconds: number, endsAtMs: number, paused: boolean): void;
  endActivity(): void;
};

function loadModule(): LiveActivityModule | null {
  try {
    return requireNativeModule<LiveActivityModule>("ReactNativeWidgetExtension");
  } catch {
    return null;
  }
}

let activeAttributes: { stepKind: string; displayMode: string } | null = null;

export function syncLiveSurface(state: RunningStepSurface | null): void {
  const mod = loadModule();
  try {
    if (mod == null || !mod.areActivitiesEnabled()) {
      activeAttributes = null;
      return;
    }
    if (state == null) {
      if (activeAttributes != null) {
        mod.endActivity();
        activeAttributes = null;
      }
      return;
    }
    const attributesChanged =
      activeAttributes == null ||
      activeAttributes.stepKind !== state.kind ||
      activeAttributes.displayMode !== state.displayMode;
    if (attributesChanged) {
      mod.endActivity();
      mod.startActivity(
        state.kind,
        state.displayMode,
        state.endsAtMs,
        state.remainingSeconds,
        state.paused,
      );
      activeAttributes = { stepKind: state.kind, displayMode: state.displayMode };
    } else {
      mod.updateActivity(state.remainingSeconds, state.endsAtMs, state.paused);
    }
  } catch {
    // Live Activities unavailable (Simulator / user disabled in Settings) —
    // the in-app surface still works; the spec treats surface loss as silent.
  }
}
