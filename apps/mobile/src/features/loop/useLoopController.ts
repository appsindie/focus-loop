import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Share } from "react-native";
import { requestNotificationPermissions } from "../notifications/NotificationScheduler";
import { notifyInterstitialTrigger } from "../ads/adBroker";
import { markNotificationsAsked, shouldAskForNotifications } from "../notifications/notifAsk";
import { DisplayMode, Settings } from "../settings/SettingsStore";
import { EnginePhase, LoopEngine, LoopSnapshot } from "./LoopEngine";
import { buildLoopPlan } from "./loopPlan";
import {
  FocusSession,
  SessionOutcome,
  loadSessions,
  recordSession,
  sessionsOnDay,
  updateSessionOutcome,
} from "./SessionLog";
import {
  ParkedThought,
  addParkedThought,
  loadParkedThoughts,
  markThoughtUsed,
} from "./parkedThoughts";
import { resolveRhythm } from "./rhythm";
import { isCloseoutTriggerPoint } from "./triggers";
import { computeWeekProgress } from "./weeklyGoal";

export type LoopRoute =
  | "loading"
  | "first-launch"
  | "home"
  | "focus"
  | "closeout"
  | "break"
  | "loop-done"
  | "settings"
  | "history";

export type LoopController = ReturnType<typeof useLoopController>;

const EXTENSION_SECONDS = 10 * 60; // P10 "Keep going, 10 more minutes"

// J2-R4: the record is written BEFORE P10 shows; pendingFocusRecord is drained
// exactly once here, the single writer for engine-emitted records.
function useSessionWriter(engine: LoopEngine, onWritten: (session: FocusSession) => void) {
  const seenRef = useRef<string | null>(null);
  return useCallback(() => {
    const record = engine.completedFocusRecord;
    if (record == null || seenRef.current === `${record.loopId}:${record.startedAt}`) {
      return;
    }
    seenRef.current = `${record.loopId}:${record.startedAt}`;
    engine.clearFocusRecord();
    void recordSession({ ...record, outcome: null }).then(onWritten);
  }, [engine, onWritten]);
}

export function useLoopController(
  settings: Settings,
  settingsLoading: boolean,
  interstitial?: { show: () => void },
) {
  const [route, setRoute] = useState<LoopRoute>("loading");
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [parkedThoughts, setParkedThoughts] = useState<ParkedThought[]>([]);
  const [intentionDraft, setIntentionDraft] = useState("");
  const [outcomeDraft, setOutcomeDraft] = useState<SessionOutcome | null>(null);
  const [notifAskOpen, setNotifAskOpen] = useState(false);
  const [lastSession, setLastSession] = useState<FocusSession | null>(null);
  const [, bump] = useReducer((n: number) => n + 1, 0);

  const rhythm = resolveRhythm(settings.rhythmPresetId, settings.customRhythm);
  const engineRef = useRef<LoopEngine | null>(null);
  const routeRef = useRef<LoopRoute>("loading");
  const go = useCallback((next: LoopRoute) => {
    routeRef.current = next;
    setRoute(next);
  }, []);

  const engine = useMemo(() => {
    // A loop in flight keeps its own plan; a rhythm change builds the next engine.
    if (engineRef.current == null || engineRef.current.currentPhase === "idle") {
      engineRef.current = new LoopEngine(buildLoopPlan(rhythm), {
        autoStartBreaks: settings.autoStartBreaks,
      });
    }
    return engineRef.current;
  }, [rhythm, settings.autoStartBreaks]);

  // Settings pushed into the live engine so the P10 toggle takes effect at once.
  useEffect(() => {
    engine.setAutoStartBreaks(settings.autoStartBreaks);
  }, [engine, settings.autoStartBreaks]);

  const reloadData = useCallback(async () => {
    const [loadedSessions, loadedThoughts] = await Promise.all([
      loadSessions(),
      loadParkedThoughts(),
    ]);
    setSessions(loadedSessions);
    setParkedThoughts(loadedThoughts);
  }, []);

  // Boot: data in, first-launch decision out.
  useEffect(() => {
    if (settingsLoading) {
      return;
    }
    void reloadData().then(() => {
      go(settings.displayMode == null ? "first-launch" : "home");
    });
  }, [settingsLoading, settings.displayMode, reloadData, go]);

  const onSessionWritten = useCallback(
    (session: FocusSession) => {
      setLastSession(session);
      setOutcomeDraft(null);
      void reloadData();
    },
    [reloadData],
  );

  const drainRecord = useSessionWriter(engine, onSessionWritten);

  const haptic = useCallback(() => {
    if (settings.vibrationEnabled) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [settings.vibrationEnabled]);

  // Poll the engine; every terminal transition is handled here.
  useEffect(() => {
    const timer = setInterval(() => {
      const before = engine.currentPhase;
      const after = engine.tick();
      if (after === before && after !== "running" && after !== "paused") {
        return;
      }
      bump();
      const record = engine.completedFocusRecord;
      if (record != null && (after === "step-done" || after === "loop-done")) {
        // J2-R4: log written before the close-out is shown.
        drainRecord();
      }
      if (before !== after) {
        haptic();
      }
      if (after === "step-done") {
        const step = engine.currentStep;
        if (step?.kind === "focus") {
          go("closeout");
          // P03 + J3-R3: pre-prompt after a completed focus; "Not now" quiets it
          // for 7 days, then it may resurface on a later close-out.
          void shouldAskForNotifications().then((ask) => {
            if (ask) {
              setNotifAskOpen(true);
            }
          });
        } else if (step?.kind === "break" || step?.kind === "longBreak") {
          // Manual break end → offer the next focus; engine waits at step-done.
          go("break");
        }
      } else if (after === "loop-done") {
        go("loop-done");
      } else if (after === "finished") {
        go("home");
      } else if (after === "running") {
        // Covers auto-advance (break end → next focus) and +10-min extensions:
        // the screen follows whatever step is now counting down.
        const step = engine.currentStep;
        if (step?.kind === "focus" && routeRef.current !== "focus") {
          go("focus");
        } else if (step != null && step.kind !== "focus" && routeRef.current === "focus") {
          go("break");
        }
      }
    }, 500);
    return () => clearInterval(timer);
  }, [engine, go, drainRecord, haptic]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const chooseDisplayMode = useCallback(
    (mode: DisplayMode, save: (patch: Partial<Settings>) => Promise<void>) => {
      // P02: a tap saves the choice AND starts the first focus (J1-R2).
      void save({ displayMode: mode });
      engine.start(intentionDraft.trim() || null);
      go("focus");
    },
    [engine, intentionDraft, go],
  );

  const startFocus = useCallback(() => {
    engine.start(intentionDraft.trim() || null);
    go("focus");
  }, [engine, intentionDraft, go]);

  const startBreak = useCallback(() => {
    // Leaving P10 = the closeout interstitial trigger point (§5).
    if (isCloseoutTriggerPoint(engine.currentFocusNumber, false)) {
      notifyInterstitialTrigger(
        "closeout-leave-second-focus",
        settings.firstInstallAt,
        interstitial?.show,
      );
    }
    engine.advance();
    go("break");
  }, [engine, go, settings.firstInstallAt, interstitial]);

  const keepGoing = useCallback(() => {
    if (engine.extendFocus(EXTENSION_SECONDS)) {
      go("focus");
    } else {
      go("home");
    }
  }, [engine, go]);

  const startNextFocus = useCallback(() => {
    // Break still running → skip the rest; break already ended → step-done advance.
    if (engine.currentPhase === "step-done") {
      engine.advance();
    } else {
      engine.skipBreak();
    }
    go("focus");
  }, [engine, go]);

  const extendBreak = useCallback(() => {
    engine.extendBreak(5 * 60);
    bump();
  }, [engine]);

  const endEarlySave = useCallback(() => {
    const record = engine.endEarly();
    if (record != null) {
      engine.clearFocusRecord();
      void recordSession({ ...record, outcome: null }).then(onSessionWritten);
    }
    go("home");
  }, [engine, go, onSessionWritten]);

  const endEarlyDiscard = useCallback(() => {
    engine.discard();
    go("home");
  }, [engine, go]);

  // §5: leaving P12 is a trigger point only from the second loop on — the first
  // loop ever opens the paywall instead (P14 lands in the Plus slice, J7).
  const isLaterLoop = useMemo(
    () => sessions.some((s) => s.loopId !== engine.currentLoopId),
    [sessions, engine.currentLoopId],
  );

  const leaveLoopDone = useCallback(() => {
    if (isLaterLoop) {
      notifyInterstitialTrigger("loop-done-leave", settings.firstInstallAt, interstitial?.show);
    }
  }, [isLaterLoop, settings.firstInstallAt, interstitial]);

  const startLongBreak = useCallback(() => {
    leaveLoopDone();
    engine.advance();
    go("break");
  }, [leaveLoopDone, engine, go]);

  const skipLongBreak = useCallback(() => {
    leaveLoopDone();
    engine.discard();
    go("home");
  }, [leaveLoopDone, engine, go]);

  const parkThought = useCallback(
    async (text: string) => {
      await addParkedThought(text);
      await reloadData();
    },
    [reloadData],
  );

  const adoptParked = useCallback(
    async (thought: ParkedThought) => {
      setIntentionDraft(thought.text);
      await markThoughtUsed(thought.id);
      await reloadData();
    },
    [reloadData],
  );

  const shareWeek = useCallback(async () => {
    const now = new Date();
    const week = computeWeekProgress(sessions, now, settings.weeklyGoalDays);
    const minutes = Math.round(
      sessions
        .filter((s) => new Date(s.endedAt).getTime() >= week.weekStartTimestamp)
        .reduce((sum, s) => sum + s.focusedSeconds, 0) / 60,
    );
    await Share.share({
      message: `This week on Focus Loop: ${minutes} min of focus, ${week.daysMet} of ${week.goalDays} goal days.`,
    });
  }, [sessions, settings.weeklyGoalDays]);

  const setOutcome = useCallback(
    (outcome: SessionOutcome | null) => {
      setOutcomeDraft(outcome);
      if (lastSession != null) {
        void updateSessionOutcome(lastSession.id, outcome).then(reloadData);
      }
    },
    [lastSession, reloadData],
  );

  const answerNotifAsk = useCallback((allow: boolean) => {
    setNotifAskOpen(false);
    void markNotificationsAsked();
    if (allow) {
      void requestNotificationPermissions();
    }
  }, []);

  // ── Derived view state ───────────────────────────────────────────────────

  const now = new Date();
  const week = computeWeekProgress(sessions, now, settings.weeklyGoalDays);
  const todaySessions = sessionsOnDay(sessions, now);
  const todayMinutes = Math.round(todaySessions.reduce((sum, s) => sum + s.focusedSeconds, 0) / 60);
  const isNewWeek = week.daysMet === 0;
  const phase: EnginePhase = engine.currentPhase;
  const step = engine.currentStep;
  const steps = engine.planSteps;
  const nextStep = steps[engine.currentStepIndex + 1] ?? null;
  const loopEndsAtMs = Date.now() + steps.reduce((sum, s) => sum + s.durationSeconds, 0) * 1000;
  const sessionsInLoop = sessions.filter((s) => s.loopId === engine.currentLoopId);
  const longBreakSeconds = steps.find((s) => s.kind === "longBreak")?.durationSeconds ?? 900;

  return {
    route,
    go,
    phase,
    step,
    steps,
    nextStep,
    engine,
    sessions,
    sessionsInLoop,
    parkedThoughts,
    week,
    todayMinutes,
    isNewWeek,
    loopEndsAtMs,
    longBreakSeconds,
    intentionDraft,
    setIntentionDraft,
    outcomeDraft,
    setOutcome,
    notifAskOpen,
    answerNotifAsk,
    lastSession,
    chooseDisplayMode,
    startFocus,
    startBreak,
    keepGoing,
    startNextFocus,
    extendBreak,
    endEarlySave,
    endEarlyDiscard,
    startLongBreak,
    skipLongBreak,
    parkThought,
    adoptParked,
    shareWeek,
    restoreSnapshot: (snapshot: LoopSnapshot) => engine.restore(snapshot),
  };
}
