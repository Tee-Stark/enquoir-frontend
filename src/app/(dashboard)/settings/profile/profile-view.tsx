"use client";

import { toast } from "sonner";
import { CheckCircle2, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/feedback/error-state";
import { PageHeader } from "@/components/page-header";
import { useSession } from "@/lib/auth/session";
import { useResendVerificationEmail } from "@/lib/auth/verification";
import { problemMessage } from "@/lib/api/client";

export function ProfileView() {
  const { data, isPending, isError, error, refetch } = useSession();
  const resend = useResendVerificationEmail();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Profile" description="Your account and current organisation." />

      {isPending && <Skeleton className="h-48 w-full" />}
      {isError && <ErrorState error={error} onRetry={refetch} />}

      {data && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">{data.user.email}</p>
                <p className="text-xs text-muted-foreground">
                  Member since {new Date(data.user.created_at).toLocaleDateString()}
                </p>
              </div>
              {data.user.email_verified ? (
                <Badge variant="outline" className="gap-1 border-success/30 text-success">
                  <CheckCircle2 className="size-3" /> Verified
                </Badge>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="gap-1 border-warning/30 text-warning">
                    Unverified
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={resend.isPending || resend.isSuccess}
                    onClick={() =>
                      resend.mutate(undefined, {
                        onSuccess: () => toast.success("Verification email sent."),
                        onError: (err) => toast.error(problemMessage(err)),
                      })
                    }
                  >
                    <Mail className="size-3.5" />
                    {resend.isSuccess ? "Sent" : resend.isPending ? "Sending…" : "Resend"}
                  </Button>
                </div>
              )}
            </div>
            <div className="border-t border-border pt-4">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Current organisation
              </p>
              <p className="mt-1 text-sm text-foreground">{data.organisation.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{data.role}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
