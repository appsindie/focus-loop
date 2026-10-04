// North-star event seam (CR-09): instrumentation ships in-slice even though the
// analytics SDK lands later — call sites never change when the backend is wired.
// Gate 0's economics re-check needs goal-day + ad-trigger counts from day one,
// so the event vocabulary is fixed here and the sink is pluggable.
export type FocusLoopEvent =
  | "focus_session_completed" // any logged focus, partial or full
  | "goal_day_met" // first session of a calendar day → day counts for the weekly goal
  | "loop_completed" // all focuses of a loop done (P12 reached)
  | "ad_trigger_shown" // an interstitial trigger point fired and cleared the grace window
  | "ad_trigger_suppressed" // a trigger point fired but was suppressed (new-user grace)
  | "session_recovered" // J9: a killed session was restored (any outcome)
  | "store_review_prompted" // J6-R6: the OS review sheet was requested (3rd qualified loop)
  | "paywall_shown" // J7: P14 opened (entry point recorded in props)
  | "plus_purchase_completed" // J7: a plan purchase settled (props: plan)
  | "plus_restore_completed"; // J7: a store restore re-granted Plus

export type EventProps = Record<string, string | number | boolean | null>;
export type EventSink = (name: FocusLoopEvent, props: EventProps) => void;

let sink: EventSink | null = null;

// The analytics SDK registers here when it lands (Plus slice / Phase 3 telemetry).
export function setEventSink(next: EventSink | null): void {
  sink = next;
}

export function trackEvent(name: FocusLoopEvent, props: EventProps = {}): void {
  if (__DEV__) {
    console.log(`[event] ${name}`, props);
  }
  sink?.(name, props);
}
