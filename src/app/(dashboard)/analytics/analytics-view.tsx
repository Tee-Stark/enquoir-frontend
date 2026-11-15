"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/feedback/error-state";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageHeader } from "@/components/page-header";
import { RefreshButton } from "@/components/shared/refresh-button";
import { ACTIVITY_MODES, ModeToggle, type ActivityMode } from "@/components/commerce/mode-toggle";
import {
  AnalyticsFilters,
  DEFAULT_FILTERS,
  toApiFilters,
  type AnalyticsFilterState,
} from "@/components/analytics/analytics-filters";
import { PaymentsByStateChart } from "@/components/analytics/payments-by-state-chart";
import { VolumeByCurrencyChart } from "@/components/analytics/volume-by-currency-chart";
import { TimeToAppliedChart } from "@/components/analytics/time-to-applied-chart";
import { CheckoutsByStatusChart } from "@/components/commerce/checkouts-by-status-chart";
import { PaidVolumeByCurrencyChart } from "@/components/commerce/paid-volume-by-currency-chart";
import { TimeToPaidChart } from "@/components/commerce/time-to-paid-chart";
import { useAnalyticsTimeSeries } from "@/lib/analytics/queries";
import { useCommerceAnalyticsTimeSeries } from "@/lib/commerce/analytics";
import { usePersistedMode } from "@/lib/use-persisted-mode";

function TreasuryAnalytics({ filterForm }: { filterForm: AnalyticsFilterState }) {
  const { from, to, tz } = toApiFilters(filterForm);

  const payments = useAnalyticsTimeSeries({ metric: "payments", group_by: "state", from, to, tz });
  const volume = useAnalyticsTimeSeries({ metric: "applied_volume", group_by: "currency", from, to, tz });
  const timeToApplied = useAnalyticsTimeSeries({ metric: "time_to_applied", from, to, tz });

  const isPending = payments.isPending || volume.isPending || timeToApplied.isPending;
  const isFetching = payments.isFetching || volume.isFetching || timeToApplied.isFetching;
  const firstError = payments.error ?? volume.error ?? timeToApplied.error;

  return (
    <>
      <div className="flex justify-end">
        <RefreshButton
          onRefresh={() => {
            payments.refetch();
            volume.refetch();
            timeToApplied.refetch();
          }}
          isRefreshing={isFetching}
        />
      </div>

      {isPending && <Skeleton className="h-96 w-full" />}
      {!isPending && firstError && (
        <ErrorState
          error={firstError}
          onRetry={() => {
            payments.refetch();
            volume.refetch();
            timeToApplied.refetch();
          }}
        />
      )}

      {!isPending && !firstError && payments.data && volume.data && timeToApplied.data && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payments by state</CardTitle>
              <CardDescription>Created, bucketed by day, stacked by current state.</CardDescription>
            </CardHeader>
            <CardContent>
              {payments.data.series.length === 0 ? (
                <EmptyState title="No payments in this period" className="border-none" />
              ) : (
                <PaymentsByStateChart series={payments.data} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Applied volume by currency</CardTitle>
              <CardDescription>Never summed across currencies - one chart per currency.</CardDescription>
            </CardHeader>
            <CardContent>
              <VolumeByCurrencyChart series={volume.data} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Time to applied</CardTitle>
              <CardDescription>Median time from submission to APPLIED.</CardDescription>
            </CardHeader>
            <CardContent>
              {timeToApplied.data.series.every((s) => s.points.every((p) => p.value === null)) ? (
                <EmptyState title="No applied payments in this period" className="border-none" />
              ) : (
                <TimeToAppliedChart series={timeToApplied.data} />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}

function MerchantAnalytics({ filterForm }: { filterForm: AnalyticsFilterState }) {
  const { from, to, tz } = toApiFilters(filterForm);

  const checkouts = useCommerceAnalyticsTimeSeries({ metric: "checkouts", group_by: "status", from, to, tz });
  const volume = useCommerceAnalyticsTimeSeries({ metric: "paid_volume", group_by: "currency", from, to, tz });
  const timeToPaid = useCommerceAnalyticsTimeSeries({ metric: "time_to_paid", from, to, tz });

  const isPending = checkouts.isPending || volume.isPending || timeToPaid.isPending;
  const isFetching = checkouts.isFetching || volume.isFetching || timeToPaid.isFetching;
  const firstError = checkouts.error ?? volume.error ?? timeToPaid.error;

  return (
    <>
      <div className="flex justify-end">
        <RefreshButton
          onRefresh={() => {
            checkouts.refetch();
            volume.refetch();
            timeToPaid.refetch();
          }}
          isRefreshing={isFetching}
        />
      </div>

      {isPending && <Skeleton className="h-96 w-full" />}
      {!isPending && firstError && (
        <ErrorState
          error={firstError}
          onRetry={() => {
            checkouts.refetch();
            volume.refetch();
            timeToPaid.refetch();
          }}
        />
      )}

      {!isPending && !firstError && checkouts.data && volume.data && timeToPaid.data && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Checkouts by status</CardTitle>
              <CardDescription>Created, bucketed by day, stacked by current status.</CardDescription>
            </CardHeader>
            <CardContent>
              {checkouts.data.series.length === 0 ? (
                <EmptyState title="No checkouts in this period" className="border-none" />
              ) : (
                <CheckoutsByStatusChart series={checkouts.data} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Paid volume by currency</CardTitle>
              <CardDescription>Never summed across currencies - one chart per currency.</CardDescription>
            </CardHeader>
            <CardContent>
              <PaidVolumeByCurrencyChart series={volume.data} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Time to paid</CardTitle>
              <CardDescription>Median time from execution (redemption) to paid.</CardDescription>
            </CardHeader>
            <CardContent>
              {timeToPaid.data.series.every((s) => s.points.every((p) => p.value === null)) ? (
                <EmptyState title="No paid executions in this period" className="border-none" />
              ) : (
                <TimeToPaidChart series={timeToPaid.data} />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}

export function AnalyticsView() {
  const [mode, setMode] = usePersistedMode<ActivityMode>("enquoir:analytics-mode", ACTIVITY_MODES, "treasury");
  const [filterForm, setFilterForm] = useState<AnalyticsFilterState>(DEFAULT_FILTERS);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader title="Analytics" description="Trends over time, across every currency and state." />
        <ModeToggle value={mode} onChange={setMode} />
      </div>

      <AnalyticsFilters value={filterForm} onChange={setFilterForm} />

      {mode === "treasury" ? (
        <TreasuryAnalytics filterForm={filterForm} />
      ) : (
        <MerchantAnalytics filterForm={filterForm} />
      )}
    </div>
  );
}
