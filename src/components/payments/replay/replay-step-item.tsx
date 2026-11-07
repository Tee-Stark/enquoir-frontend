"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatMs } from "@/lib/format";
import { PAYMENT_STATE_STYLE, type PaymentState } from "@/components/payments/payment-state-badge";
import { isUnhappyOutcome } from "@/lib/attempts/outcome";
import type { components } from "@/lib/api/schema";

type ReplayStep = components["schemas"]["ReplayStep"];

const ACTOR_LABEL: Record<ReplayStep["actor"], string> = {
  agent: "Agent",
  policy: "Policy",
  workflow: "Workflow",
  rail: "Airwallex",
};

export function ReplayStepItem({
  step,
  isCurrent,
  isPlayed,
  onSelect,
}: {
  step: ReplayStep;
  isCurrent: boolean;
  isPlayed: boolean;
  onSelect: () => void;
}) {
  // The OpenAPI schema types from_state/to_state as plain strings (they're
  // not $ref'd to State), but the backend only ever puts valid state names
  // there - same relationship PaymentStateBadge relies on elsewhere.
  const toState = step.to_state as PaymentState | null;
  const dotClassName =
    step.type === "transition" && toState
      ? PAYMENT_STATE_STYLE[toState].dotClassName
      : step.outcome && isUnhappyOutcome(step.outcome)
        ? "bg-destructive"
        : "bg-primary";

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={false}
      animate={{ opacity: isPlayed ? 1 : 0.35 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
        isCurrent ? "border-primary/40 bg-primary/5" : "border-transparent hover:bg-muted/50"
      )}
    >
      <span className="mt-1.5">
        <span className={cn("block size-2.5 rounded-full", dotClassName)} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-medium text-foreground">{step.title}</span>
          <span className="shrink-0 font-mono text-xs text-muted-foreground">
            +{formatMs(step.offset_ms)}
          </span>
        </span>
        <span className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{ACTOR_LABEL[step.actor]}</span>
          {step.duration_ms !== null && <span>· {formatMs(step.duration_ms)}</span>}
          {step.outcome && (
            <span className={isUnhappyOutcome(step.outcome) ? "text-destructive" : "text-success"}>
              · {step.outcome}
            </span>
          )}
        </span>
      </span>
    </motion.button>
  );
}
