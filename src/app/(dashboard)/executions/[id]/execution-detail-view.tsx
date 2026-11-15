"use client";

import Link from "next/link";
import { ArrowLeft, Receipt } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/feedback/error-state";
import { EmptyState } from "@/components/feedback/empty-state";
import { ExecutionStatusBadge } from "@/components/commerce/execution-status-badge";
import { RefreshButton } from "@/components/shared/refresh-button";
import { isApiError } from "@/lib/api/client";
import { formatMinorUnits } from "@/lib/money";
import { useExecution } from "@/lib/commerce/executions";

function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right text-foreground">{children}</span>
    </div>
  );
}

export function ExecutionDetailView({ executionId }: { executionId: string }) {
  const { data: execution, isPending, isFetching, isError, error, refetch } = useExecution(executionId);

  if (isPending) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (isError) {
    if (isApiError(error) && error.code === "not_found") {
      return (
        <EmptyState
          icon={Receipt}
          title="Execution not found"
          description={`No execution with ID "${executionId}" in this organisation.`}
          action={
            <Link href="/payments" className={buttonVariants({ variant: "outline", className: "mt-2" })}>
              Back to payments
            </Link>
          }
        />
      );
    }
    return <ErrorState error={error} onRetry={refetch} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/payments"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Payments
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-lg font-semibold tracking-tight text-foreground">{execution.id}</h1>
            <ExecutionStatusBadge status={execution.status} />
          </div>
          <RefreshButton onRefresh={() => refetch()} isRefreshing={isFetching} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Summary</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <SummaryRow label="Amount">
            {formatMinorUnits(execution.amount_minor, execution.currency as "USD" | "EUR" | "GBP")}
          </SummaryRow>
          <SummaryRow label="Funding method">
            {execution.funding_method.brand} •••• {execution.funding_method.last_four ?? "····"}
          </SummaryRow>
          <SummaryRow label="Provider">{execution.funding_method.provider}</SummaryRow>
          <SummaryRow label="Mandate">
            <span className="font-mono text-xs">{execution.mandate_id}</span>
          </SummaryRow>
          <SummaryRow label="Provider payment reference">
            <span className="font-mono text-xs">{execution.provider_payment_reference ?? "—"}</span>
          </SummaryRow>
          {execution.failure_reason && (
            <SummaryRow label="Failure reason">
              <span className="text-destructive">{execution.failure_reason}</span>
            </SummaryRow>
          )}
          <SummaryRow label="Report deadline">{new Date(execution.report_deadline).toLocaleString()}</SummaryRow>
          <SummaryRow label="Created">{new Date(execution.created_at).toLocaleString()}</SummaryRow>
          <SummaryRow label="Finished">
            {execution.finished_at ? new Date(execution.finished_at).toLocaleString() : "—"}
          </SummaryRow>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Checkout</CardTitle>
          <CardDescription>The checkout this execution was redeemed from.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href={`/checkouts/${execution.checkout_id}`}
            className="font-mono text-sm text-primary hover:underline"
          >
            {execution.checkout_id}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
