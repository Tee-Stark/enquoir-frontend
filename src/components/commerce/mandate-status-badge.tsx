import { cn } from "@/lib/utils";
import type { components } from "@/lib/api/schema";

export type MandateStatus = components["schemas"]["MandateStatus"];

/** Classes written out in full - the Tailwind compiler only generates classes it can see as literal strings. */
export const MANDATE_STATUS_STYLE: Record<MandateStatus, { label: string; tintClassName: string }> = {
  active: { label: "Active", tintClassName: "bg-success/15 text-success" },
  suspended: { label: "Suspended", tintClassName: "bg-warning/15 text-warning" },
  revocation_pending: { label: "Revocation pending", tintClassName: "bg-warning/15 text-warning" },
  expired: { label: "Expired", tintClassName: "bg-neutral-state/15 text-neutral-state" },
  revoked: { label: "Revoked", tintClassName: "bg-destructive/15 text-destructive" },
};

export function MandateStatusBadge({ status, className }: { status: MandateStatus; className?: string }) {
  const { label, tintClassName } = MANDATE_STATUS_STYLE[status];
  return (
    <span
      data-slot="mandate-status-badge"
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
