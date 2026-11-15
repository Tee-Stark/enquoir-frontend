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
import { EXECUTION_STATUS_STYLE, type ExecutionStatus } from "./execution-status-badge";
import type { ExecutionFilters } from "@/lib/commerce/executions";

const ALL_STATUSES = Object.keys(EXECUTION_STATUS_STYLE) as ExecutionStatus[];
const CURRENCIES = ["USD", "EUR", "GBP"] as const;

export type FilterFormState = {
  from: string;
  to: string;
  status: string;
  currency: string;
  mandateId: string;
  agentId: string;
};

export const EMPTY_FILTERS: FilterFormState = {
  from: "",
  to: "",
  status: "all",
  currency: "all",
  mandateId: "",
  agentId: "",
};

export function toApiFilters(form: FilterFormState): ExecutionFilters {
  return {
    // Both inputs are datetime-local - a bare date string would parse as
    // UTC midnight, but a date+time string parses in the viewer's own local
    // time, which is what the picker actually shows them.
    from: form.from ? new Date(form.from).toISOString() : undefined,
    to: form.to ? new Date(form.to).toISOString() : undefined,
    status: form.status === "all" ? undefined : (form.status as ExecutionStatus),
    currency: form.currency === "all" ? undefined : (form.currency as ExecutionFilters["currency"]),
    mandate_id: form.mandateId || undefined,
    agent_id: form.agentId || undefined,
  };
}

/**
 * No session-reachable directory lists commerce agents by name
 * (GET /v1/commerce/agents is merchant-key-only, with no dashboard
 * variant), so unlike treasury's Agent filter this is a plain ID
 * input, the same way Reference is free text next to a dropdown on
 * the treasury side.
 */
export function ExecutionsFilters({
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
        <Label htmlFor="exec-from" className="text-xs text-muted-foreground">
          From
        </Label>
        <Input
          id="exec-from"
          type="datetime-local"
          className="h-8 w-52"
          value={value.from}
          onChange={(e) => set("from", e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="exec-to" className="text-xs text-muted-foreground">
          To
        </Label>
        <Input
          id="exec-to"
          type="datetime-local"
          className="h-8 w-52"
          value={value.to}
          onChange={(e) => set("to", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Status</Label>
        <Select value={value.status} onValueChange={(v) => set("status", v ?? "all")}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {ALL_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {EXECUTION_STATUS_STYLE[status].label}
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
        <Label htmlFor="exec-agent" className="text-xs text-muted-foreground">
          Agent ID
        </Label>
        <Input
          id="exec-agent"
          className="h-8 w-36 font-mono text-xs"
          placeholder="Exact match"
          value={value.agentId}
          onChange={(e) => set("agentId", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="exec-mandate" className="text-xs text-muted-foreground">
          Mandate ID
        </Label>
        <Input
          id="exec-mandate"
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
