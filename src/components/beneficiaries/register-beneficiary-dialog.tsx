"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Landmark } from "lucide-react";
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
import { useRegisterBeneficiary } from "@/lib/beneficiaries/queries";

const schema = z.object({
  name: z.string().min(1, "Enter the payee's name."),
  account_number: z
    .string()
    .regex(/^\d{4,17}$/, "4 to 17 digits."),
  routing_number: z.string().regex(/^\d{9}$/, "A 9-digit ABA routing number."),
  account_category: z.enum(["Checking", "Savings"]),
  street: z.string().min(1, "Enter a street address."),
  city: z.string().min(1, "Enter a city."),
  state: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/, "A two-letter US state code, like WA."),
  postcode: z.string().regex(/^\d{5}(-\d{4})?$/, "A 5-digit ZIP or ZIP+4."),
});

type FormValues = z.infer<typeof schema>;

export function RegisterBeneficiaryDialog({ disabled }: { disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const registerBeneficiary = useRegisterBeneficiary();
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { account_category: "Checking" },
  });

  const onSubmit = (values: FormValues) => {
    registerBeneficiary.mutate(
      {
        name: values.name,
        account_number: values.account_number,
        routing_number: values.routing_number,
        account_category: values.account_category,
        address: {
          street: values.street,
          city: values.city,
          state: values.state,
          postcode: values.postcode,
        },
      },
      {
        onSuccess: () => {
          toast.success("Payee registered.");
          reset();
          setOpen(false);
        },
      }
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          reset();
          registerBeneficiary.reset();
        }
      }}
    >
      <DialogTrigger
        render={
          <Button disabled={disabled} size="sm">
            <Landmark /> Register payee
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Register payee</DialogTitle>
          <DialogDescription>
            A US company bank account paid in USD over ACH. Registering the
            same details again just returns the existing payee.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <FormField label="Name" htmlFor="ben-name" error={errors.name?.message}>
            <Input id="ben-name" {...register("name")} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Account number"
              htmlFor="ben-account"
              error={errors.account_number?.message}
            >
              <Input id="ben-account" inputMode="numeric" {...register("account_number")} />
            </FormField>
            <FormField
              label="Routing number"
              htmlFor="ben-routing"
              error={errors.routing_number?.message}
            >
              <Input id="ben-routing" inputMode="numeric" {...register("routing_number")} />
            </FormField>
          </div>
          <FormField label="Account type" htmlFor="ben-category">
            <Controller
              control={control}
              name="account_category"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="ben-category" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Checking">Checking</SelectItem>
                    <SelectItem value="Savings">Savings</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <FormField label="Street" htmlFor="ben-street" error={errors.street?.message}>
            <Input id="ben-street" {...register("street")} />
          </FormField>
          <div className="grid grid-cols-[1fr_auto_auto] gap-3">
            <FormField label="City" htmlFor="ben-city" error={errors.city?.message}>
              <Input id="ben-city" {...register("city")} />
            </FormField>
            <FormField label="State" htmlFor="ben-state" error={errors.state?.message}>
              <Input id="ben-state" className="w-16" maxLength={2} {...register("state")} />
            </FormField>
            <FormField label="ZIP" htmlFor="ben-postcode" error={errors.postcode?.message}>
              <Input id="ben-postcode" className="w-24" {...register("postcode")} />
            </FormField>
          </div>
          <FormError error={registerBeneficiary.error} />
          <DialogFooter showCloseButton>
            <Button type="submit" disabled={registerBeneficiary.isPending}>
              {registerBeneficiary.isPending ? "Registering…" : "Register"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
