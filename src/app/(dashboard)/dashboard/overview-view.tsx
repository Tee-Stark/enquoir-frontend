"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/feedback/error-state";
import { PageHeader } from "@/components/page-header";
import { RefreshButton } from "@/components/shared/refresh-button";
import { MetricCard } from "@/components/overview/metric-card";
import { VolumeByCurrency } from "@/components/overview/volume-by-currency";
import { RecentPayments } from "@/components/overview/recent-payments";
import { PaidVolumeByCurrency } from "@/components/overview/paid-volume-by-currency";
import { RecentCheckouts } from "@/components/overview/recent-checkouts";
import { ACTIVITY_MODES, ModeToggle, type ActivityMode } from "@/components/commerce/mode-toggle";
import { usePersistedMode } from "@/lib/use-persisted-mode";
import { useAnalyticsSummary } from "@/lib/analytics/queries";
import { useRecentPayments } from "@/lib/payments/queries";
import { useCommerceAnalyticsSummary } from "@/lib/commerce/analytics";
import { useRecentCheckouts } from "@/lib/commerce/checkouts";
import { formatMs, formatPercent } from "@/lib/format";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium tracking-wide text-muted-foreground/70 uppercase">
      {children}
    </p>
  );
}

function TreasuryOverview() {
  const summary = useAnalyticsSummary();
  const recent = useRecentPayments(5);

  if (summary.isPending || recent.isPending) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (summary.isError) {
    return <ErrorState error={summary.error} onRetry={summary.refetch} />;
  }
  if (recent.isError) {
    return <ErrorState error={recent.error} onRetry={recent.refetch} />;
  }

  const { payments, submissions, rail_calls, time_to_applied, volume, period } = summary.data;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="text-sm text-muted-foreground">{`Last 30 days (${period.tz}). Here's your organisation's activity.`}</p>
        <RefreshButton
          onRefresh={() => {
            summary.refetch();
            recent.refetch();
          }}
          isRefreshing={summary.isFetching || recent.isFetching}
        />
      </div>

      <section className="flex flex-col gap-3">
        <SectionLabel>Key metrics</SectionLabel>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MetricCard label="Total payments" value={payments.total} size="lg" />
          <MetricCard
            label="Applied"
            value={payments.by_state.APPLIED ?? 0}
            tone="success"
            size="lg"
          />
          <MetricCard label="Success rate" value={formatPercent(payments.success_rate)} size="lg" />
          <MetricCard label="Blocked" value={payments.by_state.BLOCKED ?? 0} tone="accent" size="lg" />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <SectionLabel>Operational</SectionLabel>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <MetricCard label="In progress" value={payments.in_progress} tone="warning" />
          <MetricCard
            label="Awaiting approval"
            value={payments.by_state.AWAITING_APPROVAL ?? 0}
            tone="warning"
          />
          <MetricCard label="Failed" value={payments.by_state.FAILED ?? 0} tone="destructive" />
          <MetricCard label="Active agents" value={submissions.active_agents} />
          <MetricCard label="Total submissions" value={submissions.total} />
          <MetricCard label="Duplicates prevented" value={submissions.duplicates_prevented} />
          <MetricCard label="Recovered from unknown" value={payments.recovered_from_unknown} />
          <MetricCard label="Airwallex rail calls" value={rail_calls.total} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <SectionLabel>Detailed analysis</SectionLabel>
        <div className="grid grid-cols-2 gap-4 sm:w-1/2 lg:w-1/3">
          <MetricCard
            label="Median time to applied"
            value={formatMs(time_to_applied.p50_ms)}
            hint={time_to_applied.count > 0 ? `${time_to_applied.count} applied` : undefined}
          />
          <MetricCard label="P95 time to applied" value={formatMs(time_to_applied.p95_ms)} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentPayments payments={recent.data.data} />
          </div>
          <VolumeByCurrency volume={volume} />
        </div>
      </section>
    </div>
  );
}

function MerchantOverview() {
  const summary = useCommerceAnalyticsSummary();
  const recent = useRecentCheckouts(5);

  if (summary.isPending || recent.isPending) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (summary.isError) {
    return <ErrorState error={summary.error} onRetry={summary.refetch} />;
  }
  if (recent.isError) {
    return <ErrorState error={recent.error} onRetry={recent.refetch} />;
  }

  const { checkouts, volume, active_agents, time_to_paid, period } = summary.data;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="text-sm text-muted-foreground">{`Last 30 days (${period.tz}). Across every merchant integration.`}</p>
        <RefreshButton
          onRefresh={() => {
            summary.refetch();
            recent.refetch();
          }}
          isRefreshing={summary.isFetching || recent.isFetching}
        />
      </div>

      <section className="flex flex-col gap-3">
        <SectionLabel>Key metrics</SectionLabel>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MetricCard label="Total checkouts" value={checkouts.total} size="lg" />
          <MetricCard label="Paid" value={checkouts.by_status.paid ?? 0} tone="success" size="lg" />
          <MetricCard label="Success rate" value={formatPercent(checkouts.success_rate)} size="lg" />
          <MetricCard label="Denied" value={checkouts.by_status.denied ?? 0} tone="accent" size="lg" />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <SectionLabel>Operational</SectionLabel>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <MetricCard label="In progress" value={checkouts.in_progress} tone="warning" />
          <MetricCard
            label="Awaiting customer approval"
            value={checkouts.by_status.awaiting_customer_approval ?? 0}
            tone="warning"
          />
          <MetricCard label="Payment failed" value={checkouts.by_status.payment_failed ?? 0} tone="destructive" />
          <MetricCard label="Active agents" value={active_agents} />
          <MetricCard label="Recovered from unknown" value={checkouts.recovered_from_unknown} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <SectionLabel>Detailed analysis</SectionLabel>
        <div className="grid grid-cols-2 gap-4 sm:w-1/2 lg:w-1/3">
          <MetricCard
            label="Median time to paid"
            value={formatMs(time_to_paid.p50_ms)}
            hint={time_to_paid.count > 0 ? `${time_to_paid.count} paid` : undefined}
          />
          <MetricCard label="P95 time to paid" value={formatMs(time_to_paid.p95_ms)} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentCheckouts checkouts={recent.data.data} />
          </div>
          <PaidVolumeByCurrency volume={volume} />
        </div>
      </section>
    </div>
  );
}

export function OverviewView() {
  const [mode, setMode] = usePersistedMode<ActivityMode>("enquoir:overview-mode", ACTIVITY_MODES, "treasury");

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader title="Overview" />
        <ModeToggle value={mode} onChange={setMode} />
      </div>

      {mode === "treasury" ? <TreasuryOverview /> : <MerchantOverview />}
    </div>
  );
}
