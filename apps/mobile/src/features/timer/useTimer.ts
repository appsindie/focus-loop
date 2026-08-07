import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Vibration } from "react-native";
import {
  cancelTimerNotification,
  scheduleTimerCompletionNotification,
} from "../notifications/NotificationScheduler";

export type TimerState = "idle" | "running" | "paused" | "completed";

export type TimerOptions = {
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
  onComplete?: () => void;
};

export type TimerHook = {
  durationSeconds: number;
  remainingSeconds: number;
  state: TimerState;
  startedAt: Date | null;
  start: (durationSeconds: number) => Promise<void>;
  pause: () => void;
  resume: () => Promise<void>;
  cancel: () => void;
};

export function useTimer(options: TimerOptions = {}): TimerHook {
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const [durationSeconds, setDurationSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [state, setState] = useState<TimerState>("idle");
  const [startedAt, setStartedAt] = useState<Date | null>(null);

  const startedAtMsRef = useRef<number | null>(null);
  const pausedAtMsRef = useRef<number | null>(null);
  const pausedMsRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasCompletedRef = useRef(false);

  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const finish = useCallback(() => {
    if (hasCompletedRef.current) {
      return;
    }
    hasCompletedRef.current = true;
    clearTimerInterval();
    setRemainingSeconds(0);
    setState("completed");
    void cancelTimerNotification();
    if (optionsRef.current.vibrationEnabled) {
      Vibration.vibrate();
    }
    optionsRef.current.onComplete?.();
  }, [clearTimerInterval]);

  const computeRemainingSeconds = useCallback((): number => {
    if (startedAtMsRef.current == null || durationSeconds <= 0) {
      return 0;
    }
    const elapsedMs = Date.now() - startedAtMsRef.current - pausedMsRef.current;
    const remainingMs = durationSeconds * 1000 - elapsedMs;
    return Math.max(0, Math.ceil(remainingMs / 1000));
  }, [durationSeconds]);

  const updateRemaining = useCallback(() => {
    if (state !== "running" || startedAtMsRef.current == null) {
      return;
    }
    const remaining = computeRemainingSeconds();
    setRemainingSeconds(remaining);
    if (remaining === 0) {
      finish();
    }
  }, [state, computeRemainingSeconds, finish]);

  const start = useCallback(
    async (nextDurationSeconds: number) => {
      clearTimerInterval();
      hasCompletedRef.current = false;
      pausedAtMsRef.current = null;
      pausedMsRef.current = 0;
      startedAtMsRef.current = Date.now();
      const startDate = new Date(startedAtMsRef.current);
      setStartedAt(startDate);
      setDurationSeconds(nextDurationSeconds);
      setRemainingSeconds(nextDurationSeconds);
      setState("running");
      await scheduleTimerCompletionNotification(
        nextDurationSeconds,
        optionsRef.current.soundEnabled ?? true,
      );
    },
    [clearTimerInterval],
  );

  const pause = useCallback(() => {
    if (state !== "running" || startedAtMsRef.current == null) {
      return;
    }
    clearTimerInterval();
    pausedAtMsRef.current = Date.now();
    setState("paused");
    updateRemaining();
    void cancelTimerNotification();
  }, [state, clearTimerInterval, updateRemaining]);

  const resume = useCallback(async () => {
    if (state !== "paused" || startedAtMsRef.current == null) {
      return;
    }
    if (pausedAtMsRef.current != null) {
      pausedMsRef.current += Date.now() - pausedAtMsRef.current;
      pausedAtMsRef.current = null;
    }
    const remaining = computeRemainingSeconds();
    setRemainingSeconds(remaining);
    if (remaining <= 0) {
      finish();
      return;
    }
    setState("running");
    await scheduleTimerCompletionNotification(remaining, optionsRef.current.soundEnabled ?? true);
  }, [state, computeRemainingSeconds, finish]);

  const cancel = useCallback(() => {
    clearTimerInterval();
    startedAtMsRef.current = null;
    pausedAtMsRef.current = null;
    pausedMsRef.current = 0;
    setDurationSeconds(0);
    setRemainingSeconds(0);
    setStartedAt(null);
    setState("idle");
    hasCompletedRef.current = false;
    void cancelTimerNotification();
  }, [clearTimerInterval]);

  useEffect(() => {
    if (state !== "running") {
      return;
    }
    updateRemaining();
    intervalRef.current = setInterval(updateRemaining, 1000);
    return clearTimerInterval;
  }, [state, updateRemaining, clearTimerInterval]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active" && state === "running") {
        updateRemaining();
      }
    });
    return () => subscription.remove();
  }, [state, updateRemaining]);

  return {
    durationSeconds,
    remainingSeconds,
    state,
    startedAt,
    start,
    pause,
    resume,
    cancel,
  };
}
