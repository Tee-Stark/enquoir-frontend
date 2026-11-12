"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FormField } from "@/components/form/form-field";
import { FormError } from "@/components/form/form-error";
import { useAcceptInvitation } from "@/lib/auth/invitations";
import { passwordSchema } from "@/lib/auth/validation";

const schema = z.object({
  // Empty string means "I already have a verified account" - the backend
  // decides whether a password was actually required.
  password: z.union([z.literal(""), passwordSchema]),
});

type FormValues = z.infer<typeof schema>;

export function AcceptInvitationForm() {
  const router = useRouter();
  const token = useSearchParams().get("token");
  const acceptInvitation = useAcceptInvitation();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { password: "" } });

  if (!token) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="size-5 text-destructive" />
            Invalid invitation link
          </CardTitle>
          <CardDescription>This link is missing its token.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (acceptInvitation.isSuccess) {
    const result = acceptInvitation.data;
    const signedIn = result.account_created || result.account_claimed;
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-success" />
            You&apos;ve joined {result.organisation.name}
          </CardTitle>
          <CardDescription>
            {signedIn
              ? "You're signed in."
              : "Log in with your existing password to continue."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href={signedIn ? "/dashboard" : "/login"}
            className={buttonVariants({ className: "w-full" })}
          >
            {signedIn ? "Go to dashboard" : "Log in"}
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accept invitation</CardTitle>
        <CardDescription>
          If you don&apos;t already have a verified Enquoir account at this
          email, set a password to create one.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit((values) => {
            acceptInvitation.mutate(
              { token, password: values.password || undefined },
              { onSuccess: (result) => {
                  if (result.account_created || result.account_claimed) {
                    router.push("/dashboard");
                  }
                } }
            );
          })}
          className="flex flex-col gap-4"
          noValidate
        >
          <FormField
            label="Password"
            htmlFor="password"
            error={errors.password?.message}
            hint="Leave blank if you already have a verified account at this email."
          >
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register("password")}
            />
          </FormField>
          <FormError error={acceptInvitation.error} setError={setError} />
          <Button type="submit" disabled={acceptInvitation.isPending}>
            {acceptInvitation.isPending ? "Joining…" : "Accept invitation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
