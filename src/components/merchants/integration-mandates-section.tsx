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
import { MandateStatusBadge } from "@/components/commerce/mandate-status-badge";
import { formatMinorUnits, type Money } from "@/lib/money";
import { useIntegrationMandates } from "@/lib/commerce/integration-activity";

export function IntegrationMandatesSection({ integrationId }: { integrationId: string }) {
  const { data, isPending, isError, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useIntegrationMandates(integrationId);

  const mandates = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Mandates</CardTitle>
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
      {data && mandates.length === 0 && (
        <CardContent>
          <EmptyState title="No mandates yet" className="border-none" />
        </CardContent>
      )}
      {data && mandates.length > 0 && (
        <>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approval</TableHead>
                  <TableHead>Spent / remaining</TableHead>
                  <TableHead>Approved</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mandates.map((mandate) => (
                  <TableRow key={mandate.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {mandate.terms.customer_id}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{mandate.terms.agent.name}</TableCell>
                    <TableCell>
                      <MandateStatusBadge status={mandate.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {mandate.terms.approval_mode === "autonomous" ? "Autonomous" : "Per transaction"}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {mandate.usage
                        ? `${formatMinorUnits(mandate.usage.spent_minor, mandate.usage.currency as Money["currency"])} / ${formatMinorUnits(mandate.usage.remaining_minor, mandate.usage.currency as Money["currency"])}`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(mandate.approved_at).toLocaleString()}
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
