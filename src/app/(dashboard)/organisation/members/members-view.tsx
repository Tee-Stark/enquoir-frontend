"use client";

import { toast } from "sonner";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { problemMessage } from "@/lib/api/client";
import { useSession } from "@/lib/auth/session";
import {
  useChangeMemberRole,
  useMembers,
  useRemoveMember,
  type Role,
} from "@/lib/members/queries";

const ROLES: Role[] = ["owner", "admin", "operator", "viewer"];
const ROLE_RANK: Record<Role, number> = { owner: 4, admin: 3, operator: 2, viewer: 1 };
const ROLE_LABEL: Record<Role, string> = {
  owner: "Owner",
  admin: "Admin",
  operator: "Operator",
  viewer: "Viewer",
};

export function MembersView() {
  const { data, isPending, isError, error, refetch } = useMembers();
  const session = useSession();
  const changeRole = useChangeMemberRole();
  const removeMember = useRemoveMember();

  const members = data?.data ?? [];
  const viewerId = session.data?.user.id;
  const viewerRole = session.data?.role;
  // Only owners and admins invite, remove, or change roles for others - and
  // never above their own role; an admin can't touch another admin or owner.
  const canManageOthers = viewerRole === "owner" || viewerRole === "admin";

  const canEditMember = (memberRole: Role) =>
    canManageOthers &&
    (viewerRole === "owner" || ROLE_RANK[memberRole] < ROLE_RANK["admin"]);

  const selectableRoles = viewerRole
    ? ROLES.filter((r) => ROLE_RANK[r] <= ROLE_RANK[viewerRole])
    : [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Members"
        description="The people in this organisation, their roles, and role changes."
      />

      {isPending && <Skeleton className="h-64 w-full" />}
      {isError && <ErrorState error={error} onRetry={refetch} />}

      {data && members.length === 0 && (
        <EmptyState icon={Users} title="No members" />
      )}

      {data && members.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => {
                  const isSelf = member.user.id === viewerId;
                  const editable = canEditMember(member.role);
                  return (
                    <TableRow key={member.user.id}>
                      <TableCell className="font-medium">
                        {member.user.email}
                        {isSelf && (
                          <Badge variant="outline" className="ml-2 border-primary/30 text-primary">
                            You
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {editable ? (
                          <Select
                            value={member.role}
                            onValueChange={(next) =>
                              changeRole.mutate(
                                { id: member.user.id, role: next as Role },
                                { onError: (err) => toast.error(problemMessage(err)) }
                              )
                            }
                          >
                            <SelectTrigger size="sm" className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {selectableRoles.map((r) => (
                                <SelectItem key={r} value={r}>
                                  {ROLE_LABEL[r]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {ROLE_LABEL[member.role]}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="tabular-nums text-muted-foreground">
                        {new Date(member.joined_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {(isSelf || editable) && (
                          <Button
                            variant={isSelf ? "outline" : "destructive"}
                            size="sm"
                            disabled={removeMember.isPending}
                            onClick={() =>
                              removeMember.mutate(member.user.id, {
                                onError: (err) => toast.error(problemMessage(err)),
                              })
                            }
                          >
                            {isSelf ? "Leave" : "Remove"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
