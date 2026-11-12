"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useForgotPassword } from "@/lib/auth/password";
import { emailSchema } from "@/lib/auth/validation";

const schema = z.object({ email: emailSchema });
type FormValues = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const forgotPassword = useForgotPassword();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  if (forgotPassword.isSuccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MailCheck className="size-5 text-success" />
            Check your email
          </CardTitle>
          <CardDescription>
            If an account exists for that address, we&apos;ve sent a link to
            reset your password. It works once and expires in an hour.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>
          We&apos;ll email you a link if there&apos;s an account for that
          address.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit((values) => forgotPassword.mutate(values.email))}
          className="flex flex-col gap-4"
          noValidate
        >
          <FormField label="Email" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
          </FormField>
          <FormError error={forgotPassword.error} setError={setError} />
          <Button type="submit" disabled={forgotPassword.isPending}>
            {forgotPassword.isPending ? "Sending…" : "Send reset link"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
