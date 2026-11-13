"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

export type ConsentView = components["schemas"]["ConsentView"];
export type ConsentOutcome = components["schemas"]["ConsentOutcome"];
export type Mandate = components["schemas"]["Mandate"];
export type Checkout = components["schemas"]["Checkout"];

/**
 * All six hooks below are public and unauthenticated: a one-time token
 * from an emailed link is the only credential, never a session or a
 * merchant key. None of them touch the query cache - each is a one-shot
 * flow scoped to a single token, never revisited or invalidated.
 */

// --- Mandate consent -------------------------------------------------

/** Reads the terms a consent link is for, without spending it. */
export function useMandateConsentView(token: string | null) {
  return useQuery({
    queryKey: ["consent", "mandate", token],
    queryFn: () => unwrap(api.POST("/v1/consent/view", { body: { token: token! } })),
    enabled: token !== null,
    retry: false,
  });
}

/** terms_hash must be the exact value the view response returned - it binds the decision to the shown terms. */
export function useApproveMandateConsent() {
  return useMutation({
    mutationFn: (body: { token: string; terms_hash: string }) =>
      unwrap(api.POST("/v1/consent/approve", { body })),
  });
}

export function useRejectMandateConsent() {
  return useMutation({
    mutationFn: (token: string) => unwrap(api.POST("/v1/consent/reject", { body: { token } })),
  });
}

// --- Mandate revocation confirmation -----------------------------------

/** Reads the mandate a revocation link is for; its status is revocation_pending. */
export function useRevocationView(token: string | null) {
  return useQuery({
    queryKey: ["consent", "revocation", token],
    queryFn: () => unwrap(api.POST("/v1/consent/revocation/view", { body: { token: token! } })),
    enabled: token !== null,
    retry: false,
  });
}

/** Revokes the mandate for good and spends the link. There is no reject - only confirm, or let the link lapse. */
export function useConfirmRevocation() {
  return useMutation({
    mutationFn: (token: string) =>
      unwrap(api.POST("/v1/consent/revocation/confirm", { body: { token } })),
  });
}

// --- Checkout approval -------------------------------------------------

/** Reads the checkout an approval link is for, without spending it. */
export function useCheckoutApprovalView(token: string | null) {
  return useQuery({
    queryKey: ["consent", "checkout", token],
    queryFn: () => unwrap(api.POST("/v1/consent/checkout/view", { body: { token: token! } })),
    enabled: token !== null,
    retry: false,
  });
}

/** checkout_hash must be the exact value the view response returned; the mandate's limits are rechecked - a checkout that no longer fits comes back denied, not an error. */
export function useApproveCheckoutConsent() {
  return useMutation({
    mutationFn: (body: { token: string; checkout_hash: string }) =>
      unwrap(api.POST("/v1/consent/checkout/approve", { body })),
  });
}

export function useRejectCheckoutConsent() {
  return useMutation({
    mutationFn: (token: string) =>
      unwrap(api.POST("/v1/consent/checkout/reject", { body: { token } })),
  });
}
