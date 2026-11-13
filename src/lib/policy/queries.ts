"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

export type PolicyVersion = components["schemas"]["PolicyVersion"];
export type CurrencyRule = components["schemas"]["CurrencyRule"];
export type UpdatePolicyRequest = components["schemas"]["UpdatePolicyRequest"];
export type DryRunPolicyRequest = components["schemas"]["DryRunPolicyRequest"];
export type PolicyDecision = components["schemas"]["PolicyDecision"];

const POLICY_QUERY_KEY = ["policy", "current"] as const;

/** Any member may read the organisation's current spending policy. */
export function useCurrentPolicy() {
  return useQuery({
    queryKey: POLICY_QUERY_KEY,
    queryFn: () => unwrap(api.GET("/v1/policies/current")),
  });
}

/** Owners and admins only, with a verified email (the backend enforces both). */
export function useUpdatePolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdatePolicyRequest) => unwrap(api.PUT("/v1/policies", { body })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POLICY_QUERY_KEY, exact: true });
    },
  });
}

/**
 * Evaluates a candidate payment without moving or reserving anything -
 * owners and admins only, since it reveals how close the organisation
 * is to its limits. Never touches the query cache: each run is a
 * one-shot preview, nothing to invalidate or refetch.
 */
export function useDryRunPolicy() {
  return useMutation({
    mutationFn: (body: DryRunPolicyRequest) => unwrap(api.POST("/v1/policies/dry-run", { body })),
  });
}
