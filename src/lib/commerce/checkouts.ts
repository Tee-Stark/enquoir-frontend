"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api/client";
import { nextCursorParam } from "@/lib/api/pagination";
import type { components } from "@/lib/api/schema";

export type Checkout = components["schemas"]["Checkout"];
export type CheckoutReplay = components["schemas"]["CheckoutReplay"];

export type CheckoutFilters = {
  from?: string;
  to?: string;
  mandate_id?: string;
  customer_id?: string;
  agent_id?: string;
  status?: string;
  currency?: "USD" | "EUR" | "GBP";
};

const PAGE_SIZE = 25;

/**
 * An organisation's checkouts across every merchant integration it
 * owns - the dashboard's commerce Activity view (Merchant mode),
 * parallel to useAttempts on the treasury side.
 */
export function useCheckouts(filters: CheckoutFilters) {
  return useInfiniteQuery({
    queryKey: ["checkouts", filters],
    queryFn: ({ pageParam }: { pageParam?: string }) =>
      unwrap(
        api.GET("/v1/checkouts", {
          params: { query: { ...filters, limit: PAGE_SIZE, cursor: pageParam } },
        })
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: nextCursorParam,
  });
}

export function useCheckout(id: string) {
  return useQuery({
    queryKey: ["checkout", id],
    queryFn: () => unwrap(api.GET("/v1/checkouts/{id}", { params: { path: { id } } })),
  });
}

export function useCheckoutReplay(id: string) {
  return useQuery({
    queryKey: ["checkout", id, "replay"],
    queryFn: () => unwrap(api.GET("/v1/checkouts/{id}/replay", { params: { path: { id } } })),
  });
}
