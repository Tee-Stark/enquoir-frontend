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
import { ExecutionStatusBadge } from "@/components/commerce/execution-status-badge";
import { formatMinorUnits, type Money } from "@/lib/money";
import { useIntegrationExecutions } from "@/lib/commerce/integration-activity";

export function IntegrationExecutionsSection({ integrationId }: { integrationId: string }) {
  const { data, isPending, isError, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useIntegrationExecutions(integrationId);

  const executions = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Executions</CardTitle>
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
      {data && executions.length === 0 && (
        <CardContent>
          <EmptyState title="No executions yet" className="border-none" />
        </CardContent>
      )}
      {data && executions.length > 0 && (
        <>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Provider reference</TableHead>
                  <TableHead>Mandate</TableHead>
                  <TableHead>Report deadline</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {executions.map((execution) => (
                  <TableRow key={execution.id}>
                    <TableCell className="tabular-nums">
                      {formatMinorUnits(execution.amount_minor, execution.currency as Money["currency"])}
                    </TableCell>
                    <TableCell>
                      <ExecutionStatusBadge status={execution.status} />
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {execution.provider_payment_reference ?? "—"}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {execution.mandate_id}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(execution.report_deadline).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(execution.created_at).toLocaleString()}
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
