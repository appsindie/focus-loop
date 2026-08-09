import { act, renderHook } from "@testing-library/react-native";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { useTimer } from "./useTimer";

beforeEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
  jest.setSystemTime(new Date("2026-08-06T12:00:00.000Z"));
});

describe("useTimer", () => {
  it("counts down from the requested duration and calls onComplete when time is up", async () => {
    const onComplete = jest.fn();
    const { result } = await renderHook(() => useTimer({ onComplete }));

    await act(async () => {
      await result.current.start(2);
    });

    expect(result.current.state).toBe("running");
    expect(result.current.remainingSeconds).toBe(2);

    await act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.remainingSeconds).toBe(1);

    await act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.remainingSeconds).toBe(0);
    expect(result.current.state).toBe("completed");
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("pauses and resumes without double-counting elapsed time", async () => {
    const { result } = await renderHook(() => useTimer({ soundEnabled: false }));

    await act(async () => {
      await result.current.start(5);
    });

    await act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(result.current.remainingSeconds).toBe(3);

    await act(() => {
      result.current.pause();
    });
    expect(result.current.state).toBe("paused");

    await act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(result.current.remainingSeconds).toBe(3);

    await act(async () => {
      await result.current.resume();
    });
    expect(result.current.state).toBe("running");

    await act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(result.current.remainingSeconds).toBe(0);
    expect(result.current.state).toBe("completed");
  });

  it("cancels and resets to idle", async () => {
    const { result } = await renderHook(() => useTimer());

    await act(async () => {
      await result.current.start(10);
    });

    await act(() => {
      result.current.cancel();
    });

    expect(result.current.state).toBe("idle");
    expect(result.current.remainingSeconds).toBe(0);
    expect(result.current.durationSeconds).toBe(0);
  });

  it("derives remainingSeconds from wall-clock elapsed time", async () => {
    const { result } = await renderHook(() => useTimer());

    await act(async () => {
      await result.current.start(10);
    });

    await act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current.remainingSeconds).toBe(5);
  });
});
