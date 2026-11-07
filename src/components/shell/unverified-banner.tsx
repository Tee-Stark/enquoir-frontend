"use client";

import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth/session";
import { useResendVerificationEmail } from "@/lib/auth/verification";
import { problemMessage } from "@/lib/api/client";

/**
 * Persistent, not dismissable - per the product spec, unverified users may
 * explore the app but must see clear restrictions on what they can't do yet
 * (create agents, invite members, register payees).
 */
export function UnverifiedBanner() {
  const { data } = useSession();
  const resend = useResendVerificationEmail();

  if (!data || data.user.email_verified) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
      <AlertTriangle className="size-4 shrink-0" />
      <p className="flex-1">
        Verify {data.user.email} to create agents, invite members, or
        register payees.
      </p>
      <Button
        variant="outline"
        size="sm"
        disabled={resend.isPending || resend.isSuccess}
        onClick={() =>
          resend.mutate(undefined, {
            onSuccess: () => toast.success("Verification email sent."),
            onError: (error) => toast.error(problemMessage(error)),
          })
        }
      >
        {resend.isSuccess ? "Sent" : resend.isPending ? "Sending…" : "Resend email"}
      </Button>
    </div>
  );
}
