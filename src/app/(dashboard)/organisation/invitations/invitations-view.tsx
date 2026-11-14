"use client";

import { toast } from "sonner";
import { Mail } from "lucide-react";
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
import { RefreshButton } from "@/components/shared/refresh-button";
import { InviteMemberDialog } from "@/components/invitations/invite-member-dialog";
import { problemMessage } from "@/lib/api/client";
import { useSession } from "@/lib/auth/session";
import { useMembers } from "@/lib/members/queries";
import { ROLE_LABEL, canManageMembers, selectableRoles } from "@/lib/members/roles";
import { useInvitations, useRevokeInvitation } from "@/lib/invitations/queries";

export function InvitationsView() {
  const { data, isPending, isFetching, isError, error, refetch } = useInvitations();
  const session = useSession();
  const members = useMembers();
  const revokeInvitation = useRevokeInvitation();

  const invitations = data?.data ?? [];
  const viewerRole = session.data?.role;
  // Owners and admins invite and revoke, with a verified email, and never
  // above their own role.
  const canInvite = canManageMembers(viewerRole) && session.data?.user.email_verified === true;
  const invitableRoles = selectableRoles(viewerRole);

  const emailById = new Map(members.data?.data.map((m) => [m.user.id, m.user.email]));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="Invitations"
          description="Pending invitations by email, with assigned role."
        />
        <div className="flex items-center gap-2">
          <RefreshButton onRefresh={() => refetch()} isRefreshing={isFetching} />
          {canManageMembers(viewerRole) && (
            <InviteMemberDialog disabled={!canInvite} invitableRoles={invitableRoles} />
          )}
        </div>
      </div>

      {isPending && <Skeleton className="h-64 w-full" />}
      {isError && <ErrorState error={error} onRetry={refetch} />}

      {data && invitations.length === 0 && (
        <EmptyState
          icon={Mail}
          title="No pending invitations"
          description="Invited teammates will appear here until they accept."
        />
      )}

      {data && invitations.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Invited by</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell className="font-medium">{invitation.email}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {ROLE_LABEL[invitation.role]}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {emailById.get(invitation.invited_by) ?? invitation.invited_by}
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {new Date(invitation.expires_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {canManageMembers(viewerRole) && (
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={revokeInvitation.isPending}
                          onClick={() =>
                            revokeInvitation.mutate(invitation.id, {
                              onError: (err) => toast.error(problemMessage(err)),
                            })
                          }
                        >
                          Revoke
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
