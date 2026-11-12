"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField } from "@/components/form/form-field";
import { FormError } from "@/components/form/form-error";
import { useSignUp } from "@/lib/auth/account";
import { emailSchema, passwordSchema } from "@/lib/auth/validation";

const schema = z.object({
  email: emailSchema,
  password: passwordSchema,
  organisation_name: z
    .string()
    .min(1, "Enter your organisation's name.")
    .max(100, "Must be at most 100 characters."),
});

type FormValues = z.infer<typeof schema>;

export function SignUpForm() {
  const router = useRouter();
  const signUp = useSignUp();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: FormValues) => {
    signUp.mutate(values, {
      onSuccess: () => router.push("/dashboard"),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your organisation</CardTitle>
        <CardDescription>
          Set up Enquoir Cloud for your team&apos;s agentic payments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <FormField label="Organisation name" htmlFor="organisation_name" error={errors.organisation_name?.message}>
            <Input
              id="organisation_name"
              autoComplete="organization"
              {...register("organisation_name")}
            />
          </FormField>
          <FormField label="Email" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
          </FormField>
          <FormField
            label="Password"
            htmlFor="password"
            error={errors.password?.message}
            hint="12 to 128 characters."
          >
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register("password")}
            />
          </FormField>
          <FormError error={signUp.error} setError={setError} />
          <Button type="submit" disabled={signUp.isPending} className="mt-1">
            {signUp.isPending ? "Creating your organisation…" : "Create organisation"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
