"use client";

import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { PageHeader } from "@/components/page-header";
import {
  EMPTY_FILTERS,
  PaymentsFilters,
  toApiFilters,
  type FilterFormState,
} from "@/components/payments/payments-filters";
import { PaymentsTable } from "@/components/payments/payments-table";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { usePayments } from "@/lib/payments/queries";

export function PaymentsView() {
  const [filterForm, setFilterForm] = useState<FilterFormState>(EMPTY_FILTERS);
  const debouncedReference = useDebouncedValue(filterForm.reference);
  const filters = toApiFilters({ ...filterForm, reference: debouncedReference });

  const { data, isPending, isError, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePayments(filters);

  const payments = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Payments" description="Every payment intent your agents have submitted." />

      <PaymentsFilters value={filterForm} onChange={setFilterForm} />

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
