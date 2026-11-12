import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useReplayPlayback } from "./use-replay-playback";

describe("useReplayPlayback", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts paused at the first step", () => {
    const { result } = renderHook(() => useReplayPlayback([0, 100, 200]));
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.isPlaying).toBe(false);
  });

  it("advances through steps on a timer once played, and stops at the last step", () => {
    const { result } = renderHook(() => useReplayPlayback([0, 100, 100]));

    act(() => result.current.play());
    expect(result.current.isPlaying).toBe(true);

    act(() => vi.advanceTimersByTime(500));
    expect(result.current.currentIndex).toBe(1);

    act(() => vi.advanceTimersByTime(500));
    expect(result.current.currentIndex).toBe(2);
    // No next step to advance to - isPlaying is derived, so it drops to
    // false on its own rather than needing a setState from inside the effect.
    expect(result.current.isPlaying).toBe(false);
  });

  it("pause stops the timer from advancing further", () => {
    const { result } = renderHook(() => useReplayPlayback([0, 100, 100]));

    act(() => result.current.play());
    act(() => vi.advanceTimersByTime(500));
    expect(result.current.currentIndex).toBe(1);

    act(() => result.current.pause());
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.currentIndex).toBe(1);
    expect(result.current.isPlaying).toBe(false);
  });

  it("next/prev move one step and stop any pending playback", () => {
    const { result } = renderHook(() => useReplayPlayback([0, 100, 100]));

    act(() => result.current.play());
    act(() => result.current.next());
    expect(result.current.currentIndex).toBe(1);
    expect(result.current.isPlaying).toBe(false);

    act(() => result.current.prev());
    expect(result.current.currentIndex).toBe(0);

    // prev() at the first step stays clamped, never goes negative.
    act(() => result.current.prev());
    expect(result.current.currentIndex).toBe(0);
  });

  it("next at the last step stays clamped, never runs past the end", () => {
    const { result } = renderHook(() => useReplayPlayback([0, 100]));
    act(() => result.current.next());
    act(() => result.current.next());
    act(() => result.current.next());
    expect(result.current.currentIndex).toBe(1);
  });

  it("jumpTo clamps to the valid step range", () => {
    const { result } = renderHook(() => useReplayPlayback([0, 100, 100]));

    act(() => result.current.jumpTo(1));
    expect(result.current.currentIndex).toBe(1);

    act(() => result.current.jumpTo(99));
    expect(result.current.currentIndex).toBe(2);

    act(() => result.current.jumpTo(-5));
    expect(result.current.currentIndex).toBe(0);
  });

  it("restart resets to the first step and resumes playing when there are steps", () => {
    const { result } = renderHook(() => useReplayPlayback([0, 100, 100]));

    act(() => result.current.jumpTo(2));
    act(() => result.current.restart());
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.isPlaying).toBe(true);
  });

  it("does nothing on an empty step list - no crash, never playing", () => {
    const { result } = renderHook(() => useReplayPlayback([]));
    act(() => result.current.play());
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.currentIndex).toBe(0);
  });

  it("a higher speed shortens the wait between steps", () => {
    const { result } = renderHook(() => useReplayPlayback([0, 2500, 2500]));

    act(() => result.current.setSpeed(5));
    act(() => result.current.play());

    // 2500ms / 5 = 500ms - should have advanced well before the full 2500ms.
    act(() => vi.advanceTimersByTime(600));
    expect(result.current.currentIndex).toBe(1);
  });
});
