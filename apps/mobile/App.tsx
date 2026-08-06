import { StatusBar } from "expo-status-bar";
import { useKeepAwake } from "expo-keep-awake";
import { useCallback, useEffect, useState } from "react";
import { requestNotificationPermissions } from "./src/features/notifications/NotificationScheduler";
import { HomeScreen } from "./src/features/timer/HomeScreen";
import { SummaryScreen } from "./src/features/timer/SummaryScreen";
import { TimerScreen } from "./src/features/timer/TimerScreen";
import {
  SessionStats,
  computeStats,
  loadSessions,
  recordSession,
} from "./src/features/timer/SessionStore";
import { useTimer } from "./src/features/timer/useTimer";

type AppScreen = "home" | "timer" | "summary";

function KeepAwakeActivator() {
  useKeepAwake();
  return null;
}

export default function App() {
  const [screen, setScreen] = useState<AppScreen>("home");
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [stats, setStats] = useState<SessionStats>({ sessionsToday: 0, streakDays: 0 });
  const timer = useTimer();

  useEffect(() => {
    void requestNotificationPermissions();
    void loadSessions().then((sessions) => setStats(computeStats(sessions, new Date())));
  }, []);

  const refreshStats = useCallback(async () => {
    const sessions = await loadSessions();
    setStats(computeStats(sessions, new Date()));
  }, []);

  const handleStart = useCallback(() => {
    void timer.start(selectedMinutes * 60);
    setScreen("timer");
  }, [selectedMinutes, timer]);

  const handleComplete = useCallback(async () => {
    timer.complete();
    if (timer.startedAt) {
      await recordSession(timer.startedAt, timer.durationSeconds);
      await refreshStats();
    }
    setScreen("summary");
  }, [timer, refreshStats]);

  const handleCancel = useCallback(() => {
    timer.cancel();
    setScreen("home");
  }, [timer]);

  const handleStartAnother = useCallback(() => {
    setScreen("home");
  }, []);

  return (
    <>
      {screen === "home" && (
        <HomeScreen
          selectedMinutes={selectedMinutes}
          onSelectMinutes={setSelectedMinutes}
          onStart={handleStart}
          sessionsToday={stats.sessionsToday}
          streakDays={stats.streakDays}
        />
      )}
      {screen === "timer" && (
        <>
          {timer.state === "running" && <KeepAwakeActivator />}
          <TimerScreen
            remainingSeconds={timer.remainingSeconds}
            state={timer.state}
            onPause={timer.pause}
            onResume={() => void timer.resume()}
            onCancel={handleCancel}
            onComplete={() => void handleComplete()}
          />
        </>
      )}
      {screen === "summary" && (
        <SummaryScreen
          durationSeconds={timer.durationSeconds}
          onStartAnother={handleStartAnother}
        />
      )}
      <StatusBar style="auto" />
    </>
  );
}
