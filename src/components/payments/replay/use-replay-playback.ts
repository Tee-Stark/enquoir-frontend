"use client";

import { useEffect, useState } from "react";

const MIN_STEP_MS = 400;
const MAX_STEP_MS = 2500;

/**
 * Advances through `stepCount` steps on a timer, spaced by each step's real
 * `delta_ms` (clamped to a watchable range) divided by the playback speed.
 * The backend only supplies timing data - pacing it for display is this
 * hook's job, per the replay endpoint's own doc ("the frontend plays the
 * steps in order, spacing them by delta_ms, or any scale it likes").
 *
 * `isPlaying` is derived (playback was requested AND there's a next step to
 * advance to) rather than corrected after the fact from inside the effect,
 * so reaching the end never needs a setState call from an effect body.
 */
export function useReplayPlayback(deltaMsList: number[]) {
  const stepCount = deltaMsList.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [playRequested, setPlayRequested] = useState(false);
  const [speed, setSpeed] = useState(1);

  const isPlaying = playRequested && currentIndex < stepCount - 1;

  useEffect(() => {
    if (!isPlaying) return;
    const nextDelta = deltaMsList[currentIndex + 1] ?? MIN_STEP_MS;
    const wait = Math.min(MAX_STEP_MS, Math.max(MIN_STEP_MS, nextDelta)) / speed;
    const timer = setTimeout(() => {
      setCurrentIndex((i) => Math.min(i + 1, stepCount - 1));
    }, wait);
    return () => clearTimeout(timer);
  }, [isPlaying, currentIndex, speed, stepCount, deltaMsList]);

  const play = () => {
    if (stepCount === 0) return;
    if (currentIndex >= stepCount - 1) setCurrentIndex(0);
    setPlayRequested(true);
  };
  const pause = () => setPlayRequested(false);
  const next = () => {
    setPlayRequested(false);
    setCurrentIndex((i) => Math.min(i + 1, stepCount - 1));
  };
  const prev = () => {
    setPlayRequested(false);
    setCurrentIndex((i) => Math.max(i - 1, 0));
  };
  const jumpTo = (index: number) => {
    setPlayRequested(false);
    setCurrentIndex(Math.min(Math.max(index, 0), Math.max(stepCount - 1, 0)));
  };
  const restart = () => {
    setCurrentIndex(0);
    setPlayRequested(stepCount > 0);
  };

  return { currentIndex, isPlaying, speed, setSpeed, play, pause, next, prev, jumpTo, restart };
}
