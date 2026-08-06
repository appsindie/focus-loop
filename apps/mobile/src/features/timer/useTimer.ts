import { useCallback, useEffect, useRef, useState } from "react";
import {
  cancelTimerNotification,
  scheduleTimerCompletionNotification,
} from "../notifications/NotificationScheduler";

export type TimerState = "idle" | "running" | "paused" | "completed";

export type TimerHook = {
  durationSeconds: number;
  remainingSeconds: number;
  state: TimerState;
  startedAt: Date | null;
  start: (durationSeconds: number) => Promise<void>;
  pause: () => void;
  resume: () => Promise<void>;
  cancel: () => void;
  complete: () => void;
};

export function useTimer(): TimerHook {
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [state, setState] = useState<TimerState>("idle");
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(
    async (nextDurationSeconds: number) => {
      clearTimerInterval();
      setDurationSeconds(nextDurationSeconds);
      setRemainingSeconds(nextDurationSeconds);
      setStartedAt(new Date());
      setState("running");
      await scheduleTimerCompletionNotification(nextDurationSeconds);
    },
    [clearTimerInterval],
  );

  const pause = useCallback(() => {
    clearTimerInterval();
    setState("paused");
    void cancelTimerNotification();
  }, [clearTimerInterval]);

  const resume = useCallback(async () => {
    if (state !== "paused" || remainingSeconds <= 0) {
      return;
    }
    setState("running");
    await scheduleTimerCompletionNotification(remainingSeconds);
  }, [state, remainingSeconds]);

  const cancel = useCallback(() => {
    clearTimerInterval();
    setDurationSeconds(0);
    setRemainingSeconds(0);
    setStartedAt(null);
    setState("idle");
    void cancelTimerNotification();
  }, [clearTimerInterval]);

  const complete = useCallback(() => {
    clearTimerInterval();
    setRemainingSeconds(0);
    setState("completed");
    void cancelTimerNotification();
  }, [clearTimerInterval]);

  useEffect(() => {
    if (state !== "running") {
      return;
    }
    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearTimerInterval();
          setState("completed");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return clearTimerInterval;
  }, [state, clearTimerInterval]);

  return {
    durationSeconds,
    remainingSeconds,
    state,
    startedAt,
    start,
    pause,
    resume,
    cancel,
    complete,
  };
}
