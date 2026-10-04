// §5: the only two interstitial trigger points. Whether an ad actually shows
// (frequency, caps, new-user grace) is AdMob-server config (ADR-003) plus the
// client-side install-age grace — the broker in the ad slice consumes this.
export type InterstitialTrigger = "loop-done-leave" | "closeout-leave-second-focus";

export function isCloseoutTriggerPoint(
  completedFocusRounds: number,
  loopCompleted: boolean,
): boolean {
  return !loopCompleted && completedFocusRounds >= 2;
}
