"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api/client";
import { SESSION_QUERY_KEY } from "./session";

export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { token: string; password?: string }) =>
      unwrap(api.POST("/v1/invitations/accept", { body })),
    onSuccess: (result) => {
      // A session cookie is only set when the account was created or
      // claimed - for an already-verified account the response has no
      // session, and the person still needs to log in normally.
      if (result.account_created || result.account_claimed) {
        queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
      }
    },
  });
}
