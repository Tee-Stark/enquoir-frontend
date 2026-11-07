"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FormError } from "@/components/form/form-error";
import { useVerifyEmail } from "@/lib/auth/verification";

export function VerifyEmailPanel() {
  const token = useSearchParams().get("token");
  const verifyEmail = useVerifyEmail();
  const attempted = useRef(false);

  useEffect(() => {
    if (token && !attempted.current) {
      attempted.current = true;
      verifyEmail.mutate(token);
    }
  }, [token, verifyEmail]);

  if (!token) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="size-5 text-destructive" />
            Invalid link
          </CardTitle>
          <CardDescription>
            This verification link is missing its token.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (verifyEmail.isSuccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-success" />
            Email verified
          </CardTitle>
          <CardDescription>You&apos;re all set.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard" className={buttonVariants({ className: "w-full" })}>
            Go to dashboard
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (verifyEmail.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="size-5 text-destructive" />
            Couldn&apos;t verify this link
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <FormError error={verifyEmail.error} />
          <p className="text-sm text-muted-foreground">
            If you&apos;re signed in, you can send yourself a fresh link from
            Settings → Security.
          </p>
          <Link href="/login" className="text-sm font-medium text-primary hover:underline">
            Back to log in
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
          Verifying your email…
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
