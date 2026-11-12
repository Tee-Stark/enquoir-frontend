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
import { useChangeMemberRole, useMembers, useRemoveMember, type Role } from "@/lib/members/queries";
import { ROLE_LABEL, canEditMemberWithRole, selectableRoles } from "@/lib/members/roles";

export function MembersView() {
  const { data, isPending, isError, error, refetch } = useMembers();
  const session = useSession();
  const changeRole = useChangeMemberRole();
  const removeMember = useRemoveMember();

  const members = data?.data ?? [];
  const viewerId = session.data?.user.id;
  const viewerRole = session.data?.role;

  const canEditMember = (memberRole: Role) => canEditMemberWithRole(viewerRole, memberRole);
  const assignableRoles = selectableRoles(viewerRole);

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
                              {assignableRoles.map((r) => (
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
