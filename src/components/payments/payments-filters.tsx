"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAYMENT_STATE_STYLE, type PaymentState } from "./payment-state-badge";
import { useAgents } from "@/lib/agents/queries";
import { useBeneficiaries } from "@/lib/beneficiaries/queries";
import type { PaymentFilters } from "@/lib/payments/queries";

const ALL_STATES = Object.keys(PAYMENT_STATE_STYLE) as PaymentState[];

const CURRENCIES = ["USD", "EUR", "GBP"] as const;

export type FilterFormState = {
  from: string;
  to: string;
  state: string;
  currency: string;
  agentId: string;
  payee: string;
  reference: string;
};

export const EMPTY_FILTERS: FilterFormState = {
  from: "",
  to: "",
  state: "all",
  currency: "all",
  agentId: "all",
  payee: "all",
  reference: "",
};

export function toApiFilters(form: FilterFormState): PaymentFilters {
  return {
    from: form.from ? new Date(form.from).toISOString() : undefined,
    to: form.to ? new Date(form.to).toISOString() : undefined,
    state: form.state === "all" ? undefined : [form.state as PaymentState],
    currency: form.currency === "all" ? undefined : (form.currency as PaymentFilters["currency"]),
    agent_id: form.agentId === "all" ? undefined : form.agentId,
    payee: form.payee === "all" ? undefined : form.payee,
    reference: form.reference || undefined,
  };
}

export function PaymentsFilters({
  value,
  onChange,
}: {
  value: FilterFormState;
  onChange: (next: FilterFormState) => void;
}) {
  const agents = useAgents();
  const beneficiaries = useBeneficiaries();
  const isFiltered = JSON.stringify(value) !== JSON.stringify(EMPTY_FILTERS);

  const set = <K extends keyof FilterFormState>(key: K, v: FilterFormState[K]) =>
    onChange({ ...value, [key]: v });

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="from" className="text-xs text-muted-foreground">
          From
        </Label>
        <Input
          id="from"
          type="date"
          className="h-8 w-36"
          value={value.from}
          onChange={(e) => set("from", e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="to" className="text-xs text-muted-foreground">
          To
        </Label>
        <Input
          id="to"
          type="date"
          className="h-8 w-36"
          value={value.to}
          onChange={(e) => set("to", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">State</Label>
        <Select value={value.state} onValueChange={(v) => set("state", v ?? "all")}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All states</SelectItem>
            {ALL_STATES.map((state) => (
              <SelectItem key={state} value={state}>
                {PAYMENT_STATE_STYLE[state].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Currency</Label>
        <Select value={value.currency} onValueChange={(v) => set("currency", v ?? "all")}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All currencies</SelectItem>
            {CURRENCIES.map((currency) => (
              <SelectItem key={currency} value={currency}>
                {currency}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Agent</Label>
        <Select value={value.agentId} onValueChange={(v) => set("agentId", v ?? "all")}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All agents</SelectItem>
            {agents.data?.data.map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>
                {agent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Beneficiary</Label>
        <Select value={value.payee} onValueChange={(v) => set("payee", v ?? "all")}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All beneficiaries</SelectItem>
            {beneficiaries.data?.data.map((beneficiary) => (
              <SelectItem key={beneficiary.id} value={beneficiary.id}>
                {beneficiary.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reference" className="text-xs text-muted-foreground">
          Reference
        </Label>
        <Input
          id="reference"
          className="h-8 w-40"
          placeholder="Exact match"
          value={value.reference}
          onChange={(e) => set("reference", e.target.value)}
        />
      </div>

      {isFiltered && (
        <Button variant="ghost" size="sm" onClick={() => onChange(EMPTY_FILTERS)}>
          <X className="size-3.5" /> Clear filters
        </Button>
      )}
    </div>
  );
}
