"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField } from "@/components/form/form-field";
import { FormError } from "@/components/form/form-error";
import { useLogIn } from "@/lib/auth/account";

const schema = z.object({
  email: z.string().min(1, "Enter your email address."),
  password: z.string().min(1, "Enter your password."),
});

type FormValues = z.infer<typeof schema>;

/**
 * Resolves against the app's own origin rather than a string-prefix check -
 * a naive startsWith("/") && !startsWith("//") still accepts a backslash
 * payload like "/\\evil.com", which the WHATWG URL parser (and so
 * Next.js's router) treats as "//evil.com" for a special scheme.
 */
export function isSafeNextPath(path: string | null): path is string {
  if (!path) return false;
  try {
    return new URL(path, window.location.origin).origin === window.location.origin;
  } catch {
    return false;
  }
}

export function LogInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const logIn = useLogIn();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: FormValues) => {
    logIn.mutate(values, {
      onSuccess: () => {
        const next = searchParams.get("next");
        router.push(isSafeNextPath(next) ? next : "/dashboard");
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log in</CardTitle>
        <CardDescription>Sign in to your Enquoir Cloud organisation.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <FormField label="Email" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
          </FormField>
          <FormField label="Password" htmlFor="password" error={errors.password?.message}>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register("password")}
            />
          </FormField>
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <FormError error={logIn.error} setError={setError} />
          <Button type="submit" disabled={logIn.isPending}>
            {logIn.isPending ? "Logging in…" : "Log in"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don&apos;t have an organisation yet?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
