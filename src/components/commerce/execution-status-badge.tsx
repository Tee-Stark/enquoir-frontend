import { cn } from "@/lib/utils";
import type { components } from "@/lib/api/schema";

export type ExecutionStatus = components["schemas"]["Execution"]["status"];

/**
 * `unknown` gets the same warning treatment as Treasury's UNKNOWN payment
 * state - it means reconciliation is needed, not that anything failed.
 * Classes written out in full - the Tailwind compiler only generates
 * classes it can see as literal strings.
 */
export const EXECUTION_STATUS_STYLE: Record<ExecutionStatus, { label: string; tintClassName: string }> = {
  pending: { label: "Pending", tintClassName: "bg-primary/15 text-primary" },
  succeeded: { label: "Succeeded", tintClassName: "bg-success/15 text-success" },
  failed: { label: "Failed", tintClassName: "bg-destructive/15 text-destructive" },
  unknown: { label: "Unknown", tintClassName: "bg-warning/15 text-warning" },
};

export function ExecutionStatusBadge({ status, className }: { status: ExecutionStatus; className?: string }) {
  const { label, tintClassName } = EXECUTION_STATUS_STYLE[status];
  return (
    <span
      data-slot="execution-status-badge"
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
