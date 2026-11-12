"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api/client";
import { SESSION_QUERY_KEY } from "./session";

export function useSignUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      email: string;
      password: string;
      organisation_name: string;
    }) => unwrap(api.POST("/v1/auth/signup", { body })),
    onSuccess: (session) => {
      // A previous account's org-scoped data (agents, beneficiaries, ...)
      // must not survive into this new session - see useLogOut/useSwitchOrganisation.
      queryClient.clear();
      queryClient.setQueryData(SESSION_QUERY_KEY, session);
    },
  });
}

export function useLogIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { email: string; password: string }) =>
      unwrap(api.POST("/v1/auth/login", { body })),
    onSuccess: (session) => {
      queryClient.clear();
      queryClient.setQueryData(SESSION_QUERY_KEY, session);
    },
  });
}

export function useLogOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => unwrap(api.POST("/v1/auth/logout")),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: SESSION_QUERY_KEY });
      queryClient.clear();
    },
  });
}

export function useSwitchOrganisation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (organisation_id: string) =>
      unwrap(
        api.POST("/v1/auth/switch-organisation", {
          body: { organisation_id },
        })
      ),
    onSuccess: (session) => {
      queryClient.setQueryData(SESSION_QUERY_KEY, session);
      // Everything else (payments, members, ...) is scoped to the previous
      // organisation - it must be refetched, not just the session.
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] !== "session",
      });
    },
  });
}
