"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/form/form-field";
import { FormError } from "@/components/form/form-error";
import { useInviteMember } from "@/lib/invitations/queries";
import type { Role } from "@/lib/members/queries";
import { ROLE_LABEL } from "@/lib/members/roles";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
  role: z.enum(["owner", "admin", "operator", "viewer"]),
});

type FormValues = z.infer<typeof schema>;

/** Roles nobody invites above their own - the dialog only ever offers up to it. */
export function InviteMemberDialog({
  disabled,
  invitableRoles,
}: {
  disabled?: boolean;
  invitableRoles: Role[];
}) {
  const [open, setOpen] = useState(false);
  const inviteMember = useInviteMember();
  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: invitableRoles.includes("viewer") ? "viewer" : invitableRoles[0] },
  });

  const onSubmit = (values: FormValues) => {
    inviteMember.mutate(values, {
      onSuccess: () => {
        toast.success(`Invitation sent to ${values.email}.`);
        reset();
        setOpen(false);
      },
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          reset();
          inviteMember.reset();
        }
      }}
    >
      <DialogTrigger
        render={
          <Button disabled={disabled} size="sm">
            <Mail /> Invite member
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>
          <DialogDescription>
            Emails a link, valid for 7 days. Inviting the same address again
            replaces the pending invitation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <FormField label="Email" htmlFor="invite-email" error={errors.email?.message}>
            <Input id="invite-email" type="email" autoFocus {...register("email")} />
          </FormField>
          <FormField label="Role" htmlFor="invite-role">
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="invite-role" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {invitableRoles.map((r) => (
                      <SelectItem key={r} value={r}>
                        {ROLE_LABEL[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <FormError error={inviteMember.error} setError={setError} />
          <DialogFooter showCloseButton>
            <Button type="submit" disabled={inviteMember.isPending}>
              {inviteMember.isPending ? "Sending…" : "Send invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
