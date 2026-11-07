"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api/client";
import { SESSION_QUERY_KEY } from "./session";

export function useVerifyEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) =>
      unwrap(api.POST("/v1/auth/verify-email", { body: { token } })),
    onSuccess: () => {
      // No-op if nobody's signed in on this device; refreshes
      // `email_verified` everywhere if they are.
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
    },
  });
}

export function useResendVerificationEmail() {
  return useMutation({
    mutationFn: () => unwrap(api.POST("/v1/auth/verify-email/resend")),
  });
}
