import { StatusBar } from "expo-status-bar";
import { useKeepAwake } from "expo-keep-awake";
import { useCallback, useEffect, useState } from "react";
import { requestNotificationPermissions } from "./src/features/notifications/NotificationScheduler";
import { DEFAULT_SETTINGS, useSettings } from "./src/features/settings/useSettings";
import { SettingsScreen } from "./src/features/settings/SettingsScreen";
import { HistoryScreen } from "./src/features/timer/HistoryScreen";
import { HomeScreen } from "./src/features/timer/HomeScreen";
import { SummaryScreen } from "./src/features/timer/SummaryScreen";
import { TimerScreen } from "./src/features/timer/TimerScreen";
import {
  CompletedSession,
  SessionStats,
  computeStats,
  loadSessions,
  recordSession,
} from "./src/features/timer/SessionStore";
import { useTimer } from "./src/features/timer/useTimer";

type AppScreen = "home" | "timer" | "summary" | "settings" | "history";

function KeepAwakeActivator() {
  useKeepAwake();
  return null;
}

export default function App() {
  const [screen, setScreen] = useState<AppScreen>("home");
  const {
    settings,
    loading: settingsLoading,
    update: updateSettings,
    save: saveSettings,
  } = useSettings();
  const [selectedMinutes, setSelectedMinutes] = useState(DEFAULT_SETTINGS.defaultDurationMinutes);
  const [stats, setStats] = useState<SessionStats>({ sessionsToday: 0, streakDays: 0 });
  const [sessions, setSessions] = useState<CompletedSession[]>([]);

  const timer = useTimer({
    soundEnabled: settings.soundEnabled,
    vibrationEnabled: settings.vibrationEnabled,
  });

  const refreshSessions = useCallback(async () => {
    const loaded = await loadSessions();
    setSessions(loaded);
    setStats(computeStats(loaded, new Date()));
  }, []);

  useEffect(() => {
    void requestNotificationPermissions();
    void refreshSessions();
  }, [refreshSessions]);

  useEffect(() => {
    if (!settingsLoading) {
      setSelectedMinutes(settings.defaultDurationMinutes);
    }
  }, [settings.defaultDurationMinutes, settingsLoading]);

  useEffect(() => {
    const startedAt = timer.startedAt;
    const durationSeconds = timer.durationSeconds;
    if (timer.state !== "completed" || startedAt == null || durationSeconds === 0) {
      return;
    }
    void (async () => {
      await recordSession(startedAt, durationSeconds);
      await refreshSessions();
      setScreen("summary");
    })();
  }, [timer.state, timer.startedAt, timer.durationSeconds, refreshSessions]);

  const handleStart = useCallback(() => {
    void timer.start(selectedMinutes * 60);
    setScreen("timer");
  }, [selectedMinutes, timer]);

  const handleCancel = useCallback(() => {
    timer.cancel();
    setScreen("home");
  }, [timer]);

  const handleStartAnother = useCallback(() => {
    setScreen("home");
  }, []);

  const handleOpenSettings = useCallback(() => {
    setScreen("settings");
  }, []);

  const handleOpenHistory = useCallback(() => {
    setScreen("history");
  }, []);

  const handleBackToHome = useCallback(() => {
    setScreen("home");
  }, []);

  const handleSaveSettings = useCallback(async () => {
    await saveSettings();
    setSelectedMinutes(settings.defaultDurationMinutes);
    setScreen("home");
  }, [saveSettings, settings.defaultDurationMinutes]);

  return (
    <>
      {screen === "home" && (
        <HomeScreen
          selectedMinutes={selectedMinutes}
          onSelectMinutes={setSelectedMinutes}
          onStart={handleStart}
          onOpenSettings={handleOpenSettings}
          onOpenHistory={handleOpenHistory}
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
          />
        </>
      )}
      {screen === "summary" && (
        <SummaryScreen
          durationSeconds={timer.durationSeconds}
          onStartAnother={handleStartAnother}
        />
      )}
      {screen === "history" && <HistoryScreen sessions={sessions} onBack={handleBackToHome} />}
      {screen === "settings" && (
        <SettingsScreen
          settings={settings}
          onChange={updateSettings}
          onSave={() => void handleSaveSettings()}
          onBack={handleBackToHome}
        />
      )}
      <StatusBar style="auto" />
    </>
  );
}
