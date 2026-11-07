"use client";

import { useQuery } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

export type Beneficiary = components["schemas"]["Beneficiary"];

export function useBeneficiaries() {
  return useQuery({
    queryKey: ["beneficiaries"],
    queryFn: () => unwrap(api.GET("/v1/beneficiaries")),
  });
}
