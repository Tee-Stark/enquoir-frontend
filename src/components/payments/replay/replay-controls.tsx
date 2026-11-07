"use client";

import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SPEEDS = [0.5, 1, 2, 4];

export function ReplayControls({
  isPlaying,
  currentIndex,
  stepCount,
  speed,
  onPlay,
  onPause,
  onNext,
  onPrev,
  onRestart,
  onSpeedChange,
}: {
  isPlaying: boolean;
  currentIndex: number;
  stepCount: number;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onRestart: () => void;
  onSpeedChange: (speed: number) => void;
}) {
  const isLast = stepCount === 0 || currentIndex >= stepCount - 1;

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={onRestart} disabled={stepCount === 0} aria-label="Restart">
        <RotateCcw className="size-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={onPrev} disabled={currentIndex === 0} aria-label="Previous step">
        <SkipBack className="size-4" />
      </Button>
      {isPlaying ? (
        <Button size="icon" onClick={onPause} aria-label="Pause">
          <Pause className="size-4" />
        </Button>
      ) : (
        <Button size="icon" onClick={onPlay} disabled={stepCount === 0} aria-label="Play">
          <Play className="size-4" />
        </Button>
      )}
      <Button variant="outline" size="icon" onClick={onNext} disabled={isLast} aria-label="Next step">
        <SkipForward className="size-4" />
      </Button>

      <span className="font-mono text-xs text-muted-foreground">
        {stepCount === 0 ? "0 / 0" : `${currentIndex + 1} / ${stepCount}`}
      </span>

      <Select value={String(speed)} onValueChange={(v) => v && onSpeedChange(Number(v))}>
        <SelectTrigger className="ml-auto w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SPEEDS.map((s) => (
            <SelectItem key={s} value={String(s)}>
              {s}x
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
