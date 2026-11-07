"use client";

import { useEffect, useRef } from "react";
import { ReplayStepItem } from "./replay-step-item";
import type { components } from "@/lib/api/schema";

type ReplayStep = components["schemas"]["ReplayStep"];

export function ReplayTimeline({
  steps,
  currentIndex,
  onSelect,
}: {
  steps: ReplayStep[];
  currentIndex: number;
  onSelect: (index: number) => void;
}) {
  const currentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [currentIndex]);

  return (
    <div className="flex flex-col gap-1.5">
      {steps.map((step, index) => (
        <div key={step.index} ref={index === currentIndex ? currentRef : undefined}>
          <ReplayStepItem
            step={step}
            isCurrent={index === currentIndex}
            isPlayed={index <= currentIndex}
            onSelect={() => onSelect(index)}
          />
        </div>
      ))}
    </div>
  );
}
