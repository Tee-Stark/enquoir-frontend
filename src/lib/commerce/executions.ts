"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api/client";
import { nextCursorParam } from "@/lib/api/pagination";
import type { components } from "@/lib/api/schema";

export type Execution = components["schemas"]["Execution"];
export type ExecutionDetail = components["schemas"]["ExecutionDetail"];

export type ExecutionFilters = {
  from?: string;
  to?: string;
  status?: Execution["status"];
  mandate_id?: string;
  agent_id?: string;
  currency?: "USD" | "EUR" | "GBP";
};

const PAGE_SIZE = 25;

/**
 * An organisation's executions across every merchant integration it
 * owns - the dashboard's commerce Payments view (Merchant mode),
 * parallel to usePayments on the treasury side. `enabled` lets the
 * Payments page's Treasury/Merchant toggle skip this fetch entirely
 * while showing the other mode.
 */
export function useExecutions(filters: ExecutionFilters, options?: { enabled?: boolean }) {
  return useInfiniteQuery({
    queryKey: ["executions", filters],
    queryFn: ({ pageParam }: { pageParam?: string }) =>
      unwrap(
        api.GET("/v1/executions", {
          params: { query: { ...filters, limit: PAGE_SIZE, cursor: pageParam } },
        })
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: nextCursorParam,
    enabled: options?.enabled,
  });
}

export function useExecution(id: string) {
  return useQuery({
    queryKey: ["execution", id],
    queryFn: () => unwrap(api.GET("/v1/executions/{id}", { params: { path: { id } } })),
  });
}
