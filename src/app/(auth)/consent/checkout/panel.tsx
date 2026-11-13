"use client";

import { useSearchParams } from "next/navigation";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConsentViewGate } from "@/components/consent/consent-view-gate";
import { DecisionActions } from "@/components/consent/decision-actions";
import { DecisionResultCard } from "@/components/consent/decision-result-card";
import { formatMinorUnits, type Money } from "@/lib/money";
import {
  useCheckoutApprovalView,
  useApproveCheckoutConsent,
  useRejectCheckoutConsent,
  type Checkout,
} from "@/lib/commerce/consent";

function outcomeCard(checkout: Checkout) {
  if (checkout.status === "authorized") {
    return (
      <DecisionResultCard
        tone="success"
        title="Checkout approved"
        description="The merchant can now charge your funding method for this purchase."
      />
    );
  }
  if (checkout.status === "denied") {
    return (
      <DecisionResultCard
        tone="neutral"
        title="No longer fits your mandate"
        description="Your approval was recorded, but this checkout was rechecked against your mandate's limits and no longer fits - it was not charged."
      />
    );
  }
  return (
    <DecisionResultCard
      tone="neutral"
      title="Declined"
      description="The merchant will not charge your funding method for this purchase."
    />
  );
}

export function CheckoutApprovalPanel() {
  const token = useSearchParams().get("token");
  const view = useCheckoutApprovalView(token);
  const approve = useApproveCheckoutConsent();
  const reject = useRejectCheckoutConsent();

  if (approve.isSuccess) return outcomeCard(approve.data);
  if (reject.isSuccess) return outcomeCard(reject.data);

  return (
    <ConsentViewGate token={token} query={view}>
      {(checkout) => {
        const { items, currency, shipping_minor, tax_minor, fees_minor, total_minor } = checkout.checkout;
        const c = currency as Money["currency"];
        return (
          <>
            <CardHeader>
              <CardTitle>Approve this purchase?</CardTitle>
              <CardDescription>Review what it&apos;s for before approving.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ul className="flex flex-col gap-2 text-sm">
                {items.map((item, i) => (
                  <li key={i} className="flex justify-between gap-4">
                    <span>
                      {item.quantity} × {item.name}
                    </span>
                    <span className="tabular-nums">
                      {formatMinorUnits(item.quantity * item.unit_price_minor, c)}
                    </span>
                  </li>
                ))}
                {shipping_minor > 0 && (
                  <li className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className="tabular-nums">{formatMinorUnits(shipping_minor, c)}</span>
                  </li>
                )}
                {tax_minor > 0 && (
                  <li className="flex justify-between text-muted-foreground">
                    <span>Tax</span>
                    <span className="tabular-nums">{formatMinorUnits(tax_minor, c)}</span>
                  </li>
                )}
                {fees_minor > 0 && (
                  <li className="flex justify-between text-muted-foreground">
                    <span>Fees</span>
                    <span className="tabular-nums">{formatMinorUnits(fees_minor, c)}</span>
                  </li>
                )}
                <li className="flex justify-between border-t border-border pt-2 font-medium">
                  <span>Total</span>
                  <span className="tabular-nums">{formatMinorUnits(total_minor, c)}</span>
                </li>
              </ul>
              <DecisionActions
                primary={{
                  label: approve.isPending ? "Approving…" : "Approve",
                  pending: approve.isPending,
                  onClick: () => token && approve.mutate({ token, checkout_hash: checkout.checkout_hash }),
                }}
                secondary={{
                  label: reject.isPending ? "Declining…" : "Decline",
                  pending: reject.isPending,
                  onClick: () => token && reject.mutate(token),
                }}
              />
            </CardContent>
          </>
        );
      }}
    </ConsentViewGate>
  );
}
