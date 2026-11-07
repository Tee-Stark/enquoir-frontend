"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api/client";
import { nextCursorParam } from "@/lib/api/pagination";
import type { components } from "@/lib/api/schema";

export type Payment = components["schemas"]["Payment"];
export type PaymentDetail = components["schemas"]["PaymentDetail"];

export type PaymentFilters = {
  from?: string;
  to?: string;
  state?: Payment["state"][];
  agent_id?: string;
  payee?: string;
  currency?: Payment["amount"]["currency"];
  reference?: string;
};

const PAGE_SIZE = 25;

/** Cursor-paginated; only fetched pages are kept in memory, not the whole history. */
export function usePayments(filters: PaymentFilters) {
  return useInfiniteQuery({
    queryKey: ["payments", filters],
    queryFn: ({ pageParam }: { pageParam?: string }) =>
      unwrap(
        api.GET("/v1/payments", {
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

/** A small, one-shot page - for "recent activity" style lists, not the full paginated table. */
export function useRecentPayments(limit = 5) {
  return useQuery({
    queryKey: ["payments", "recent", limit],
    queryFn: () => unwrap(api.GET("/v1/payments", { params: { query: { limit } } })),
  });
}

export function usePayment(key: string) {
  return useQuery({
    queryKey: ["payment", key],
    queryFn: () =>
      unwrap(api.GET("/v1/payments/{key}", { params: { path: { key } } })),
  });
}
