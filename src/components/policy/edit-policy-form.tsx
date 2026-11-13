"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/form/form-field";
import { FormError } from "@/components/form/form-error";
import { minorUnitsToMajorInput, parseMajorUnitsInput } from "@/lib/money";
import { useUpdatePolicy, type CurrencyRule, type PolicyVersion } from "@/lib/policy/queries";

const CURRENCIES = ["USD", "EUR", "GBP"] as const;
type Currency = (typeof CURRENCIES)[number];

const moneyField = z
  .string()
  .refine(
    (v) => parseMajorUnitsInput(v) !== null,
    "Enter an amount like 500 or 500.00, or leave blank for unlimited."
  );

const countField = z
  .string()
  .refine(
    (v) => v.trim() === "" || /^\d+$/.test(v.trim()),
    "Enter a whole number, or leave blank for unlimited."
  );

const currencyRuleSchema = z.object({
  max_transaction: moneyField,
  max_24h: moneyField,
  max_7d: moneyField,
  max_30d: moneyField,
  max_per_hour_count: countField,
  approval_threshold: moneyField,
});

const schema = z.object({
  USD: currencyRuleSchema,
  EUR: currencyRuleSchema,
  GBP: currencyRuleSchema,
  payee_allow: z.string(),
  payee_block: z.string(),
  category_block: z.string(),
});

type FormValues = z.infer<typeof schema>;

function ruleFor(policy: PolicyVersion, currency: Currency): CurrencyRule | undefined {
  return policy.currency_rules.find((r) => r.currency === currency);
}

function defaultRuleValues(policy: PolicyVersion, currency: Currency) {
  const rule = ruleFor(policy, currency);
  return {
    max_transaction: minorUnitsToMajorInput(rule?.max_transaction_minor ?? 0),
    max_24h: minorUnitsToMajorInput(rule?.max_24h_minor ?? 0),
    max_7d: minorUnitsToMajorInput(rule?.max_7d_minor ?? 0),
    max_30d: minorUnitsToMajorInput(rule?.max_30d_minor ?? 0),
    max_per_hour_count: rule?.max_per_hour_count ? String(rule.max_per_hour_count) : "",
    approval_threshold: minorUnitsToMajorInput(rule?.approval_threshold_minor ?? 0),
  };
}

/** Splits a textarea into trimmed, non-empty lines - the list-of-strings fields' editing format. */
function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function joinLines(values: string[]): string {
  return values.join("\n");
}

export function EditPolicyForm({ policy, canEdit }: { policy: PolicyVersion; canEdit: boolean }) {
  const updatePolicy = useUpdatePolicy();
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      USD: defaultRuleValues(policy, "USD"),
      EUR: defaultRuleValues(policy, "EUR"),
      GBP: defaultRuleValues(policy, "GBP"),
      payee_allow: joinLines(policy.payee_allow),
      payee_block: joinLines(policy.payee_block),
      category_block: joinLines(policy.category_block),
    },
  });

  const onSubmit = (values: FormValues) => {
    const currency_rules: CurrencyRule[] = CURRENCIES.map((currency) => {
      const f = values[currency];
      return {
        currency,
        max_transaction_minor: parseMajorUnitsInput(f.max_transaction) ?? 0,
        max_24h_minor: parseMajorUnitsInput(f.max_24h) ?? 0,
        max_7d_minor: parseMajorUnitsInput(f.max_7d) ?? 0,
        max_30d_minor: parseMajorUnitsInput(f.max_30d) ?? 0,
        max_per_hour_count: f.max_per_hour_count.trim() === "" ? 0 : Number(f.max_per_hour_count),
        approval_threshold_minor: parseMajorUnitsInput(f.approval_threshold) ?? 0,
      };
    });
    updatePolicy.mutate(
      {
        currency_rules,
        payee_allow: splitLines(values.payee_allow),
        payee_block: splitLines(values.payee_block),
        category_block: splitLines(values.category_block),
      },
      {
        onSuccess: (saved) => {
          toast.success(`Policy updated to version ${saved.version}.`);
          reset({
            USD: defaultRuleValues(saved, "USD"),
            EUR: defaultRuleValues(saved, "EUR"),
            GBP: defaultRuleValues(saved, "GBP"),
            payee_allow: joinLines(saved.payee_allow),
            payee_block: joinLines(saved.payee_block),
            category_block: joinLines(saved.category_block),
          });
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Edit policy</CardTitle>
        <CardDescription>
          Every save is a new version, never a mutation - past decisions keep reading back the
          version they used. Leave a field blank for unlimited.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="flex flex-col gap-6">
          {CURRENCIES.map((currency) => (
            <CurrencyRuleFieldset key={currency} currency={currency} register={register} errors={errors} />
          ))}

          <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-3">
            <FormField
              label="Payee allow list"
              htmlFor="payee_allow"
              hint="Treasury only, one per line. Empty means no restriction."
            >
              <Textarea id="payee_allow" rows={3} className="font-mono text-xs" {...register("payee_allow")} />
            </FormField>
            <FormField label="Payee block list" htmlFor="payee_block" hint="Treasury only, one per line.">
              <Textarea id="payee_block" rows={3} className="font-mono text-xs" {...register("payee_block")} />
            </FormField>
            <FormField label="Category block list" htmlFor="category_block" hint="Commerce only, one per line.">
              <Textarea
                id="category_block"
                rows={3}
                className="font-mono text-xs"
                {...register("category_block")}
              />
            </FormField>
          </div>

          <FormError error={updatePolicy.error} setError={setError} />
          {!canEdit && (
            <p className="text-xs text-muted-foreground">Verify your email to save changes.</p>
          )}
        </CardContent>
        <CardFooter className="justify-end gap-2 border-t border-border">
          {isDirty && (
            <Button type="button" variant="ghost" onClick={() => reset()}>
              Discard changes
            </Button>
          )}
          <Button type="submit" disabled={!canEdit || updatePolicy.isPending || !isDirty}>
            {updatePolicy.isPending ? "Saving…" : "Save policy"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function CurrencyRuleFieldset({
  currency,
  register,
  errors,
}: {
  currency: Currency;
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
}) {
  const e = errors[currency];
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-foreground">{currency}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <FormField
          label="Per transaction"
          htmlFor={`${currency}-max_transaction`}
          error={e?.max_transaction?.message}
        >
          <Input
            id={`${currency}-max_transaction`}
            inputMode="decimal"
            placeholder="Unlimited"
            {...register(`${currency}.max_transaction`)}
          />
        </FormField>
        <FormField label="Rolling 24h" htmlFor={`${currency}-max_24h`} error={e?.max_24h?.message}>
          <Input
            id={`${currency}-max_24h`}
            inputMode="decimal"
            placeholder="Unlimited"
            {...register(`${currency}.max_24h`)}
          />
        </FormField>
        <FormField label="Rolling 7d" htmlFor={`${currency}-max_7d`} error={e?.max_7d?.message}>
          <Input
            id={`${currency}-max_7d`}
            inputMode="decimal"
            placeholder="Unlimited"
            {...register(`${currency}.max_7d`)}
          />
        </FormField>
        <FormField label="Rolling 30d" htmlFor={`${currency}-max_30d`} error={e?.max_30d?.message}>
          <Input
            id={`${currency}-max_30d`}
            inputMode="decimal"
            placeholder="Unlimited"
            {...register(`${currency}.max_30d`)}
          />
        </FormField>
        <FormField
          label="Payments per hour"
          htmlFor={`${currency}-max_per_hour_count`}
          error={e?.max_per_hour_count?.message}
        >
          <Input
            id={`${currency}-max_per_hour_count`}
            inputMode="numeric"
            placeholder="Unlimited"
            {...register(`${currency}.max_per_hour_count`)}
          />
        </FormField>
        <FormField
          label="Approval threshold"
          htmlFor={`${currency}-approval_threshold`}
          error={e?.approval_threshold?.message}
          hint="Above this, a payment waits for approval instead of going straight through."
        >
          <Input
            id={`${currency}-approval_threshold`}
            inputMode="decimal"
            placeholder="Never escalate"
            {...register(`${currency}.approval_threshold`)}
          />
        </FormField>
      </div>
    </div>
  );
}
