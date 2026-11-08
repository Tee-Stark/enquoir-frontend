"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api/client";
import { nextCursorParam } from "@/lib/api/pagination";
import type { components } from "@/lib/api/schema";

export type AuditEvent = components["schemas"]["AuditEvent"];

export type AuditLogFilters = {
  from?: string;
  to?: string;
  action?: string;
  actor_id?: string;
};

const PAGE_SIZE = 25;

/** Account actions in the organisation, newest first - cursor-paginated. */
export function useAuditLog(filters: AuditLogFilters) {
  return useInfiniteQuery({
    queryKey: ["audit-log", filters],
    queryFn: ({ pageParam }: { pageParam?: string }) =>
      unwrap(
        api.GET("/v1/audit-log", {
          params: {
            query: {
              ...filters,
              limit: PAGE_SIZE,
              cursor: pageParam,
            },
          },
        })
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: nextCursorParam,
  });
}
