"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { CheckoutStatusBadge } from "@/components/commerce/checkout-status-badge";
import { formatMinorUnits, type Money } from "@/lib/money";
import { useIntegrationCheckouts } from "@/lib/commerce/integration-activity";

export function IntegrationCheckoutsSection({ integrationId }: { integrationId: string }) {
  const { data, isPending, isError, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useIntegrationCheckouts(integrationId);

  const checkouts = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Checkouts</CardTitle>
      </CardHeader>
      {isPending && (
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      )}
      {isError && (
        <CardContent>
          <ErrorState error={error} onRetry={refetch} />
        </CardContent>
      )}
      {data && checkouts.length === 0 && (
        <CardContent>
          <EmptyState title="No checkouts yet" className="border-none" />
        </CardContent>
      )}
      {data && checkouts.length > 0 && (
        <>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>External ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Mandate</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Decided</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checkouts.map((checkout) => (
                  <TableRow key={checkout.id}>
                    <TableCell className="font-mono text-xs">{checkout.external_id}</TableCell>
                    <TableCell>
                      <CheckoutStatusBadge status={checkout.status} />
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {formatMinorUnits(checkout.checkout.total_minor, checkout.checkout.currency as Money["currency"])}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {checkout.mandate_id}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(checkout.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {checkout.decided_at ? new Date(checkout.decided_at).toLocaleString() : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
        </>
      )}
    </Card>
  );
}
