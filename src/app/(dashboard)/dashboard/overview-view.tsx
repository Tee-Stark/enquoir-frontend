"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/feedback/error-state";
import { PageHeader } from "@/components/page-header";
import { MetricCard } from "@/components/overview/metric-card";
import { VolumeByCurrency } from "@/components/overview/volume-by-currency";
import { RecentPayments } from "@/components/overview/recent-payments";
import { useAnalyticsSummary } from "@/lib/analytics/queries";
import { useRecentPayments } from "@/lib/payments/queries";
import { formatMs, formatPercent } from "@/lib/format";

export function OverviewView() {
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
      <PageHeader
        title="Overview"
        description={`Last 30 days (${period.tz}). Here's your organisation's activity.`}
      />

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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium tracking-wide text-muted-foreground/70 uppercase">
      {children}
    </p>
  );
}
