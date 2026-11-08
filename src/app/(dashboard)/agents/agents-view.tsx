"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Bot } from "lucide-react";
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
import { CreateAgentDialog } from "@/components/agents/create-agent-dialog";
import { RevealApiKeyDialog } from "@/components/agents/reveal-api-key-dialog";
import { problemMessage } from "@/lib/api/client";
import { useSession } from "@/lib/auth/session";
import {
  useAgents,
  useRevokeAgent,
  useRotateAgentKey,
  type IssuedAgent,
} from "@/lib/agents/queries";

export function AgentsView() {
  const { data, isPending, isError, error, refetch } = useAgents();
  const session = useSession();
  const rotateKey = useRotateAgentKey();
  const revokeAgent = useRevokeAgent();
  const [rotated, setRotated] = useState<IssuedAgent | null>(null);

  const agents = data?.data ?? [];
  const role = session.data?.role;
  // Only operators and above create, rotate, or revoke agents - and only
  // once the email is verified, per the product spec's verification gate.
  const canManage = role === "owner" || role === "admin" || role === "operator";
  const canCreate = canManage && session.data?.user.email_verified === true;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="Agents"
          description="The AI agents that can submit payments on this organisation's behalf, and their API keys."
        />
        <CreateAgentDialog disabled={!canCreate} />
      </div>

      {isPending && <Skeleton className="h-64 w-full" />}
      {isError && <ErrorState error={error} onRetry={refetch} />}

      {data && agents.length === 0 && (
        <EmptyState
          icon={Bot}
          title="No agents yet"
          description="Create one to get an API key an agent can submit payments with."
        />
      )}

      {data && agents.length > 0 && (
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
                {agents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell className="font-medium">{agent.name}</TableCell>
                    <TableCell>
                      <span
                        className={
                          agent.status === "active"
                            ? "inline-flex h-5 items-center rounded-4xl bg-success/15 px-2 text-xs font-medium text-success"
                            : "inline-flex h-5 items-center rounded-4xl bg-neutral-state/15 px-2 text-xs font-medium text-neutral-state"
                        }
                      >
                        {agent.status === "active" ? "Active" : "Revoked"}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {agent.api_key?.prefix ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {agent.api_key?.last_used_at
                        ? new Date(agent.api_key.last_used_at).toLocaleString()
                        : "Never"}
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {new Date(agent.created_at).toLocaleDateString()}
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        {agent.status === "active" && (
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={rotateKey.isPending}
                              onClick={() =>
                                rotateKey.mutate(agent.id, {
                                  onSuccess: (issuedAgent) => setRotated(issuedAgent),
                                  onError: (err) => toast.error(problemMessage(err)),
                                })
                              }
                            >
                              Rotate key
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={revokeAgent.isPending}
                              onClick={() =>
                                revokeAgent.mutate(agent.id, {
                                  onError: (err) => toast.error(problemMessage(err)),
                                })
                              }
                            >
                              Revoke
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <RevealApiKeyDialog issued={rotated} onClose={() => setRotated(null)} />
    </div>
  );
}
