// J4 deep links: widgets and Live Activity actions drive the app through
// focusloop:// URLs. `start` = R1 widget start (skip Home, begin a focus with
// the last-used rhythm); `pause` = Live Activity pause action.
export type FocusLoopIntent = "start" | "pause";

export function parseFocusLoopUrl(url: string | null | undefined): FocusLoopIntent | null {
  if (url == null) {
    return null;
  }
  const match = /^focusloop:\/\/\/?([a-z]+)/i.exec(url);
  const action = match?.[1]?.toLowerCase();
  if (action === "start" || action === "pause") {
    return action;
  }
  return null;
}
