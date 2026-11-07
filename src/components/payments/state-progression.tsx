import { Fragment } from "react";
import { cn } from "@/lib/utils";
import { PAYMENT_STATE_STYLE } from "./payment-state-badge";
import type { components } from "@/lib/api/schema";

type RecordedEvent = components["schemas"]["RecordedEvent"];
type PaymentState = components["schemas"]["PaymentState"];

/**
 * The actual sequence of states this payment passed through - built from
 * its real recorded events, not an idealized straight-line pipeline. The
 * state machine branches (BLOCKED skips IN_FLIGHT entirely; UNKNOWN is a
 * detour, not a step every payment takes), so drawing a generic tracker and
 * highlighting one step would misrepresent payments that didn't follow the
 * most common path.
 */
export function StateProgression({
  state,
  events,
}: {
  state: PaymentState;
  events: RecordedEvent[];
}) {
  const sequence: PaymentState[] = ["RECEIVED", ...events.map((e) => e.type)];

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {sequence.map((step, index) => {
        const isCurrent = index === sequence.length - 1 && step === state;
        const { label, dotClassName } = PAYMENT_STATE_STYLE[step];
        return (
          <Fragment key={`${step}-${index}`}>
            {index > 0 && <span className="h-px w-3 bg-border" aria-hidden="true" />}
            <span
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium",
                isCurrent ? "bg-muted text-foreground" : "text-muted-foreground"
              )}
            >
              <span className={cn("size-1.5 rounded-full", dotClassName)} />
              {label}
            </span>
          </Fragment>
        );
      })}
    </div>
  );
}
