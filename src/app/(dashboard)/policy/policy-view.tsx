"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/feedback/error-state";
import { PageHeader } from "@/components/page-header";
import { RefreshButton } from "@/components/shared/refresh-button";
import { CurrentPolicyCard } from "@/components/policy/current-policy-card";
import { EditPolicyForm } from "@/components/policy/edit-policy-form";
import { DryRunPanel } from "@/components/policy/dry-run-panel";
import { useSession } from "@/lib/auth/session";
import { useCurrentPolicy } from "@/lib/policy/queries";

export function PolicyView() {
  const { data: policy, isPending, isFetching, isError, error, refetch } = useCurrentPolicy();
  const session = useSession();

  // Owners and admins manage the policy and run its dry-run evaluator
  // (which reveals how close the organisation is to its limits); any
  // member may read it. Matches the backend's own permission split.
  const canManage = session.data?.role === "owner" || session.data?.role === "admin";
  // Saving an edit also needs a verified email, like every other
  // credential-shaping/money-moving action - dry-run doesn't.
  const canEdit = canManage && session.data?.user.email_verified === true;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="Spending policy"
          description="Per-currency limits that decide whether a payment is allowed, denied, or waits for approval."
        />
        <RefreshButton onRefresh={() => refetch()} isRefreshing={isFetching} />
      </div>

      {isPending && <Skeleton className="h-96 w-full" />}
      {isError && <ErrorState error={error} onRetry={refetch} />}

      {policy && (
        <>
          <CurrentPolicyCard policy={policy} />
          {canManage && <EditPolicyForm policy={policy} canEdit={canEdit} />}
          {canManage && <DryRunPanel />}
        </>
      )}
    </div>
  );
}
