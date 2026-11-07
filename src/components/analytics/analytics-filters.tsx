"use client";

import { useMemo } from "react";
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
import type { AnalyticsPeriodFilters } from "@/lib/analytics/queries";

/** A practical shortlist, not every IANA zone - a searchable combobox would be
 * the fuller answer, but this app has no such component yet and a plain
 * <select> of ~400 zones is unusable. The viewer's own detected zone is
 * always added, so "my timezone" is never missing even if it's not listed. */
const COMMON_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Africa/Lagos",
  "Africa/Johannesburg",
  "Africa/Cairo",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
  "Pacific/Auckland",
];

const PRESETS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
];

export type AnalyticsFilterState = {
  from: string;
  to: string;
  tz: string;
};

export const DEFAULT_FILTERS: AnalyticsFilterState = { from: "", to: "", tz: "UTC" };

export function toApiFilters(form: AnalyticsFilterState): AnalyticsPeriodFilters {
  return {
    from: form.from ? new Date(`${form.from}T00:00:00`).toISOString() : undefined,
    to: form.to ? new Date(`${form.to}T00:00:00`).toISOString() : undefined,
    tz: form.tz || undefined,
  };
}

function toDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function AnalyticsFilters({
  value,
  onChange,
}: {
  value: AnalyticsFilterState;
  onChange: (next: AnalyticsFilterState) => void;
}) {
  const timezones = useMemo(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return Array.from(new Set([detected, ...COMMON_TIMEZONES]));
  }, []);

  const set = <K extends keyof AnalyticsFilterState>(key: K, v: AnalyticsFilterState[K]) =>
    onChange({ ...value, [key]: v });

  const applyPreset = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    onChange({ ...value, from: toDateInput(from), to: toDateInput(to) });
  };

  const isCustom = value.from === "" && value.to === "";

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Range</Label>
        <Select
          value="presets"
          onValueChange={(v) => {
            const preset = PRESETS.find((p) => p.label === v);
            if (preset) applyPreset(preset.days);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder={isCustom ? "Last 30 days (default)" : "Preset"} />
          </SelectTrigger>
          <SelectContent>
            {PRESETS.map((preset) => (
              <SelectItem key={preset.label} value={preset.label}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
        <Label className="text-xs text-muted-foreground">Timezone</Label>
        <Select value={value.tz} onValueChange={(v) => v && set("tz", v)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timezones.map((tz) => (
              <SelectItem key={tz} value={tz}>
                {tz}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!isCustom && (
        <Button variant="ghost" size="sm" onClick={() => onChange({ ...DEFAULT_FILTERS, tz: value.tz })}>
          Reset to default period
        </Button>
      )}
    </div>
  );
}
