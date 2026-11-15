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
import { CHECKOUT_STATUS_STYLE, type CheckoutStatus } from "./checkout-status-badge";
import type { CheckoutFilters } from "@/lib/commerce/checkouts";

const ALL_STATUSES = Object.keys(CHECKOUT_STATUS_STYLE) as CheckoutStatus[];
const CURRENCIES = ["USD", "EUR", "GBP"] as const;

export type FilterFormState = {
  from: string;
  to: string;
  status: string;
  currency: string;
  mandateId: string;
  customerId: string;
  agentId: string;
};

export const EMPTY_FILTERS: FilterFormState = {
  from: "",
  to: "",
  status: "all",
  currency: "all",
  mandateId: "",
  customerId: "",
  agentId: "",
};

export function toApiFilters(form: FilterFormState): CheckoutFilters {
  return {
    // Both inputs are datetime-local - a bare date string would parse as
    // UTC midnight, but a date+time string parses in the viewer's own local
    // time, which is what the picker actually shows them.
    from: form.from ? new Date(form.from).toISOString() : undefined,
    to: form.to ? new Date(form.to).toISOString() : undefined,
    status: form.status === "all" ? undefined : form.status,
    currency: form.currency === "all" ? undefined : (form.currency as CheckoutFilters["currency"]),
    mandate_id: form.mandateId || undefined,
    customer_id: form.customerId || undefined,
    agent_id: form.agentId || undefined,
  };
}

/**
 * No session-reachable directory lists commerce agents or customers by
 * name (GET /v1/commerce/agents|customers are merchant-key-only, with
 * no dashboard variant), so unlike treasury's Agent/Beneficiary
 * filters these are plain ID inputs, the same way Reference is free
 * text next to a dropdown on the treasury side.
 */
export function CheckoutsFilters({
  value,
  onChange,
}: {
  value: FilterFormState;
  onChange: (next: FilterFormState) => void;
}) {
  const isFiltered = JSON.stringify(value) !== JSON.stringify(EMPTY_FILTERS);

  const set = <K extends keyof FilterFormState>(key: K, v: FilterFormState[K]) =>
    onChange({ ...value, [key]: v });

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ck-from" className="text-xs text-muted-foreground">
          From
        </Label>
        <Input
          id="ck-from"
          type="datetime-local"
          className="h-8 w-52"
          value={value.from}
          onChange={(e) => set("from", e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ck-to" className="text-xs text-muted-foreground">
          To
        </Label>
        <Input
          id="ck-to"
          type="datetime-local"
          className="h-8 w-52"
          value={value.to}
          onChange={(e) => set("to", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Status</Label>
        <Select value={value.status} onValueChange={(v) => set("status", v ?? "all")}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {ALL_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {CHECKOUT_STATUS_STYLE[status].label}
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
        <Label htmlFor="ck-agent" className="text-xs text-muted-foreground">
          Agent ID
        </Label>
        <Input
          id="ck-agent"
          className="h-8 w-36 font-mono text-xs"
          placeholder="Exact match"
          value={value.agentId}
          onChange={(e) => set("agentId", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ck-customer" className="text-xs text-muted-foreground">
          Customer ID
        </Label>
        <Input
          id="ck-customer"
          className="h-8 w-36 font-mono text-xs"
          placeholder="Exact match"
          value={value.customerId}
          onChange={(e) => set("customerId", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ck-mandate" className="text-xs text-muted-foreground">
          Mandate ID
        </Label>
        <Input
          id="ck-mandate"
          className="h-8 w-36 font-mono text-xs"
          placeholder="Exact match"
          value={value.mandateId}
          onChange={(e) => set("mandateId", e.target.value)}
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
