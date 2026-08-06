import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { HomeScreen } from "./src/features/timer/HomeScreen";
import { SummaryScreen } from "./src/features/timer/SummaryScreen";
import { TimerScreen } from "./src/features/timer/TimerScreen";
import { useTimer } from "./src/features/timer/useTimer";

type AppScreen = "home" | "timer" | "summary";

export default function App() {
  const [screen, setScreen] = useState<AppScreen>("home");
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const timer = useTimer();

  const handleStart = useCallback(() => {
    timer.start(selectedMinutes * 60);
    setScreen("timer");
  }, [selectedMinutes, timer]);

  const handleComplete = useCallback(() => {
    timer.complete();
    setScreen("summary");
  }, [timer]);

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
        />
      )}
      {screen === "timer" && (
        <TimerScreen
          remainingSeconds={timer.remainingSeconds}
          state={timer.state}
          onPause={timer.pause}
          onResume={timer.resume}
          onCancel={handleCancel}
          onComplete={handleComplete}
        />
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
