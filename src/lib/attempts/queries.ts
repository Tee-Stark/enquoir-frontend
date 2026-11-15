"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api/client";
import { nextCursorParam } from "@/lib/api/pagination";
import type { components } from "@/lib/api/schema";

export type Attempt = components["schemas"]["Attempt"];
export type AttemptKind = components["schemas"]["AttemptKind"];
export type AttemptOperation = components["schemas"]["AttemptOperation"];
export type AttemptOutcome = components["schemas"]["AttemptOutcome"];

export type AttemptFilters = {
  from?: string;
  to?: string;
  kind?: AttemptKind;
  operation?: AttemptOperation;
  outcome?: AttemptOutcome[];
  agent_id?: string;
  intent_key?: string;
};

const PAGE_SIZE = 25;

/** Agent submissions and Airwallex rail calls, newest first - cursor-paginated. */
export function useAttempts(filters: AttemptFilters) {
  return useInfiniteQuery({
    queryKey: ["attempts", filters],
    queryFn: ({ pageParam }: { pageParam?: string }) =>
      unwrap(
        api.GET("/v1/attempts", {
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
