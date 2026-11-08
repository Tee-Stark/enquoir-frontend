"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api/client";
import { SESSION_QUERY_KEY } from "@/lib/auth/session";
import type { components } from "@/lib/api/schema";

export type Member = components["schemas"]["Member"];
export type Role = components["schemas"]["Role"];

const MEMBERS_QUERY_KEY = ["members"] as const;

export function useMembers() {
  return useQuery({
    queryKey: MEMBERS_QUERY_KEY,
    queryFn: () => unwrap(api.GET("/v1/members")),
  });
}

/**
 * Changing a member's role (including your own) signs them out of the
 * organisation so it applies at once - invalidating the session alongside
 * the member list covers the case where that member is the viewer.
 */
export function useChangeMemberRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) =>
      unwrap(api.PATCH("/v1/members/{id}", { params: { path: { id } }, body: { role } })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEMBERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      unwrap(api.DELETE("/v1/members/{id}", { params: { path: { id } } })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEMBERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
    },
  });
}
