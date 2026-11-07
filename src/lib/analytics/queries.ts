"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api/client";
import type { components, operations } from "@/lib/api/schema";

export type AnalyticsSummary = components["schemas"]["AnalyticsSummary"];
export type TimeSeries = components["schemas"]["TimeSeries"];
export type TimeSeriesQuery = operations["analyticsTimeSeries"]["parameters"]["query"];

export type AnalyticsPeriodFilters = {
  from?: string;
  to?: string;
  tz?: string;
};

/** No filters = the backend's own default period (the last 30 days, UTC). */
export function useAnalyticsSummary(filters: AnalyticsPeriodFilters = {}) {
  return useQuery({
    queryKey: ["analytics-summary", filters],
    queryFn: () => unwrap(api.GET("/v1/analytics/summary", { params: { query: filters } })),
    placeholderData: keepPreviousData,
  });
}

/**
 * One metric over time. `placeholderData: keepPreviousData` holds the
 * previous chart on screen while a filter change refetches, instead of a
 * skeleton flash / layout jump.
 */
export function useAnalyticsTimeSeries(query: TimeSeriesQuery) {
  return useQuery({
    queryKey: ["analytics-timeseries", query],
    queryFn: () => unwrap(api.GET("/v1/analytics/timeseries", { params: { query } })),
    placeholderData: keepPreviousData,
  });
}
