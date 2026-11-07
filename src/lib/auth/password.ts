"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api/client";
import { SESSION_QUERY_KEY } from "./session";

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) =>
      unwrap(api.POST("/v1/auth/password/forgot", { body: { email } })),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (body: { token: string; password: string }) =>
      unwrap(api.POST("/v1/auth/password/reset", { body })),
  });
}

export function useChangePassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { current_password: string; new_password: string }) =>
      unwrap(api.POST("/v1/auth/password/change", { body })),
    onSuccess: () => {
      // Every other session was revoked server-side; this device's session
      // is unaffected, but the session list (if open) is now stale.
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["auth-sessions"] });
    },
  });
}
