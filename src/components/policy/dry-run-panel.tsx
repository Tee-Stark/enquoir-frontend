"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/form/form-field";
import { FormError } from "@/components/form/form-error";
import { parseMajorUnitsInput } from "@/lib/money";
import { useDryRunPolicy, type PolicyDecision } from "@/lib/policy/queries";

const schema = z.object({
  context: z.enum(["treasury", "commerce"]),
  currency: z.enum(["USD", "EUR", "GBP"]),
  amount: z
    .string()
    .min(1, "Enter an amount.")
    .refine((v) => {
      const minor = parseMajorUnitsInput(v);
      return minor !== null && minor > 0;
    }, "Enter a positive amount like 500 or 500.00."),
  payee: z.string(),
  categories: z.string(),
});

type FormValues = z.infer<typeof schema>;

const OUTCOME_STYLE: Record<PolicyDecision["outcome"], { label: string; className: string }> = {
  allow: { label: "Allow", className: "border-success/30 text-success" },
  deny: { label: "Deny", className: "border-destructive/30 text-destructive" },
  escalate: { label: "Escalate", className: "border-warning/30 text-warning" },
};

/**
 * Evaluates a candidate payment without moving or reserving anything -
 * owners and admins only. Shares the same evaluation submission goes
 * through, so this can never drift from what submitting the real
 * thing would actually do.
 */
export function DryRunPanel() {
  const dryRun = useDryRunPolicy();
  const [result, setResult] = useState<PolicyDecision | null>(null);
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { context: "treasury", currency: "USD", amount: "", payee: "", categories: "" },
  });

  const context = useWatch({ control, name: "context" });

  const onSubmit = (values: FormValues) => {
    setResult(null);
    dryRun.mutate(
      {
        context: values.context,
        currency: values.currency,
        amount_minor: parseMajorUnitsInput(values.amount) ?? 0,
        payee: values.context === "treasury" && values.payee.trim() ? values.payee.trim() : undefined,
        categories:
          values.context === "commerce" && values.categories.trim()
            ? values.categories.split(",").map((c) => c.trim()).filter(Boolean)
            : undefined,
      },
      { onSuccess: setResult }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Dry run</CardTitle>
        <CardDescription>
          Preview how a candidate payment would be decided, without moving or reserving anything.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <FormField label="Context" htmlFor="dryrun-context">
              <Controller
                control={control}
                name="context"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="dryrun-context" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="treasury">Treasury</SelectItem>
                      <SelectItem value="commerce">Commerce</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField label="Currency" htmlFor="dryrun-currency">
              <Controller
                control={control}
                name="currency"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="dryrun-currency" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField label="Amount" htmlFor="dryrun-amount" error={errors.amount?.message}>
              <Input id="dryrun-amount" inputMode="decimal" placeholder="500.00" {...register("amount")} />
            </FormField>
            {context === "treasury" ? (
              <FormField label="Payee (optional)" htmlFor="dryrun-payee">
                <Input id="dryrun-payee" placeholder="Beneficiary ID" {...register("payee")} />
              </FormField>
            ) : (
              <FormField label="Categories (optional)" htmlFor="dryrun-categories" hint="Comma-separated">
                <Input id="dryrun-categories" placeholder="electronics, gifts" {...register("categories")} />
              </FormField>
            )}
          </div>

          <FormError error={dryRun.error} setError={setError} />

          {result && (
            <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={OUTCOME_STYLE[result.outcome].className}>
                  {OUTCOME_STYLE[result.outcome].label}
                </Badge>
                <span className="text-xs text-muted-foreground">against policy version {result.policy_version}</span>
              </div>
              {result.reasons.length > 0 && (
                <ul className="flex flex-col gap-1 text-sm text-foreground">
                  {result.reasons.map((reason, i) => (
                    <li key={i}>{reason.detail}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </CardContent>
        <CardContent className="pt-0">
          <Button type="submit" variant="outline" disabled={dryRun.isPending}>
            {dryRun.isPending ? "Evaluating…" : "Run"}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
