"use client";

import { useQuery } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

export type AuthSession = components["schemas"]["AuthSession"];

export const SESSION_QUERY_KEY = ["session"] as const;

/**
 * The app-wide session bootstrap. Cached by TanStack Query under one key,
 * so every component that needs "am I signed in / which org / what role"
 * calls this directly instead of threading session state through props.
 */
export function useSession() {
  return useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: () => unwrap(api.GET("/v1/auth/session")),
  });
}
