"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";
import type { Role } from "@/lib/members/queries";

export type Invitation = components["schemas"]["Invitation"];

const INVITATIONS_QUERY_KEY = ["invitations"] as const;

export function useInvitations() {
  return useQuery({
    queryKey: INVITATIONS_QUERY_KEY,
    queryFn: () => unwrap(api.GET("/v1/invitations")),
  });
}

/** Inviting the same address again replaces the pending invitation - the backend's job, not something this hook needs to special-case. */
export function useInviteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { email: string; role: Role }) =>
      unwrap(api.POST("/v1/invitations", { body })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVITATIONS_QUERY_KEY });
    },
  });
}

export function useRevokeInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      unwrap(api.DELETE("/v1/invitations/{id}", { params: { path: { id } } })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVITATIONS_QUERY_KEY });
    },
  });
}
