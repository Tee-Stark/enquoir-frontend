"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export function useReplay(key: string) {
  return useQuery({
    queryKey: ["payment", key, "replay"],
    queryFn: () =>
      unwrap(api.GET("/v1/payments/{key}/replay", { params: { path: { key } } })),
  });
}

/**
 * Approve/reject resolve a payment the organisation's policy escalated
 * (AWAITING_APPROVAL). The backend re-decides asynchronously (the
 * workflow re-checks the policy, or waits for the timeout) - this
 * refetches the payment and every open payments list so they pick up
 * the outcome once it lands, not synchronously on this response.
 * `exact: true` on the detail key keeps that from also invalidating
 * its replay data (["payment", key, "replay"]), which this doesn't
 * change.
 */
export function useApproveEscalatedPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (key: string) =>
      unwrap(api.POST("/v1/payments/{key}/approve", { params: { path: { key } } })),
    onSuccess: (_data, key) => {
      queryClient.invalidateQueries({ queryKey: ["payment", key], exact: true });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}

export function useRejectEscalatedPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (key: string) =>
      unwrap(api.POST("/v1/payments/{key}/reject", { params: { path: { key } } })),
    onSuccess: (_data, key) => {
      queryClient.invalidateQueries({ queryKey: ["payment", key], exact: true });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}
