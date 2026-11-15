"use client";

import { useState } from "react";
import { Activity as ActivityIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { PageHeader } from "@/components/page-header";
import { RefreshButton } from "@/components/shared/refresh-button";
import { ModeToggle, type ActivityMode } from "@/components/commerce/mode-toggle";
import {
  AttemptsFilters,
  EMPTY_FILTERS,
  toApiFilters,
  type FilterFormState,
} from "@/components/attempts/attempts-filters";
import { AttemptsTable } from "@/components/payments/attempts-table";
import {
  EMPTY_FILTERS as EMPTY_CHECKOUT_FILTERS,
  CheckoutsFilters,
  toApiFilters as toCheckoutApiFilters,
  type FilterFormState as CheckoutFilterFormState,
} from "@/components/commerce/checkouts-filters";
import { CheckoutsTable } from "@/components/commerce/checkouts-table";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { usePersistedMode } from "@/lib/use-persisted-mode";
import { useAttempts } from "@/lib/attempts/queries";
import { useCheckouts } from "@/lib/commerce/checkouts";

function TreasuryActivity() {
  const [filterForm, setFilterForm] = useState<FilterFormState>(EMPTY_FILTERS);
  const debouncedIntentKey = useDebouncedValue(filterForm.intentKey);
  const filters = toApiFilters({ ...filterForm, intentKey: debouncedIntentKey });

  const { data, isPending, isFetching, isError, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useAttempts(filters);

  const attempts = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <AttemptsFilters value={filterForm} onChange={setFilterForm} />
        <RefreshButton onRefresh={() => refetch()} isRefreshing={isFetching} />
      </div>

      {isPending && <Skeleton className="h-96 w-full" />}
      {isError && <ErrorState error={error} onRetry={refetch} />}

      {data && attempts.length === 0 && (
        <EmptyState
          icon={ActivityIcon}
          title="No attempts match these filters"
          description="Try widening the date range or clearing a filter."
        />
      )}

      {data && attempts.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <AttemptsTable attempts={attempts} showPaymentLink />
          </CardContent>
          {hasNextPage && (
            <div className="flex justify-center border-t border-border p-3">
              <Button variant="outline" size="sm" disabled={isFetchingNextPage} onClick={() => fetchNextPage()}>
                {isFetchingNextPage ? "Loading…" : "Load more"}
              </Button>
            </div>
          )}
        </Card>
      )}
    </>
  );
}

function MerchantActivity() {
  const [filterForm, setFilterForm] = useState<CheckoutFilterFormState>(EMPTY_CHECKOUT_FILTERS);
  const debouncedMandateId = useDebouncedValue(filterForm.mandateId);
  const debouncedCustomerId = useDebouncedValue(filterForm.customerId);
  const debouncedAgentId = useDebouncedValue(filterForm.agentId);
  const filters = toCheckoutApiFilters({
    ...filterForm,
    mandateId: debouncedMandateId,
    customerId: debouncedCustomerId,
    agentId: debouncedAgentId,
  });

  const { data, isPending, isFetching, isError, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useCheckouts(filters);

  const checkouts = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <CheckoutsFilters value={filterForm} onChange={setFilterForm} />
        <RefreshButton onRefresh={() => refetch()} isRefreshing={isFetching} />
      </div>

      {isPending && <Skeleton className="h-96 w-full" />}
      {isError && <ErrorState error={error} onRetry={refetch} />}

      {data && checkouts.length === 0 && (
        <EmptyState
          icon={ActivityIcon}
          title="No checkouts match these filters"
          description="Try widening the date range or clearing a filter."
        />
      )}

      {data && checkouts.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <CheckoutsTable checkouts={checkouts} />
          </CardContent>
          {hasNextPage && (
            <div className="flex justify-center border-t border-border p-3">
              <Button variant="outline" size="sm" disabled={isFetchingNextPage} onClick={() => fetchNextPage()}>
                {isFetchingNextPage ? "Loading…" : "Load more"}
              </Button>
            </div>
          )}
        </Card>
      )}
    </>
  );
}

export function ActivityView() {
  const [mode, setMode] = usePersistedMode<ActivityMode>("enquoir:activity-mode", ["treasury", "merchant"], "treasury");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="Activity"
          description={
            mode === "treasury"
              ? "Every agent submission and Airwallex call, newest first."
              : "Every checkout your merchant integrations have submitted, newest first."
          }
        />
        <ModeToggle value={mode} onChange={setMode} />
      </div>

      {mode === "treasury" ? <TreasuryActivity /> : <MerchantActivity />}
    </div>
  );
}
