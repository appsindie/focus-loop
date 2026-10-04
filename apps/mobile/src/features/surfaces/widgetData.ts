import AsyncStorage from "@react-native-async-storage/async-storage";
import { t } from "../../i18n";
import type { DisplayMode } from "../settings/SettingsStore";
import type { LoopStepKind } from "../loop/loopPlan";

// J4/P24 widget surface data: what home/lock-screen widgets render. Written by
// the app (AsyncStorage for the Android headless widget task, App Group
// UserDefaults for the iOS WidgetKit extension) — keep the schema in step with
// the Swift decoder in targets/widgets/FocusLoopWidgets.swift.
export type RunningStepSurface = {
  kind: LoopStepKind;
  displayMode: DisplayMode;
  remainingSeconds: number;
  // Wall-clock end of the current step, epoch ms. 0 while paused (there is no
  // end to count to while the clock is stopped).
  endsAtMs: number;
  paused: boolean;
  currentFocusNumber: number;
  totalFocusCount: number;
};

export type WidgetSnapshot = {
  schemaVersion: 1;
  weekDaysMet: number;
  weekGoalDays: number;
  nextParkedText: string | null;
  // R1: the widget starts a session with the last-used duration — the rhythm's
  // focus step length in minutes (Classic → 25).
  focusMinutes: number;
  running: RunningStepSurface | null;
  // Localized templates for the native iOS widget extension — Swift cannot
  // call t() and has no string catalog in managed workflow, so the app pipes
  // pre-localized {placeholder} templates through the App Group snapshot.
  strings?: Record<string, string>;
};

export const WIDGET_DATA_KEY = "focus-loop/v1/widget-data";

export const DEFAULT_WIDGET_SNAPSHOT: WidgetSnapshot = {
  schemaVersion: 1,
  weekDaysMet: 0,
  weekGoalDays: 4,
  nextParkedText: null,
  focusMinutes: 25,
  running: null,
};

export function buildWidgetSnapshot(input: {
  weekDaysMet: number;
  weekGoalDays: number;
  nextParkedText: string | null;
  focusMinutes: number;
  running: RunningStepSurface | null;
  strings?: Record<string, string>;
}): WidgetSnapshot {
  return { schemaVersion: 1, ...input };
}

// The full template set the iOS widget extension + Live Activity resolve.
// Android widgets and the ongoing notification call t() at render instead.
export function widgetSurfaceStrings(): Record<string, string> {
  return {
    focusCounter: t("Focus {n} of {total}"),
    breakLabel: t("Break"),
    pausedLabel: t("Paused"),
    minLeft: t("{minutes} min left"),
    focusStart: t("Focus {minutes}"),
    tapToStart: t("Tap to start"),
    daysThisWeek: t("{daysMet} of {goalDays} days this week"),
    focusingNow: t("Focusing now"),
    onABreak: t("On a break"),
    nextUp: t("Next up: {text}"),
    nextUpFocus: t("Next up: Focus {minutes}"),
    startLabel: t("Start"),
    focusLabel: t("Focus"),
    focusingLabel: t("Focusing"),
    pauseLabel: t("Pause"),
    doneLabel: t("Done"),
  };
}

// CR-19: a running state only counts while endsAt is still ahead of render
// time — paused stays live (no wall-clock end), an expired countdown renders
// as idle. Mirror of liveRunning() in FocusLoopWidgets.swift.
export function liveRunning(
  snapshot: WidgetSnapshot,
  nowMs: number = Date.now(),
): RunningStepSurface | null {
  const running = snapshot.running;
  if (running == null) {
    return null;
  }
  if (running.paused) {
    return running;
  }
  return running.endsAtMs > nowMs ? running : null;
}

// CR-21: Android widgets never re-render at endsAt (updatePeriodMillis 0, no
// scheduled refresh API in managed workflow), so a countdown label ages wrong
// the minute it renders. Rendering the deadline itself keeps a stale tile
// informative — "Focusing until 14:30" is still true minutes later.
export function formatEndTime(endsAtMs: number): string {
  return new Date(endsAtMs).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Read side for the Android headless widget task — tolerates a missing or
// corrupt value by falling back to defaults (a widget that renders zeros beats
// a widget that crashes headless).
export async function loadWidgetSnapshot(): Promise<WidgetSnapshot> {
  const raw = await AsyncStorage.getItem(WIDGET_DATA_KEY);
  if (raw == null) {
    return DEFAULT_WIDGET_SNAPSHOT;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<WidgetSnapshot>;
    if (
      typeof parsed.weekDaysMet !== "number" ||
      typeof parsed.weekGoalDays !== "number" ||
      typeof parsed.focusMinutes !== "number"
    ) {
      return DEFAULT_WIDGET_SNAPSHOT;
    }
    return {
      schemaVersion: 1,
      weekDaysMet: parsed.weekDaysMet,
      weekGoalDays: parsed.weekGoalDays,
      nextParkedText: typeof parsed.nextParkedText === "string" ? parsed.nextParkedText : null,
      focusMinutes: parsed.focusMinutes,
      running: parsed.running ?? null,
      ...(parsed.strings != null && typeof parsed.strings === "object"
        ? { strings: parsed.strings }
        : {}),
    };
  } catch {
    return DEFAULT_WIDGET_SNAPSHOT;
  }
}
