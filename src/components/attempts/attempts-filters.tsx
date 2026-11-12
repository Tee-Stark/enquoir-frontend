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
import { useAgents } from "@/lib/agents/queries";
import type { AttemptFilters, AttemptKind, AttemptOperation, AttemptOutcome } from "@/lib/attempts/queries";

const KINDS: { value: AttemptKind; label: string }[] = [
  { value: "agent_submission", label: "Agent submission" },
  { value: "rail_call", label: "Rail call" },
];

const OPERATIONS: AttemptOperation[] = [
  "submit_intent",
  "create_transfer",
  "get_transfer",
  "find_transfer",
  "create_beneficiary",
  "find_beneficiary",
];

const OUTCOMES: AttemptOutcome[] = [
  "started",
  "attached",
  "deduplicated",
  "invalid",
  "payee_unknown",
  "error",
  "ok",
  "not_found",
  "rejected",
  "ambiguous",
  "duplicate_transfers",
  "in_progress",
  "interrupted",
];

export type FilterFormState = {
  from: string;
  to: string;
  kind: string;
  operation: string;
  outcome: string;
  agentId: string;
  intentKey: string;
};

export const EMPTY_FILTERS: FilterFormState = {
  from: "",
  to: "",
  kind: "all",
  operation: "all",
  outcome: "all",
  agentId: "all",
  intentKey: "",
};

export function toApiFilters(form: FilterFormState): AttemptFilters {
  return {
    // Both inputs are datetime-local - a bare date string would parse as
    // UTC midnight, but a date+time string parses in the viewer's own local
    // time, which is what the picker actually shows them.
    from: form.from ? new Date(form.from).toISOString() : undefined,
    to: form.to ? new Date(form.to).toISOString() : undefined,
    kind: form.kind === "all" ? undefined : (form.kind as AttemptKind),
    operation: form.operation === "all" ? undefined : (form.operation as AttemptOperation),
    outcome: form.outcome === "all" ? undefined : [form.outcome as AttemptOutcome],
    agent_id: form.agentId === "all" ? undefined : form.agentId,
    intent_key: form.intentKey || undefined,
  };
}

export function AttemptsFilters({
  value,
  onChange,
}: {
  value: FilterFormState;
  onChange: (next: FilterFormState) => void;
}) {
  const agents = useAgents();
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
          type="datetime-local"
          className="h-8 w-52"
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
          type="datetime-local"
          className="h-8 w-52"
          value={value.to}
          onChange={(e) => set("to", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Kind</Label>
        <Select value={value.kind} onValueChange={(v) => set("kind", v ?? "all")}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All kinds</SelectItem>
            {KINDS.map((kind) => (
              <SelectItem key={kind.value} value={kind.value}>
                {kind.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Operation</Label>
        <Select value={value.operation} onValueChange={(v) => set("operation", v ?? "all")}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All operations</SelectItem>
            {OPERATIONS.map((op) => (
              <SelectItem key={op} value={op}>
                {op}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Outcome</Label>
        <Select value={value.outcome} onValueChange={(v) => set("outcome", v ?? "all")}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All outcomes</SelectItem>
            {OUTCOMES.map((outcome) => (
              <SelectItem key={outcome} value={outcome}>
                {outcome}
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
        <Label htmlFor="intentKey" className="text-xs text-muted-foreground">
          Intent key
        </Label>
        <Input
          id="intentKey"
          className="h-8 w-40 font-mono text-xs"
          placeholder="Exact match"
          value={value.intentKey}
          onChange={(e) => set("intentKey", e.target.value)}
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
