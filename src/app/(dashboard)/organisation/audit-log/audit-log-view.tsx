"use client";

import { useState } from "react";
import { ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ErrorState } from "@/components/feedback/error-state";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageHeader } from "@/components/page-header";
import { RefreshButton } from "@/components/shared/refresh-button";
import {
  AuditLogFiltersBar,
  EMPTY_FILTERS,
  toApiFilters,
  type FilterFormState,
} from "@/components/audit-log/audit-log-filters";
import { useAuditLog, type AuditEvent } from "@/lib/audit-log/queries";

function actorLabel(actor: AuditEvent["actor"]): string {
  if (!actor) return "System";
  if (actor.type === "user") return actor.email ?? actor.id;
  return actor.name ?? actor.id;
}

function targetLabel(target: AuditEvent["target"]): string {
  if (!target) return "—";
  return `${target.type} ${target.id}`;
}

function detailsLabel(details: AuditEvent["details"]): string {
  const entries = Object.entries(details);
  if (entries.length === 0) return "—";
  return entries.map(([k, v]) => `${k}=${v}`).join(", ");
}

export function AuditLogView() {
  const [filterForm, setFilterForm] = useState<FilterFormState>(EMPTY_FILTERS);
  const filters = toApiFilters(filterForm);

  const { data, isPending, isFetching, isError, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useAuditLog(filters);

  const events = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="Audit log"
          description="What happened in this organisation, by whom, and when."
        />
        <RefreshButton onRefresh={() => refetch()} isRefreshing={isFetching} />
      </div>

      <AuditLogFiltersBar value={filterForm} onChange={setFilterForm} />

      {isPending && <Skeleton className="h-96 w-full" />}
      {isError && <ErrorState error={error} onRetry={refetch} />}

      {data && events.length === 0 && (
        <EmptyState
          icon={ScrollText}
          title="No events match these filters"
          description="Try widening the date range or clearing a filter."
        />
      )}

      {data && events.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>At</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {new Date(event.at).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-medium">{event.action}</TableCell>
                    <TableCell>{actorLabel(event.actor)}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {targetLabel(event.target)}
                    </TableCell>
                    <TableCell className="max-w-xs truncate font-mono text-xs text-muted-foreground">
                      {detailsLabel(event.details)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{event.ip ?? "—"}</TableCell>
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
        </Card>
      )}
    </div>
  );
}
