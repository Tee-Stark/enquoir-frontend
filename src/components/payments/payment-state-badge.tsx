import { cn } from "@/lib/utils";
import type { components } from "@/lib/api/schema";

export type PaymentState = components["schemas"]["PaymentState"];

/**
 * UI treatment per the product spec. UNKNOWN, FAILED, and BLOCKED are kept
 * visually distinct on purpose - they mean different things (reconciliation
 * needed, execution failed, policy blocked) and must never read as one
 * generic "failure" state. Exported so other payment views (state
 * progression) can reuse the same mapping instead of redefining it.
 *
 * Classes are written out in full, not built from a color variable - the
 * Tailwind compiler only generates classes it can see as literal strings.
 */
export const PAYMENT_STATE_STYLE: Record<
  PaymentState,
  { label: string; tintClassName: string; dotClassName: string }
> = {
  RECEIVED: {
    label: "Received",
    tintClassName: "bg-neutral-state/15 text-neutral-state",
    dotClassName: "bg-neutral-state",
  },
  PROPOSED: {
    label: "Proposed",
    tintClassName: "bg-primary/15 text-primary",
    dotClassName: "bg-primary",
  },
  AUTHORIZED: {
    label: "Authorized",
    tintClassName: "bg-primary/15 text-primary",
    dotClassName: "bg-primary",
  },
  IN_FLIGHT: {
    label: "In flight",
    tintClassName: "bg-warning/15 text-warning",
    dotClassName: "bg-warning",
  },
  UNKNOWN: {
    label: "Unknown",
    tintClassName: "bg-warning/15 text-warning",
    dotClassName: "bg-warning",
  },
  APPLIED: {
    label: "Applied",
    tintClassName: "bg-success/15 text-success",
    dotClassName: "bg-success",
  },
  FAILED: {
    label: "Failed",
    tintClassName: "bg-destructive/15 text-destructive",
    dotClassName: "bg-destructive",
  },
  BLOCKED: {
    label: "Blocked",
    tintClassName: "bg-accent/15 text-accent",
    dotClassName: "bg-accent",
  },
};

export function PaymentStateBadge({
  state,
  className,
}: {
  state: PaymentState;
  className?: string;
}) {
  const { label, tintClassName } = PAYMENT_STATE_STYLE[state];
  return (
    <span
      data-slot="payment-state-badge"
      className={cn(
        "inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 rounded-4xl px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        tintClassName,
        className
      )}
    >
      {label}
    </span>
  );
}
