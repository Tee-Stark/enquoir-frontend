"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api/client";

export const AUTH_SESSIONS_QUERY_KEY = ["auth-sessions"] as const;

/** Every active session on this account, across all organisations. */
export function useAuthSessions() {
  return useQuery({
    queryKey: AUTH_SESSIONS_QUERY_KEY,
    queryFn: () => unwrap(api.GET("/v1/auth/sessions")),
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      unwrap(api.DELETE("/v1/auth/sessions/{id}", { params: { path: { id } } })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_SESSIONS_QUERY_KEY });
    },
  });
}

export function useRevokeOtherSessions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => unwrap(api.DELETE("/v1/auth/sessions")),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_SESSIONS_QUERY_KEY });
    },
  });
}
