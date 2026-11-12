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
import { useMembers } from "@/lib/members/queries";
import type { AuditLogFilters } from "@/lib/audit-log/queries";

/** Every action the backend's audit log can record, per the OpenAPI description. */
const ACTIONS = [
  "auth.logged_in",
  "auth.password_changed",
  "auth.sessions_revoked",
  "member.invited",
  "invitation.revoked",
  "invitation.accepted",
  "member.role_changed",
  "member.removed",
  "member.left",
  "agent.created",
  "agent.key_rotated",
  "agent.revoked",
  "payee.registered",
];

export type FilterFormState = {
  from: string;
  to: string;
  action: string;
  actorId: string;
};

export const EMPTY_FILTERS: FilterFormState = {
  from: "",
  to: "",
  action: "all",
  actorId: "all",
};

export function toApiFilters(form: FilterFormState): AuditLogFilters {
  return {
    // Both inputs are datetime-local - a bare date string would parse as
    // UTC midnight, but a date+time string parses in the viewer's own local
    // time, which is what the picker actually shows them.
    from: form.from ? new Date(form.from).toISOString() : undefined,
    to: form.to ? new Date(form.to).toISOString() : undefined,
    action: form.action === "all" ? undefined : form.action,
    actor_id: form.actorId === "all" ? undefined : form.actorId,
  };
}

export function AuditLogFiltersBar({
  value,
  onChange,
}: {
  value: FilterFormState;
  onChange: (next: FilterFormState) => void;
}) {
  const members = useMembers();
  const isFiltered = JSON.stringify(value) !== JSON.stringify(EMPTY_FILTERS);

  const set = <K extends keyof FilterFormState>(key: K, v: FilterFormState[K]) =>
    onChange({ ...value, [key]: v });

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="audit-from" className="text-xs text-muted-foreground">
          From
        </Label>
        <Input
          id="audit-from"
          type="datetime-local"
          className="h-8 w-52"
          value={value.from}
          onChange={(e) => set("from", e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="audit-to" className="text-xs text-muted-foreground">
          To
        </Label>
        <Input
          id="audit-to"
          type="datetime-local"
          className="h-8 w-52"
          value={value.to}
          onChange={(e) => set("to", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Action</Label>
        <Select value={value.action} onValueChange={(v) => set("action", v ?? "all")}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            {ACTIONS.map((action) => (
              <SelectItem key={action} value={action}>
                {action}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Actor</Label>
        <Select value={value.actorId} onValueChange={(v) => set("actorId", v ?? "all")}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Everyone</SelectItem>
            {members.data?.data.map((member) => (
              <SelectItem key={member.user.id} value={member.user.id}>
                {member.user.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isFiltered && (
        <Button variant="ghost" size="sm" onClick={() => onChange(EMPTY_FILTERS)}>
          <X className="size-3.5" /> Clear filters
        </Button>
      )}
    </div>
  );
}
