"use client";

import { toast } from "sonner";
import { Monitor } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { problemMessage } from "@/lib/api/client";
import {
  useAuthSessions,
  useRevokeOtherSessions,
  useRevokeSession,
} from "@/lib/auth/sessions-management";

export function SessionsView() {
  const { data, isPending, isError, error, refetch } = useAuthSessions();
  const revokeSession = useRevokeSession();
  const revokeOthers = useRevokeOtherSessions();

  const sessions = data?.data ?? [];
  const hasOtherSessions = sessions.some((session) => !session.current);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="Sessions"
          description="Every device currently signed in to your account, across all organisations."
        />
        <Button
          variant="outline"
          size="sm"
          disabled={!hasOtherSessions || revokeOthers.isPending}
          onClick={() =>
            revokeOthers.mutate(undefined, {
              onSuccess: () => toast.success("Signed out of every other session."),
              onError: (err) => toast.error(problemMessage(err)),
            })
          }
        >
          Sign out everywhere else
        </Button>
      </div>

      {isPending && <Skeleton className="h-48 w-full" />}
      {isError && <ErrorState error={error} onRetry={refetch} />}

      {data && sessions.length === 0 && (
        <EmptyState icon={Monitor} title="No active sessions" />
      )}

      {data && sessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active sessions</CardTitle>
            <CardDescription>Tokens are never shown - only revoked.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organisation</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">
                      {session.organisation.name}
                      {session.current && (
                        <Badge variant="outline" className="ml-2 border-primary/30 text-primary">
                          This device
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {new Date(session.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {new Date(session.expires_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={session.current || revokeSession.isPending}
                        onClick={() =>
                          revokeSession.mutate(session.id, {
                            onError: (err) => toast.error(problemMessage(err)),
                          })
                        }
                      >
                        Revoke
                      </Button>
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
