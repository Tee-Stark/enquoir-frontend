"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

export type MerchantIntegration = components["schemas"]["MerchantIntegration"];
export type IssuedMerchantIntegration = components["schemas"]["IssuedMerchantIntegration"];

const INTEGRATIONS_QUERY_KEY = ["merchant-integrations"] as const;
const integrationKey = (id: string) => ["merchant-integrations", id] as const;

export function useMerchantIntegrations() {
  return useQuery({
    queryKey: INTEGRATIONS_QUERY_KEY,
    queryFn: () => unwrap(api.GET("/v1/merchant-integrations")),
  });
}

export function useMerchantIntegration(id: string) {
  return useQuery({
    queryKey: integrationKey(id),
    queryFn: () =>
      unwrap(api.GET("/v1/merchant-integrations/{id}", { params: { path: { id } } })),
  });
}

/** The key's secret is returned only in this response - never fetchable again. */
export function useCreateMerchantIntegration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      unwrap(api.POST("/v1/merchant-integrations", { body: { name } })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INTEGRATIONS_QUERY_KEY, exact: true });
    },
  });
}

/**
 * Every mutation below invalidates the list and that one integration's
 * own detail with `exact: true` - without it, TanStack Query's default
 * prefix matching means invalidating `["merchant-integrations"]` (the
 * list) also cascades into the detail query for every integration ever
 * loaded, and invalidating `["merchant-integrations", id]` (the detail)
 * cascades into that integration's own checkouts/mandates/executions
 * queries (`["merchant-integrations", id, "checkouts"]` etc. - see
 * integration-activity.ts), none of which these actions actually
 * change.
 */
export function useDisableMerchantIntegration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      unwrap(api.POST("/v1/merchant-integrations/{id}/disable", { params: { path: { id } } })),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: INTEGRATIONS_QUERY_KEY, exact: true });
      queryClient.invalidateQueries({ queryKey: integrationKey(id), exact: true });
    },
  });
}

export function useEnableMerchantIntegration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      unwrap(api.POST("/v1/merchant-integrations/{id}/enable", { params: { path: { id } } })),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: INTEGRATIONS_QUERY_KEY, exact: true });
      queryClient.invalidateQueries({ queryKey: integrationKey(id), exact: true });
    },
  });
}

/** Replaces the active key (or issues one to a revoked integration); the new secret is shown only here. */
export function useRotateMerchantIntegrationKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      unwrap(api.POST("/v1/merchant-integrations/{id}/rotate-key", { params: { path: { id } } })),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: INTEGRATIONS_QUERY_KEY, exact: true });
      queryClient.invalidateQueries({ queryKey: integrationKey(id), exact: true });
    },
  });
}

export function useRevokeMerchantIntegrationKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      unwrap(api.DELETE("/v1/merchant-integrations/{id}/key", { params: { path: { id } } })),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: INTEGRATIONS_QUERY_KEY, exact: true });
      queryClient.invalidateQueries({ queryKey: integrationKey(id), exact: true });
    },
  });
}
