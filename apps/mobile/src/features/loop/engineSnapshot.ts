import AsyncStorage from "@react-native-async-storage/async-storage";
import { LoopSnapshot } from "./LoopEngine";
import { LoopStep } from "./loopPlan";

const KEY = "focus-loop/v1/engine-snapshot";

const SNAPSHOT_PHASES = new Set(["running", "paused", "step-done", "loop-done"]);

type Rec = Record<string, unknown>;

function isFocusRecord(value: unknown): boolean {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const r = value as Rec;
  return (
    typeof r["loopId"] === "string" &&
    typeof r["roundIndex"] === "number" &&
    typeof r["startedAt"] === "string" &&
    typeof r["endedAt"] === "string" &&
    typeof r["plannedSeconds"] === "number" &&
    typeof r["focusedSeconds"] === "number" &&
    typeof r["partial"] === "boolean" &&
    (r["intention"] === null || typeof r["intention"] === "string")
  );
}

function isLoopStep(value: unknown): value is LoopStep {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const s = value as Rec;
  return (
    (s["kind"] === "focus" || s["kind"] === "break" || s["kind"] === "longBreak") &&
    Number.isInteger(s["roundIndex"]) &&
    Number.isFinite(s["durationSeconds"]) &&
    (s["durationSeconds"] as number) > 0 &&
    (s["extension"] === undefined || typeof s["extension"] === "boolean")
  );
}

export function isLoopSnapshot(value: unknown): value is LoopSnapshot {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const s = value as Rec;
  return (
    typeof s["loopId"] === "string" &&
    Number.isInteger(s["stepIndex"]) &&
    (s["stepIndex"] as number) >= 0 &&
    typeof s["phase"] === "string" &&
    SNAPSHOT_PHASES.has(s["phase"]) &&
    Number.isFinite(s["stepStartedAtMs"]) &&
    Number.isFinite(s["pausedMs"]) &&
    (s["pausedAtMs"] === null || Number.isFinite(s["pausedAtMs"])) &&
    (s["intention"] === null || typeof s["intention"] === "string") &&
    (s["pendingFocusRecord"] === null || isFocusRecord(s["pendingFocusRecord"])) &&
    Array.isArray(s["plan"]) &&
    s["plan"].every(isLoopStep) &&
    (s["stepIndex"] as number) < s["plan"].length
  );
}

// J9: written after every engine transition (never on the tick — the payload only
// changes when state does) so a killed loop restores from wall-clock truth.
export async function saveEngineSnapshot(snapshot: LoopSnapshot | null): Promise<void> {
  if (snapshot === null) {
    await AsyncStorage.removeItem(KEY);
    return;
  }
  await AsyncStorage.setItem(KEY, JSON.stringify(snapshot));
}

export async function loadEngineSnapshot(): Promise<LoopSnapshot | null> {
  const raw = await AsyncStorage.getItem(KEY);
  if (raw === null) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isLoopSnapshot(parsed)) {
      // A corrupt snapshot must not resurrect phantom state — drop it.
      await AsyncStorage.removeItem(KEY);
      return null;
    }
    return parsed;
  } catch {
    await AsyncStorage.removeItem(KEY);
    return null;
  }
}

export async function clearEngineSnapshot(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
