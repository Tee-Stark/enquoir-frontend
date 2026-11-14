"use client";

import { useSearchParams } from "next/navigation";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConsentViewGate } from "@/components/consent/consent-view-gate";
import { DecisionActions } from "@/components/consent/decision-actions";
import { DecisionResultCard } from "@/components/consent/decision-result-card";
import { useRevocationView, useConfirmRevocation, handleConsentError } from "@/lib/commerce/consent";

export function RevocationPanel() {
  const token = useSearchParams().get("token");
  const view = useRevocationView(token);
  const confirm = useConfirmRevocation();

  if (confirm.isSuccess) {
    return (
      <DecisionResultCard
        tone="success"
        title={`Revoked ${confirm.data.terms.merchant.name}'s access`}
        description="They can no longer make any purchases on your behalf."
      />
    );
  }

  return (
    <ConsentViewGate token={token} query={view}>
      {(mandate) => (
        <>
          <CardHeader>
            <CardTitle>Confirm revoking {mandate.terms.merchant.name}&apos;s access</CardTitle>
            <CardDescription>
              {mandate.terms.merchant.name} asked to end this mandate. Confirming stops it at once - they
              will not be able to make any further purchases on your behalf. If you don&apos;t confirm, this
              request lapses on its own and the mandate keeps working as before.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DecisionActions
              primary={{
                label: confirm.isPending ? "Revoking…" : "Confirm revocation",
                pending: confirm.isPending,
                onClick: () =>
                  token && confirm.mutate(token, { onError: (err) => handleConsentError(err, view.refetch) }),
              }}
            />
          </CardContent>
        </>
      )}
    </ConsentViewGate>
  );
}
