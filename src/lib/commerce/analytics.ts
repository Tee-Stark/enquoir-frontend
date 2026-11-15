"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api/client";
import type { components, operations } from "@/lib/api/schema";
import type { AnalyticsPeriodFilters } from "@/lib/analytics/queries";

export type CommerceAnalyticsSummary = components["schemas"]["CommerceAnalyticsSummary"];
export type CommerceTimeSeriesQuery = operations["commerceAnalyticsTimeSeries"]["parameters"]["query"];

/** No filters = the backend's own default period (the last 30 days, UTC). */
export function useCommerceAnalyticsSummary(filters: AnalyticsPeriodFilters = {}) {
  return useQuery({
    queryKey: ["commerce-analytics-summary", filters],
    queryFn: () => unwrap(api.GET("/v1/commerce-analytics/summary", { params: { query: filters } })),
    placeholderData: keepPreviousData,
  });
}

/** One commerce metric over time - mirrors useAnalyticsTimeSeries exactly. */
export function useCommerceAnalyticsTimeSeries(query: CommerceTimeSeriesQuery) {
  return useQuery({
    queryKey: ["commerce-analytics-timeseries", query],
    queryFn: () => unwrap(api.GET("/v1/commerce-analytics/timeseries", { params: { query } })),
    placeholderData: keepPreviousData,
  });
}
