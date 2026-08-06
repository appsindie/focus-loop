import { useCallback, useEffect, useRef, useState } from "react";

export type TimerState = "idle" | "running" | "paused" | "completed";

export type TimerHook = {
  durationSeconds: number;
  remainingSeconds: number;
  state: TimerState;
  start: (durationSeconds: number) => void;
  pause: () => void;
  resume: () => void;
  cancel: () => void;
  complete: () => void;
};

export function useTimer(): TimerHook {
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [state, setState] = useState<TimerState>("idle");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(
    (nextDurationSeconds: number) => {
      clearTimerInterval();
      setDurationSeconds(nextDurationSeconds);
      setRemainingSeconds(nextDurationSeconds);
      setState("running");
    },
    [clearTimerInterval],
  );

  const pause = useCallback(() => {
    clearTimerInterval();
    setState("paused");
  }, [clearTimerInterval]);

  const resume = useCallback(() => {
    if (state !== "paused" || remainingSeconds <= 0) {
      return;
    }
    setState("running");
  }, [state, remainingSeconds]);

  const cancel = useCallback(() => {
    clearTimerInterval();
    setDurationSeconds(0);
    setRemainingSeconds(0);
    setState("idle");
  }, [clearTimerInterval]);

  const complete = useCallback(() => {
    clearTimerInterval();
    setRemainingSeconds(0);
    setState("completed");
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
    start,
    pause,
    resume,
    cancel,
    complete,
  };
}
