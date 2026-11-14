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
import {
  AttemptsFilters,
  EMPTY_FILTERS,
  toApiFilters,
  type FilterFormState,
} from "@/components/attempts/attempts-filters";
import { AttemptsTable } from "@/components/payments/attempts-table";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { useAttempts } from "@/lib/attempts/queries";

export function ActivityView() {
  const [filterForm, setFilterForm] = useState<FilterFormState>(EMPTY_FILTERS);
  const debouncedIntentKey = useDebouncedValue(filterForm.intentKey);
  const filters = toApiFilters({ ...filterForm, intentKey: debouncedIntentKey });

  const { data, isPending, isFetching, isError, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useAttempts(filters);

  const attempts = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="Activity"
          description="Every agent submission and Airwallex call, newest first."
        />
        <RefreshButton onRefresh={() => refetch()} isRefreshing={isFetching} />
      </div>

      <AttemptsFilters value={filterForm} onChange={setFilterForm} />

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
              <Button
                variant="outline"
                size="sm"
                disabled={isFetchingNextPage}
                onClick={() => fetchNextPage()}
              >
                {isFetchingNextPage ? "Loading…" : "Load more"}
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
