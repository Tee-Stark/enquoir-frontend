import { cn } from "@/lib/utils";
import type { components } from "@/lib/api/schema";

export type PaymentState = components["schemas"]["PaymentState"];

/**
 * UI treatment per the product spec. UNKNOWN, FAILED, and BLOCKED are kept
 * visually distinct on purpose - they mean different things (reconciliation
 * needed, execution failed, policy blocked) and must never read as one
 * generic "failure" state.
 */
const STATE_STYLE: Record<PaymentState, { label: string; className: string }> = {
  RECEIVED: {
    label: "Received",
    className: "bg-neutral-state/15 text-neutral-state",
  },
  PROPOSED: {
    label: "Proposed",
    className: "bg-primary/15 text-primary",
  },
  AUTHORIZED: {
    label: "Authorized",
    className: "bg-primary/15 text-primary",
  },
  IN_FLIGHT: {
    label: "In flight",
    className: "bg-warning/15 text-warning",
  },
  UNKNOWN: {
    label: "Unknown",
    className: "bg-warning/15 text-warning",
  },
  APPLIED: {
    label: "Applied",
    className: "bg-success/15 text-success",
  },
  FAILED: {
    label: "Failed",
    className: "bg-destructive/15 text-destructive",
  },
  BLOCKED: {
    label: "Blocked",
    className: "bg-accent/15 text-accent",
  },
};

export function PaymentStateBadge({
  state,
  className,
}: {
  state: PaymentState;
  className?: string;
}) {
  const style = STATE_STYLE[state];
  return (
    <span
      data-slot="payment-state-badge"
      className={cn(
        "inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 rounded-4xl px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        style.className,
        className
      )}
    >
      {style.label}
    </span>
  );
}
