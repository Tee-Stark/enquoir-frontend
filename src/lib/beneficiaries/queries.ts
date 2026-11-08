"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

export type Beneficiary = components["schemas"]["Beneficiary"];
export type RegisterBeneficiaryRequest = components["schemas"]["RegisterBeneficiaryRequest"];

const BENEFICIARIES_QUERY_KEY = ["beneficiaries"] as const;

export function useBeneficiaries() {
  return useQuery({
    queryKey: BENEFICIARIES_QUERY_KEY,
    queryFn: () => unwrap(api.GET("/v1/beneficiaries")),
  });
}

/** Registering the same details again just returns the existing payee - the backend's job, not something this hook needs to special-case. */
export function useRegisterBeneficiary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: RegisterBeneficiaryRequest) =>
      unwrap(api.POST("/v1/beneficiaries", { body })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BENEFICIARIES_QUERY_KEY });
    },
  });
}
