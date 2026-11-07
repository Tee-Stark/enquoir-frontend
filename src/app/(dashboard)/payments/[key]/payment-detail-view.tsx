"use client";

import Link from "next/link";
import { ArrowLeft, FileSearch, History } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/feedback/error-state";
import { EmptyState } from "@/components/feedback/empty-state";
import { MoneyDisplay } from "@/components/money";
import { PaymentStateBadge } from "@/components/payments/payment-state-badge";
import { StateProgression } from "@/components/payments/state-progression";
import { HashChainBadge } from "@/components/payments/hash-chain-badge";
import { EventHistory } from "@/components/payments/event-history";
import { AttemptsTable } from "@/components/payments/attempts-table";
import { isApiError } from "@/lib/api/client";
import { usePayment } from "@/lib/payments/queries";

function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right text-foreground">{children}</span>
    </div>
  );
}

export function PaymentDetailView({ paymentKey }: { paymentKey: string }) {
  const { data: payment, isPending, isError, error, refetch } = usePayment(paymentKey);

  if (isPending) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (isError) {
    if (isApiError(error) && error.code === "not_found") {
      return (
        <EmptyState
          icon={FileSearch}
          title="Payment not found"
          description={`No payment with key "${paymentKey}" in this organisation.`}
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
            <h1 className="font-mono text-lg font-semibold tracking-tight text-foreground">
              {payment.key}
            </h1>
            <PaymentStateBadge state={payment.state} />
          </div>
          <Link href={`/payments/${payment.key}/replay`} className={buttonVariants({ variant: "outline", size: "sm" })}>
            <History className="size-3.5" /> Replay
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Summary</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <SummaryRow label="Amount">
            <MoneyDisplay money={payment.amount} />
          </SummaryRow>
          <SummaryRow label="Beneficiary">{payment.payee.name ?? payment.payee.id}</SummaryRow>
          <SummaryRow label="Reference">{payment.reference}</SummaryRow>
          <SummaryRow label="Reason">{payment.reason}</SummaryRow>
          <SummaryRow label="Agent">
            {payment.agent ? payment.agent.name ?? payment.agent.id : "Enquoir"}
          </SummaryRow>
          <SummaryRow label="Transfer ID">
            <span className="font-mono text-xs">{payment.transfer_id ?? "—"}</span>
          </SummaryRow>
          <SummaryRow label="Submissions">{payment.submissions}</SummaryRow>
          <SummaryRow label="Rail calls">{payment.rail_calls}</SummaryRow>
          {payment.failure_reason && (
            <SummaryRow label="Failure reason">
              <span className="text-destructive">{payment.failure_reason}</span>
            </SummaryRow>
          )}
          <SummaryRow label="Created">{new Date(payment.created_at).toLocaleString()}</SummaryRow>
          <SummaryRow label="Last state change">
            {payment.state_changed_at ? new Date(payment.state_changed_at).toLocaleString() : "—"}
          </SummaryRow>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">State progression</CardTitle>
        </CardHeader>
        <CardContent>
          <StateProgression state={payment.state} events={payment.events} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Integrity</CardTitle>
          <HashChainBadge chain={payment.chain} />
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Event history</CardTitle>
          <CardDescription>Hash-chained, oldest first.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <EventHistory events={payment.events} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Execution attempts</CardTitle>
          <CardDescription>Agent submissions and Airwallex calls, oldest first.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {payment.attempts.length === 0 ? (
            <EmptyState title="No attempts recorded yet" className="border-none" />
          ) : (
            <AttemptsTable attempts={payment.attempts} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
