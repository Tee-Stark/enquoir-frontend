"use client";

import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { PageHeader } from "@/components/page-header";
import { RefreshButton } from "@/components/shared/refresh-button";
import { ACTIVITY_MODES, ModeToggle, type ActivityMode } from "@/components/commerce/mode-toggle";
import {
  EMPTY_FILTERS,
  PaymentsFilters,
  toApiFilters,
  type FilterFormState,
} from "@/components/payments/payments-filters";
import { PaymentsTable } from "@/components/payments/payments-table";
import {
  EMPTY_FILTERS as EMPTY_EXECUTION_FILTERS,
  ExecutionsFilters,
  toApiFilters as toExecutionApiFilters,
  type FilterFormState as ExecutionFilterFormState,
} from "@/components/commerce/executions-filters";
import { ExecutionsTable } from "@/components/commerce/executions-table";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { usePersistedMode } from "@/lib/use-persisted-mode";
import { usePayments } from "@/lib/payments/queries";
import { useExecutions } from "@/lib/commerce/executions";

function TreasuryPayments() {
  const [filterForm, setFilterForm] = useState<FilterFormState>(EMPTY_FILTERS);
  const debouncedReference = useDebouncedValue(filterForm.reference);
  const filters = toApiFilters({ ...filterForm, reference: debouncedReference });

  const { data, isPending, isFetching, isError, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePayments(filters);

  const payments = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <PaymentsFilters value={filterForm} onChange={setFilterForm} />
        <RefreshButton onRefresh={() => refetch()} isRefreshing={isFetching} />
      </div>

      {isPending && <Skeleton className="h-96 w-full" />}
      {isError && <ErrorState error={error} onRetry={refetch} />}

      {data && payments.length === 0 && (
        <EmptyState
          icon={ArrowLeftRight}
          title="No payments match these filters"
          description="Try widening the date range or clearing a filter."
        />
      )}

      {data && payments.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <PaymentsTable payments={payments} />
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

function MerchantExecutions() {
  const [filterForm, setFilterForm] = useState<ExecutionFilterFormState>(EMPTY_EXECUTION_FILTERS);
  const debouncedMandateId = useDebouncedValue(filterForm.mandateId);
  const debouncedAgentId = useDebouncedValue(filterForm.agentId);
  const filters = toExecutionApiFilters({ ...filterForm, mandateId: debouncedMandateId, agentId: debouncedAgentId });

  const { data, isPending, isFetching, isError, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useExecutions(filters);

  const executions = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <ExecutionsFilters value={filterForm} onChange={setFilterForm} />
        <RefreshButton onRefresh={() => refetch()} isRefreshing={isFetching} />
      </div>

      {isPending && <Skeleton className="h-96 w-full" />}
      {isError && <ErrorState error={error} onRetry={refetch} />}

      {data && executions.length === 0 && (
        <EmptyState
          icon={ArrowLeftRight}
          title="No executions match these filters"
          description="Try widening the date range or clearing a filter."
        />
      )}

      {data && executions.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <ExecutionsTable executions={executions} />
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

export function PaymentsView() {
  const [mode, setMode] = usePersistedMode<ActivityMode>("enquoir:payments-mode", ACTIVITY_MODES, "treasury");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="Payments"
          description={
            mode === "treasury"
              ? "Every payment intent your agents have submitted."
              : "Every execution your merchant integrations have redeemed."
          }
        />
        <ModeToggle value={mode} onChange={setMode} />
      </div>

      {mode === "treasury" ? <TreasuryPayments /> : <MerchantExecutions />}
    </div>
  );
}
