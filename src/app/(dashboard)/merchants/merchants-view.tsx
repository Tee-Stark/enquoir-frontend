"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ErrorState } from "@/components/feedback/error-state";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageHeader } from "@/components/page-header";
import { CreateMerchantIntegrationDialog } from "@/components/merchants/create-merchant-integration-dialog";
import { RevealSecretDialog } from "@/components/shared/reveal-secret-dialog";
import { problemMessage } from "@/lib/api/client";
import { useSession } from "@/lib/auth/session";
import {
  useMerchantIntegrations,
  useDisableMerchantIntegration,
  useEnableMerchantIntegration,
  useRotateMerchantIntegrationKey,
  useRevokeMerchantIntegrationKey,
  type IssuedMerchantIntegration,
} from "@/lib/commerce/merchant-integrations";

export function MerchantsView() {
  const { data, isPending, isError, error, refetch } = useMerchantIntegrations();
  const session = useSession();
  const disable = useDisableMerchantIntegration();
  const enable = useEnableMerchantIntegration();
  const rotateKey = useRotateMerchantIntegrationKey();
  const revokeKey = useRevokeMerchantIntegrationKey();
  const [issued, setIssued] = useState<IssuedMerchantIntegration | null>(null);

  const integrations = data?.data ?? [];
  const role = session.data?.role;
  // Managing integrations needs owner or admin - per the backend's
  // PermManageIntegrations, a narrower gate than Agents' operator+.
  const canManage = role === "owner" || role === "admin";
  // Cutting access off (disable, revoke) is always allowed; granting or
  // restoring it (create, enable, rotate) needs a verified email.
  const canGrant = canManage && session.data?.user.email_verified === true;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="Merchant integrations"
          description="Merchants connected for commerce: a storefront's AI shopping agent proposing purchases its customers have authorized."
        />
        <CreateMerchantIntegrationDialog disabled={!canGrant} />
      </div>

      {isPending && <Skeleton className="h-64 w-full" />}
      {isError && <ErrorState error={error} onRetry={refetch} />}

      {data && integrations.length === 0 && (
        <EmptyState
          icon={Store}
          title="No merchant integrations yet"
          description="Connect one to get an integration key a merchant's backend can register customers, submit checkouts, and report outcomes with."
        />
      )}

      {data && integrations.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Last used</TableHead>
                  <TableHead>Created</TableHead>
                  {canManage && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {integrations.map((integration) => (
                  <TableRow key={integration.id}>
                    <TableCell className="font-medium">
                      <Link href={`/merchants/${integration.id}`} className="text-primary hover:underline">
                        {integration.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          integration.status === "active"
                            ? "inline-flex h-5 items-center rounded-4xl bg-success/15 px-2 text-xs font-medium text-success"
                            : "inline-flex h-5 items-center rounded-4xl bg-neutral-state/15 px-2 text-xs font-medium text-neutral-state"
                        }
                      >
                        {integration.status === "active" ? "Active" : "Disabled"}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {integration.key?.prefix ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {integration.key?.last_used_at
                        ? new Date(integration.key.last_used_at).toLocaleString()
                        : "Never"}
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {new Date(integration.created_at).toLocaleDateString()}
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {integration.status === "active" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={disable.isPending}
                              onClick={() =>
                                disable.mutate(integration.id, {
                                  onError: (err) => toast.error(problemMessage(err)),
                                })
                              }
                            >
                              Disable
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={!canGrant || enable.isPending}
                              onClick={() =>
                                enable.mutate(integration.id, {
                                  onError: (err) => toast.error(problemMessage(err)),
                                })
                              }
                            >
                              Enable
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={!canGrant || rotateKey.isPending}
                            onClick={() =>
                              rotateKey.mutate(integration.id, {
                                onSuccess: (data) => setIssued(data),
                                onError: (err) => toast.error(problemMessage(err)),
                              })
                            }
                          >
                            {integration.key ? "Rotate key" : "Issue key"}
                          </Button>
                          {integration.key && (
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={revokeKey.isPending}
                              onClick={() =>
                                revokeKey.mutate(integration.id, {
                                  onError: (err) => toast.error(problemMessage(err)),
                                })
                              }
                            >
                              Revoke key
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <RevealSecretDialog
        issued={issued && { title: `${issued.integration.name} — integration key`, secret: issued.key.secret }}
        onClose={() => setIssued(null)}
      />
    </div>
  );
}
