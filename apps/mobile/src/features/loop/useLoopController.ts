import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Share } from "react-native";
import {
  cancelStepAlert,
  clearStepAlertsAtBoot,
  requestNotificationPermissions,
  syncStepAlert,
} from "../notifications/NotificationScheduler";
import { notifyInterstitialTrigger } from "../ads/adBroker";
import { markNotificationsAsked, shouldAskForNotifications } from "../notifications/notifAsk";
import { DisplayMode, Settings } from "../settings/SettingsStore";
import { EnginePhase, LoopEngine, LoopSnapshot } from "./LoopEngine";
import { buildLoopPlan, sameLoopPlan } from "./loopPlan";
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
  mostRecentUnused,
} from "./parkedThoughts";
import { resolveRhythm } from "./rhythm";
import { isCloseoutTriggerPoint } from "./triggers";
import { computeWeekProgress } from "./weeklyGoal";
import { loadEngineSnapshot, saveEngineSnapshot } from "./engineSnapshot";
import { trackEvent } from "../analytics/events";
import type { FocusLoopIntent } from "../../linking";
import { publishWidgetSnapshot } from "../surfaces/surfaceBridge";
import { syncLiveSurface } from "../surfaces/liveSurface";
import { buildWidgetSnapshot, type RunningStepSurface } from "../surfaces/widgetData";

export type LoopRoute =
  | "loading"
  | "first-launch"
  | "home"
  | "focus"
  | "closeout"
  | "break"
  | "loop-done"
  | "welcome-back"
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
  // J4-R1: a widget/Live-Activity deep link resolved before boot finished.
  // "pending" means the OS hasn't answered getInitialURL yet — boot waits.
  bootIntent: FocusLoopIntent | "pending" | null = null,
) {
  const [route, setRoute] = useState<LoopRoute>("loading");
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [parkedThoughts, setParkedThoughts] = useState<ParkedThought[]>([]);
  const [intentionDraft, setIntentionDraft] = useState("");
  const [outcomeDraft, setOutcomeDraft] = useState<SessionOutcome | null>(null);
  const [notifAskOpen, setNotifAskOpen] = useState(false);
  const [lastSession, setLastSession] = useState<FocusSession | null>(null);
  const [, bump] = useReducer((n: number) => n + 1, 0);

  const rhythm = useMemo(
    () => resolveRhythm(settings.rhythmPresetId, settings.customRhythm),
    [settings.rhythmPresetId, settings.customRhythm],
  );
  const plan = useMemo(() => buildLoopPlan(rhythm), [rhythm]);
  const routeRef = useRef<LoopRoute>("loading");
  const go = useCallback((next: LoopRoute) => {
    routeRef.current = next;
    setRoute(next);
  }, []);

  const [engine, setEngine] = useState(
    () => new LoopEngine(plan, { autoStartBreaks: settings.autoStartBreaks }),
  );

  // Latest settings for callbacks that must not re-run on every change (CR-06).
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const sessionsRef = useRef<FocusSession[]>([]);
  sessionsRef.current = sessions;

  // A rhythm change swaps the engine BETWEEN loops only — mid-loop the running
  // engine keeps its plan, and the swap lands when the loop goes terminal (CR-07).
  // enginePhase is captured per render so the tick bump re-runs this effect on
  // every phase change (CR-11); without it a mid-loop rhythm change never landed.
  const enginePhase = engine.currentPhase;
  useEffect(() => {
    const terminal =
      enginePhase === "idle" || enginePhase === "finished" || enginePhase === "abandoned";
    // CR-10: while settings are still loading `plan` is the DEFAULT plan — never
    // build or swap from it.
    if (!settingsLoading && terminal && !sameLoopPlan(engine.baseSteps, plan)) {
      setEngine(new LoopEngine(plan, { autoStartBreaks: settings.autoStartBreaks }));
    }
  }, [engine, enginePhase, plan, settings.autoStartBreaks, settingsLoading]);

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

  const onSessionWritten = useCallback(
    (session: FocusSession) => {
      trackEvent("focus_session_completed", {
        partial: session.partial,
        seconds: session.focusedSeconds,
      });
      // J2-R6: the first session of ITS day turns that day into a goal day.
      const day = new Date(session.endedAt);
      if (sessionsOnDay(sessionsRef.current, day).length === 0) {
        trackEvent("goal_day_met", { day: session.endedAt.slice(0, 10) });
      }
      setLastSession(session);
      setOutcomeDraft(null);
      void reloadData();
    },
    [reloadData],
  );

  const drainRecord = useSessionWriter(engine, onSessionWritten);

  // J9: the snapshot is written on every state change, never on the tick.
  const persistSnapshot = useCallback(() => {
    void saveEngineSnapshot(engine.snapshot());
  }, [engine]);

  // P23 step alerts: one pending local notification, resynced from live engine
  // state. Paused/step-done/terminal phases cancel it — a pending alert that
  // fires early is worse than none.
  const syncAlert = useCallback(() => {
    const step = engine.currentStep;
    if (engine.currentPhase === "running" && step != null) {
      void syncStepAlert(
        step.kind === "focus" ? "focus-end" : "break-end",
        engine.remainingSeconds(),
        settingsRef.current.vibrationEnabled,
      );
    } else {
      void cancelStepAlert();
    }
  }, [engine]);

  const afterEngineChange = useCallback(() => {
    persistSnapshot();
    syncAlert();
  }, [persistSnapshot, syncAlert]);

  // Boot: data in, then OS-kill recovery BEFORE the first-launch/home default —
  // a live snapshot outranks the landing route (J9). Runs exactly once — a
  // settings change (e.g. the Disc/Numbers toggle) must never re-route (CR-06).
  const bootedRef = useRef(false);
  useEffect(() => {
    if (settingsLoading || bootedRef.current || bootIntent === "pending") {
      return;
    }
    // CR-10: when settings just loaded with a non-default rhythm, this commit's
    // swap effect is about to replace the engine. Restoring into THIS engine
    // would strand the session in the discarded one — wait a render for the
    // post-swap engine (this effect re-runs because `engine` is a dep).
    if (!sameLoopPlan(engine.baseSteps, plan)) {
      return;
    }
    bootedRef.current = true;
    void (async () => {
      await reloadData();
      // Pre-kill scheduled alerts are orphaned (their in-memory slot is gone).
      // Clear before the no-snapshot early return so a dropped/corrupt snapshot
      // still clears them; the post-restore sync recreates what is still true.
      await clearStepAlertsAtBoot();
      const snapshot = await loadEngineSnapshot();
      if (snapshot == null) {
        if (bootIntent === "start") {
          // J4-R1: widget start skips Home entirely — begin the session with
          // the last-used rhythm, even on first launch (Disc is the default).
          engine.start(null);
          drainRecord();
          afterEngineChange();
          go("focus");
        } else {
          go(settingsRef.current.displayMode == null ? "first-launch" : "home");
        }
        return;
      }
      const wasInFlight = snapshot.phase === "running" || snapshot.phase === "paused";
      const restored = engine.restore(snapshot);
      trackEvent("session_recovered", {
        restoredTo: restored,
        expiredWhileClosed: wasInFlight && restored !== snapshot.phase,
      });
      drainRecord();
      afterEngineChange();
      const step = engine.currentStep;
      if (restored === "running" || restored === "paused") {
        go(step?.kind === "focus" ? "focus" : "break");
      } else if (restored === "step-done" || restored === "loop-done") {
        if (step?.kind === "focus" && wasInFlight) {
          // Focus expired while the app was closed → P13 confirms it saved (J9-R2).
          go("welcome-back");
        } else if (step?.kind === "focus") {
          go(restored === "loop-done" ? "loop-done" : "closeout");
        } else {
          go("break");
        }
      } else {
        go("home");
      }
    })();
  }, [
    settingsLoading,
    reloadData,
    go,
    engine,
    plan,
    persistSnapshot,
    drainRecord,
    afterEngineChange,
    bootIntent,
  ]);

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
        afterEngineChange();
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
        trackEvent("loop_completed", { loopId: engine.currentLoopId });
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
  }, [engine, go, drainRecord, haptic, persistSnapshot, afterEngineChange]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const chooseDisplayMode = useCallback(
    (mode: DisplayMode, save: (patch: Partial<Settings>) => Promise<void>) => {
      // P02: a tap saves the choice AND starts the first focus (J1-R2).
      void save({ displayMode: mode });
      engine.start(intentionDraft.trim() || null);
      afterEngineChange();
      go("focus");
    },
    [engine, intentionDraft, go, afterEngineChange],
  );

  const startFocus = useCallback(() => {
    engine.start(intentionDraft.trim() || null);
    afterEngineChange();
    go("focus");
  }, [engine, intentionDraft, go, afterEngineChange]);

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
    afterEngineChange();
    go("break");
  }, [engine, go, settings.firstInstallAt, interstitial, afterEngineChange]);

  const keepGoing = useCallback(() => {
    if (engine.extendFocus(EXTENSION_SECONDS)) {
      afterEngineChange();
      go("focus");
    } else {
      go("home");
    }
  }, [engine, go, afterEngineChange]);

  const startNextFocus = useCallback(() => {
    // Break still running → skip the rest; break already ended → step-done advance.
    if (engine.currentPhase === "step-done") {
      engine.advance();
    } else {
      engine.skipBreak();
    }
    afterEngineChange();
    go("focus");
  }, [engine, go, afterEngineChange]);

  const extendBreak = useCallback(() => {
    engine.extendBreak(5 * 60);
    afterEngineChange();
    bump();
  }, [engine, afterEngineChange]);

  const pauseFocus = useCallback(() => {
    engine.pause();
    afterEngineChange();
    bump();
  }, [engine, afterEngineChange]);

  const resumeFocus = useCallback(() => {
    engine.resume();
    afterEngineChange();
    bump();
  }, [engine, afterEngineChange]);

  const endEarlySave = useCallback(() => {
    const record = engine.endEarly();
    if (record != null) {
      engine.clearFocusRecord();
      void recordSession({ ...record, outcome: null }).then(onSessionWritten);
    }
    afterEngineChange();
    go("home");
  }, [engine, go, onSessionWritten, afterEngineChange]);

  const endEarlyDiscard = useCallback(() => {
    engine.discard();
    afterEngineChange();
    go("home");
  }, [engine, go, afterEngineChange]);

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
    afterEngineChange();
    go("break");
  }, [leaveLoopDone, engine, go, afterEngineChange]);

  const skipLongBreak = useCallback(() => {
    leaveLoopDone();
    engine.discard();
    afterEngineChange();
    go("home");
  }, [leaveLoopDone, engine, go, afterEngineChange]);

  // P13 Welcome back (J9): the focus expired while the app was closed — its record
  // is already written; the user picks the close-out or skips straight to break.
  const welcomeHowDidItGo = useCallback(() => {
    go(engine.currentPhase === "loop-done" ? "loop-done" : "closeout");
  }, [engine, go]);

  const welcomeSkipToBreak = useCallback(() => {
    engine.advance();
    afterEngineChange();
    go("break");
  }, [engine, go, afterEngineChange]);

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

  const answerNotifAsk = useCallback(
    (allow: boolean) => {
      setNotifAskOpen(false);
      // CR-08: the answer is stored — "allowed" never re-prompts.
      void markNotificationsAsked(allow ? "allowed" : "declined");
      if (allow) {
        // A focus may already be running — once granted, sync its alert too.
        void requestNotificationPermissions().then(syncAlert);
      }
    },
    [syncAlert],
  );

  // J4 foreground deep link: a widget tap or Live Activity action while the
  // app is alive. "start" only fires when nothing is mid-loop (a live session
  // outranks the intent); "pause" pauses whatever step is counting down.
  const handleDeepLinkIntent = useCallback(
    (intent: FocusLoopIntent) => {
      if (intent === "pause") {
        if (engine.currentPhase === "running") {
          pauseFocus();
        }
        return;
      }
      const phaseNow = engine.currentPhase;
      if (phaseNow === "idle" || phaseNow === "finished" || phaseNow === "abandoned") {
        engine.start(null);
        afterEngineChange();
        go("focus");
      }
    },
    [engine, pauseFocus, afterEngineChange, go],
  );

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

  // J4 surfaces: the running-step state every platform surface mirrors, and
  // the widget snapshot feeding home/lock-screen widgets. Both effects run on
  // every render and dedupe on a signature — transitions and minute flips are
  // the only moments that change the signature, so native calls stay sparse.
  const runningSurface: RunningStepSurface | null =
    step != null && (phase === "running" || phase === "paused")
      ? {
          kind: step.kind,
          displayMode: settings.displayMode ?? "disc",
          remainingSeconds: engine.remainingSeconds(),
          endsAtMs: phase === "paused" ? 0 : Date.now() + engine.remainingSeconds() * 1000,
          paused: phase === "paused",
          currentFocusNumber: engine.currentFocusNumber,
          totalFocusCount: engine.totalFocusCount,
        }
      : null;
  const liveSurfaceSignature =
    runningSurface == null
      ? "none"
      : `${runningSurface.kind}|${runningSurface.paused}|${runningSurface.displayMode}|${Math.ceil(runningSurface.remainingSeconds / 60)}`;
  const lastLiveSignatureRef = useRef("unset");
  useEffect(() => {
    if (liveSurfaceSignature === lastLiveSignatureRef.current) {
      return;
    }
    lastLiveSignatureRef.current = liveSurfaceSignature;
    syncLiveSurface(runningSurface);
  });

  const focusStepMinutes = Math.round(
    (plan.find((s) => s.kind === "focus")?.durationSeconds ?? 1500) / 60,
  );
  const nextParkedText = mostRecentUnused(parkedThoughts)?.text ?? null;
  const widgetSignature = JSON.stringify([
    week.daysMet,
    week.goalDays,
    nextParkedText,
    focusStepMinutes,
    liveSurfaceSignature,
  ]);
  const lastWidgetSignatureRef = useRef("unset");
  useEffect(() => {
    if (widgetSignature === lastWidgetSignatureRef.current) {
      return;
    }
    lastWidgetSignatureRef.current = widgetSignature;
    void publishWidgetSnapshot(
      buildWidgetSnapshot({
        weekDaysMet: week.daysMet,
        weekGoalDays: week.goalDays,
        nextParkedText,
        focusMinutes: focusStepMinutes,
        running: runningSurface,
      }),
    );
  });

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
    pauseFocus,
    resumeFocus,
    welcomeHowDidItGo,
    welcomeSkipToBreak,
    handleDeepLinkIntent,
    restoreSnapshot: (snapshot: LoopSnapshot) => engine.restore(snapshot),
  };
}
