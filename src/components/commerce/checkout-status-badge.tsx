import { cn } from "@/lib/utils";
import type { components } from "@/lib/api/schema";

export type CheckoutStatus = components["schemas"]["Checkout"]["status"];

/**
 * `denied` gets the crimson accent treatment, not plain destructive red -
 * same reasoning as Treasury's BLOCKED payment state: it's a policy
 * decision (the checkout doesn't fit the mandate's limits), not a failure,
 * and must read as visually distinct from an actual failure (`rejected`,
 * `revoked`, `payment_failed`). Classes written out in full - the
 * Tailwind compiler only generates classes it can see as literal strings.
 */
export const CHECKOUT_STATUS_STYLE: Record<CheckoutStatus, { label: string; tintClassName: string }> = {
  authorized: { label: "Authorized", tintClassName: "bg-primary/15 text-primary" },
  awaiting_customer_approval: { label: "Awaiting approval", tintClassName: "bg-warning/15 text-warning" },
  denied: { label: "Denied", tintClassName: "bg-accent/15 text-accent" },
  rejected: { label: "Rejected", tintClassName: "bg-destructive/15 text-destructive" },
  canceled: { label: "Canceled", tintClassName: "bg-neutral-state/15 text-neutral-state" },
  expired: { label: "Expired", tintClassName: "bg-neutral-state/15 text-neutral-state" },
  redeemed: { label: "Redeemed", tintClassName: "bg-primary/15 text-primary" },
  revoked: { label: "Revoked", tintClassName: "bg-destructive/15 text-destructive" },
  paid: { label: "Paid", tintClassName: "bg-success/15 text-success" },
  payment_failed: { label: "Payment failed", tintClassName: "bg-destructive/15 text-destructive" },
};

export function CheckoutStatusBadge({ status, className }: { status: CheckoutStatus; className?: string }) {
  const { label, tintClassName } = CHECKOUT_STATUS_STYLE[status];
  return (
    <span
      data-slot="checkout-status-badge"
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
