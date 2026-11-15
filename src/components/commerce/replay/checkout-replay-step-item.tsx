"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatMs } from "@/lib/format";
import { CHECKOUT_STATUS_STYLE, type CheckoutStatus } from "@/components/commerce/checkout-status-badge";
import type { components } from "@/lib/api/schema";

type CheckoutReplayStep = components["schemas"]["CheckoutReplayStep"];

const ACTOR_LABEL: Record<CheckoutReplayStep["actor"], string> = {
  merchant: "Merchant",
  enquoir: "Enquoir",
  provider: "Provider",
};

export function CheckoutReplayStepItem({
  step,
  isCurrent,
  isPlayed,
  onSelect,
}: {
  step: CheckoutReplayStep;
  isCurrent: boolean;
  isPlayed: boolean;
  onSelect: () => void;
}) {
  const status = step.decision?.status as CheckoutStatus | undefined;
  const dotClassName = status ? CHECKOUT_STATUS_STYLE[status].dotClassName : "bg-primary";

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
          <span className="shrink-0 font-mono text-xs text-muted-foreground">+{formatMs(step.offset_ms)}</span>
        </span>
        <span className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{ACTOR_LABEL[step.actor]}</span>
        </span>
      </span>
    </motion.button>
  );
}
