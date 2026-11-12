"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api/client";

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
        // Same reason useLogIn/useSignUp clear the cache: this establishes
        // a session for a (possibly different) account in this browser
        // tab, so no org-scoped data cached under a previous session may
        // survive into it. clear() already drops the (now-stale) session
        // entry too, so AuthGuard's next mount fetches it fresh.
        queryClient.clear();
      }
    },
  });
}
