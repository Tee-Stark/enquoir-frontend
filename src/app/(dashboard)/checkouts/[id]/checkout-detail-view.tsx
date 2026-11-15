"use client";

import Link from "next/link";
import { ArrowLeft, History, ShoppingCart } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/feedback/error-state";
import { EmptyState } from "@/components/feedback/empty-state";
import { CheckoutStatusBadge } from "@/components/commerce/checkout-status-badge";
import { RefreshButton } from "@/components/shared/refresh-button";
import { isApiError } from "@/lib/api/client";
import { formatMinorUnits } from "@/lib/money";
import { useCheckout } from "@/lib/commerce/checkouts";

function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right text-foreground">{children}</span>
    </div>
  );
}

export function CheckoutDetailView({ checkoutId }: { checkoutId: string }) {
  const { data: checkout, isPending, isFetching, isError, error, refetch } = useCheckout(checkoutId);

  if (isPending) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (isError) {
    if (isApiError(error) && error.code === "not_found") {
      return (
        <EmptyState
          icon={ShoppingCart}
          title="Checkout not found"
          description={`No checkout with ID "${checkoutId}" in this organisation.`}
          action={
            <Link href="/activity" className={buttonVariants({ variant: "outline", className: "mt-2" })}>
              Back to activity
            </Link>
          }
        />
      );
    }
    return <ErrorState error={error} onRetry={refetch} />;
  }

  const currency = checkout.checkout.currency as "USD" | "EUR" | "GBP";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/activity"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Activity
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-lg font-semibold tracking-tight text-foreground">{checkout.id}</h1>
            <CheckoutStatusBadge status={checkout.status} />
          </div>
          <div className="flex items-center gap-2">
            <RefreshButton onRefresh={() => refetch()} isRefreshing={isFetching} />
            {/* Every checkout, including a denied or canceled one, has a
                replay - mirrors treasury's payment replay never hiding
                itself for a short payment. */}
            <Link href={`/checkouts/${checkout.id}/replay`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              <History className="size-3.5" /> Replay
            </Link>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Summary</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <SummaryRow label="External ID">{checkout.external_id}</SummaryRow>
          <SummaryRow label="Total">{formatMinorUnits(checkout.checkout.total_minor, currency)}</SummaryRow>
          <SummaryRow label="Mandate">
            <span className="font-mono text-xs">{checkout.mandate_id}</span>
          </SummaryRow>
          <SummaryRow label="Customer">
            <span className="font-mono text-xs">{checkout.checkout.customer_id}</span>
          </SummaryRow>
          <SummaryRow label="Agent">
            <span className="font-mono text-xs">{checkout.checkout.agent_id}</span>
          </SummaryRow>
          <SummaryRow label="Created">{new Date(checkout.created_at).toLocaleString()}</SummaryRow>
          {checkout.decided_at && (
            <SummaryRow label="Decided">{new Date(checkout.decided_at).toLocaleString()}</SummaryRow>
          )}
          {checkout.canceled_at && (
            <SummaryRow label="Canceled">{new Date(checkout.canceled_at).toLocaleString()}</SummaryRow>
          )}
        </CardContent>
      </Card>

      {checkout.decision.reasons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Denial reasons</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {checkout.decision.reasons.map((reason) => (
              <p key={reason.code} className="text-sm text-destructive">
                {reason.code}
                {reason.detail ? ` — ${reason.detail}` : ""}
              </p>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Items</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {checkout.checkout.items.map((item) => (
            <div key={item.product_id} className="flex items-center justify-between gap-4 py-2 text-sm">
              <span className="text-foreground">
                {item.quantity} × {item.name}
              </span>
              <span className="text-muted-foreground">{formatMinorUnits(item.unit_price_minor, currency)}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {checkout.authorization && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Authorization</CardTitle>
            <CardDescription>Status: {checkout.authorization.status}</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <SummaryRow label="Expires">{new Date(checkout.authorization.expires_at).toLocaleString()}</SummaryRow>
            {checkout.authorization.execution_id && (
              <SummaryRow label="Execution">
                <Link
                  href={`/executions/${checkout.authorization.execution_id}`}
                  className="font-mono text-xs text-primary hover:underline"
                >
                  {checkout.authorization.execution_id}
                </Link>
              </SummaryRow>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
