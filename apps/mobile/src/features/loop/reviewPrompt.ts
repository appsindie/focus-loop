import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from "expo-store-review";
import { FocusSession, sessionsInLoop } from "./SessionLog";

const REVIEW_PROMPT_KEY = "focus-loop/v1/review-prompt";
const PROMPT_AFTER_LOOPS = 3;

type ReviewPromptState = {
  // Loop ids that completed with at least one "Finished" outcome (J6-R6).
  qualifiedLoopIds: string[];
  prompted: boolean;
};

// Fresh object per load — callers push into qualifiedLoopIds and set prompted,
// so handing out a shared default would poison every later empty-store read.
function defaultState(): ReviewPromptState {
  return { qualifiedLoopIds: [], prompted: false };
}

async function loadState(): Promise<ReviewPromptState> {
  try {
    const raw = await AsyncStorage.getItem(REVIEW_PROMPT_KEY);
    if (raw == null) {
      return defaultState();
    }
    const parsed = JSON.parse(raw) as Partial<ReviewPromptState>;
    return {
      qualifiedLoopIds: Array.isArray(parsed.qualifiedLoopIds)
        ? parsed.qualifiedLoopIds.filter((id): id is string => typeof id === "string")
        : [],
      prompted: parsed.prompted === true,
    };
  } catch {
    return defaultState();
  }
}

export type ReviewRequester = () => Promise<boolean>;

const defaultRequester: ReviewRequester = async () => {
  if (!(await StoreReview.isAvailableAsync())) {
    return false;
  }
  await StoreReview.requestReview();
  return true;
};

// J6-R6: after the 3rd completed loop containing at least one "Finished"
// outcome, ask the OS store-review sheet once. Loops qualify on outcome data
// already settled at loop-done; the flag is persisted so it never re-fires.
export async function maybePromptStoreReview(
  completedLoopId: string,
  sessions: FocusSession[],
  requestReview: ReviewRequester = defaultRequester,
): Promise<boolean> {
  const state = await loadState();
  if (state.prompted || state.qualifiedLoopIds.includes(completedLoopId)) {
    return false;
  }
  const hasFinished = sessionsInLoop(sessions, completedLoopId).some(
    (s) => s.outcome === "finished",
  );
  if (!hasFinished) {
    return false;
  }
  state.qualifiedLoopIds.push(completedLoopId);
  if (state.qualifiedLoopIds.length < PROMPT_AFTER_LOOPS) {
    await AsyncStorage.setItem(REVIEW_PROMPT_KEY, JSON.stringify(state));
    return false;
  }
  // CR-22: spend the one-shot only when the request actually ran — an
  // unavailable sheet (isAvailableAsync false) leaves prompted=false so the
  // next qualified loop tries again.
  const requested = await requestReview();
  if (requested) {
    state.prompted = true;
  }
  await AsyncStorage.setItem(REVIEW_PROMPT_KEY, JSON.stringify(state));
  return requested;
}
