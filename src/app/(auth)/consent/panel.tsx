"use client";

import { useSearchParams } from "next/navigation";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConsentViewGate } from "@/components/consent/consent-view-gate";
import { DecisionActions } from "@/components/consent/decision-actions";
import { DecisionResultCard } from "@/components/consent/decision-result-card";
import { formatMinorUnits, type Money } from "@/lib/money";
import {
  useMandateConsentView,
  useApproveMandateConsent,
  useRejectMandateConsent,
  type ConsentOutcome,
} from "@/lib/commerce/consent";

function outcomeCard(outcome: ConsentOutcome) {
  if (outcome.mandate) {
    return (
      <DecisionResultCard
        tone="success"
        title={`You've approved ${outcome.request.terms.merchant.name}`}
        description="They can now propose purchases within the limits you set, until you revoke it."
      />
    );
  }
  return (
    <DecisionResultCard
      tone="neutral"
      title="Declined"
      description={`${outcome.request.terms.merchant.name} will not be able to make purchases on your behalf.`}
    />
  );
}

export function MandateConsentPanel() {
  const token = useSearchParams().get("token");
  const view = useMandateConsentView(token);
  const approve = useApproveMandateConsent();
  const reject = useRejectMandateConsent();

  if (approve.isSuccess) return outcomeCard(approve.data);
  if (reject.isSuccess) return outcomeCard(reject.data);

  return (
    <ConsentViewGate token={token} query={view}>
      {(data) => {
        const { terms } = data;
        return (
          <>
            <CardHeader>
              <CardTitle>{terms.merchant.name} wants to make purchases for you</CardTitle>
              <CardDescription>
                Via {terms.agent.name}, using your card ending {terms.funding_method.last_four ?? "····"}.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <dl className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Approval needed</dt>
                  <dd>{terms.approval_mode === "autonomous" ? "Not for each purchase" : "Every purchase"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Per purchase, up to</dt>
                  <dd>{formatMinorUnits(terms.scope.max_transaction_minor, terms.scope.currency as Money["currency"])}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">In total, up to</dt>
                  <dd>{formatMinorUnits(terms.scope.max_cumulative_minor, terms.scope.currency as Money["currency"])}</dd>
                </div>
                {terms.scope.max_transactions !== null && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Number of purchases</dt>
                    <dd>Up to {terms.scope.max_transactions}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Categories</dt>
                  <dd className="text-right">
                    {terms.scope.allowed_categories.length > 0 ? terms.scope.allowed_categories.join(", ") : "Any"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Expires</dt>
                  <dd>{new Date(terms.expires_at).toLocaleDateString()}</dd>
                </div>
              </dl>
              <DecisionActions
                primary={{
                  label: approve.isPending ? "Approving…" : "Approve",
                  pending: approve.isPending,
                  onClick: () => token && approve.mutate({ token, terms_hash: terms.terms_hash }),
                }}
                secondary={{
                  label: reject.isPending ? "Declining…" : "Decline",
                  pending: reject.isPending,
                  onClick: () => token && reject.mutate(token),
                }}
              />
            </CardContent>
          </>
        );
      }}
    </ConsentViewGate>
  );
}
