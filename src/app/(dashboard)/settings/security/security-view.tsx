"use client";

import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField } from "@/components/form/form-field";
import { FormError } from "@/components/form/form-error";
import { PageHeader } from "@/components/page-header";
import { useChangePassword } from "@/lib/auth/password";
import { passwordSchema } from "@/lib/auth/validation";

const schema = z
  .object({
    current_password: z.string().min(1, "Enter your current password."),
    new_password: passwordSchema,
    confirm: z.string(),
  })
  .refine((values) => values.new_password === values.confirm, {
    message: "Passwords don't match.",
    path: ["confirm"],
  });

type FormValues = z.infer<typeof schema>;

export function SecurityView() {
  const changePassword = useChangePassword();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: FormValues) => {
    changePassword.mutate(
      { current_password: values.current_password, new_password: values.new_password },
      {
        onSuccess: () => {
          toast.success("Password changed. Every other session was signed out.");
          reset();
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Security" description="Change your password." />
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-base">Change password</CardTitle>
          <CardDescription>
            Signs you out of every other session and emails you a notice.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <FormField
              label="Current password"
              htmlFor="current_password"
              error={errors.current_password?.message}
            >
              <Input
                id="current_password"
                type="password"
                autoComplete="current-password"
                {...register("current_password")}
              />
            </FormField>
            <FormField
              label="New password"
              htmlFor="new_password"
              error={errors.new_password?.message}
              hint="12 to 128 characters."
            >
              <Input
                id="new_password"
                type="password"
                autoComplete="new-password"
                {...register("new_password")}
              />
            </FormField>
            <FormField label="Confirm new password" htmlFor="confirm" error={errors.confirm?.message}>
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                {...register("confirm")}
              />
            </FormField>
            <FormError error={changePassword.error} setError={setError} />
            <Button type="submit" disabled={changePassword.isPending} className="self-start">
              {changePassword.isPending ? "Changing…" : "Change password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
