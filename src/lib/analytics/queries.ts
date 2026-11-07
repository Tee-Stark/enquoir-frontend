"use client";

import { useQuery } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

export type AnalyticsSummary = components["schemas"]["AnalyticsSummary"];

/** No params = the backend's own default period (the last 30 days). */
export function useAnalyticsSummary() {
  return useQuery({
    queryKey: ["analytics-summary"],
    queryFn: () => unwrap(api.GET("/v1/analytics/summary")),
  });
}
