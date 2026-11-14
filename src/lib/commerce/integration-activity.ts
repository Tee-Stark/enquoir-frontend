"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api/client";
import { nextCursorParam } from "@/lib/api/pagination";
import type { components } from "@/lib/api/schema";

export type Checkout = components["schemas"]["Checkout"];
export type Mandate = components["schemas"]["Mandate"];
export type Execution = components["schemas"]["Execution"];

const PAGE_SIZE = 25;

/** One merchant integration's checkouts, read-only - cursor-paginated like every other commerce list. */
export function useIntegrationCheckouts(integrationId: string) {
  return useInfiniteQuery({
    queryKey: ["merchant-integrations", integrationId, "checkouts"],
    queryFn: ({ pageParam }: { pageParam?: string }) =>
      unwrap(
        api.GET("/v1/merchant-integrations/{id}/checkouts", {
          params: { path: { id: integrationId }, query: { limit: PAGE_SIZE, cursor: pageParam } },
        })
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: nextCursorParam,
  });
}

export function useIntegrationMandates(integrationId: string) {
  return useInfiniteQuery({
    queryKey: ["merchant-integrations", integrationId, "mandates"],
    queryFn: ({ pageParam }: { pageParam?: string }) =>
      unwrap(
        api.GET("/v1/merchant-integrations/{id}/mandates", {
          params: { path: { id: integrationId }, query: { limit: PAGE_SIZE, cursor: pageParam } },
        })
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: nextCursorParam,
  });
}

export function useIntegrationExecutions(integrationId: string) {
  return useInfiniteQuery({
    queryKey: ["merchant-integrations", integrationId, "executions"],
    queryFn: ({ pageParam }: { pageParam?: string }) =>
      unwrap(
        api.GET("/v1/merchant-integrations/{id}/executions", {
          params: { path: { id: integrationId }, query: { limit: PAGE_SIZE, cursor: pageParam } },
        })
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: nextCursorParam,
  });
}
