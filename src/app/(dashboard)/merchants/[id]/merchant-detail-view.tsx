"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Store } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/feedback/error-state";
import { EmptyState } from "@/components/feedback/empty-state";
import { RevealSecretDialog } from "@/components/shared/reveal-secret-dialog";
import { ConfirmButton } from "@/components/shared/confirm-button";
import { IntegrationCheckoutsSection } from "@/components/merchants/integration-checkouts-section";
import { IntegrationMandatesSection } from "@/components/merchants/integration-mandates-section";
import { IntegrationExecutionsSection } from "@/components/merchants/integration-executions-section";
import { isApiError, problemMessage } from "@/lib/api/client";
import { useSession } from "@/lib/auth/session";
import {
  useMerchantIntegration,
  useDisableMerchantIntegration,
  useEnableMerchantIntegration,
  useRotateMerchantIntegrationKey,
  useRevokeMerchantIntegrationKey,
  type IssuedMerchantIntegration,
} from "@/lib/commerce/merchant-integrations";

function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right text-foreground">{children}</span>
    </div>
  );
}

export function MerchantDetailView({ integrationId }: { integrationId: string }) {
  const { data: integration, isPending, isError, error, refetch } = useMerchantIntegration(integrationId);
  const session = useSession();
  const disable = useDisableMerchantIntegration();
  const enable = useEnableMerchantIntegration();
  const rotateKey = useRotateMerchantIntegrationKey();
  const revokeKey = useRevokeMerchantIntegrationKey();
  const [issued, setIssued] = useState<IssuedMerchantIntegration | null>(null);

  if (isPending) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (isError) {
    if (isApiError(error) && error.code === "not_found") {
      return (
        <EmptyState
          icon={Store}
          title="Merchant integration not found"
          description="It may have been removed, or belongs to another organisation."
          action={
            <Link href="/merchants" className={buttonVariants({ variant: "outline", className: "mt-2" })}>
              Back to merchant integrations
            </Link>
          }
        />
      );
    }
    return <ErrorState error={error} onRetry={refetch} />;
  }

  const role = session.data?.role;
  const canManage = role === "owner" || role === "admin";
  const canGrant = canManage && session.data?.user.email_verified === true;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/merchants"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Merchant integrations
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">{integration.name}</h1>
          <span
            className={
              integration.status === "active"
                ? "inline-flex h-5 items-center rounded-4xl bg-success/15 px-2 text-xs font-medium text-success"
                : "inline-flex h-5 items-center rounded-4xl bg-neutral-state/15 px-2 text-xs font-medium text-neutral-state"
            }
          >
            {integration.status === "active" ? "Active" : "Disabled"}
          </span>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Summary</CardTitle>
          {canManage && (
            <div className="flex gap-1">
              {integration.status === "active" ? (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={disable.isPending}
                  onClick={() => disable.mutate(integrationId, { onError: (err) => toast.error(problemMessage(err)) })}
                >
                  Disable
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!canGrant || enable.isPending}
                  onClick={() => enable.mutate(integrationId, { onError: (err) => toast.error(problemMessage(err)) })}
                >
                  Enable
                </Button>
              )}
              {integration.key ? (
                <ConfirmButton
                  variant="ghost"
                  size="sm"
                  disabled={!canGrant || rotateKey.isPending}
                  title="Rotate this integration's key?"
                  description="The current key stops working immediately. Make sure the merchant is ready to switch to the new one before continuing."
                  confirmLabel="Rotate key"
                  onConfirm={() =>
                    rotateKey.mutate(integrationId, {
                      onSuccess: (data) => setIssued(data),
                      onError: (err) => toast.error(problemMessage(err)),
                    })
                  }
                >
                  Rotate key
                </ConfirmButton>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!canGrant || rotateKey.isPending}
                  onClick={() =>
                    rotateKey.mutate(integrationId, {
                      onSuccess: (data) => setIssued(data),
                      onError: (err) => toast.error(problemMessage(err)),
                    })
                  }
                >
                  Issue key
                </Button>
              )}
              {integration.key && (
                <ConfirmButton
                  variant="destructive"
                  size="sm"
                  disabled={revokeKey.isPending}
                  title="Revoke this integration's key?"
                  description="The merchant immediately loses the ability to call Enquoir with it. This cannot be undone - issue a new key afterwards if they still need access."
                  confirmLabel="Revoke key"
                  onConfirm={() => revokeKey.mutate(integrationId, { onError: (err) => toast.error(problemMessage(err)) })}
                >
                  Revoke key
                </ConfirmButton>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <SummaryRow label="Key prefix">
            <span className="font-mono text-xs">{integration.key?.prefix ?? "—"}</span>
          </SummaryRow>
          <SummaryRow label="Last used">
            {integration.key?.last_used_at ? new Date(integration.key.last_used_at).toLocaleString() : "Never"}
          </SummaryRow>
          <SummaryRow label="Created">{new Date(integration.created_at).toLocaleString()}</SummaryRow>
          {integration.disabled_at && (
            <SummaryRow label="Disabled">{new Date(integration.disabled_at).toLocaleString()}</SummaryRow>
          )}
        </CardContent>
      </Card>

      <IntegrationCheckoutsSection integrationId={integrationId} />
      <IntegrationMandatesSection integrationId={integrationId} />
      <IntegrationExecutionsSection integrationId={integrationId} />

      <RevealSecretDialog
        issued={issued && { title: `${issued.integration.name} — integration key`, secret: issued.key.secret }}
        onClose={() => setIssued(null)}
      />
    </div>
  );
}
