"use client";

import { useQuery } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

export type Agent = components["schemas"]["Agent"];

export function useAgents() {
  return useQuery({
    queryKey: ["agents"],
    queryFn: () => unwrap(api.GET("/v1/agents")),
  });
}
