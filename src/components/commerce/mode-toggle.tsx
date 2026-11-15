"use client";

import { cn } from "@/lib/utils";

export type ActivityMode = "treasury" | "merchant";

// A stable array reference for usePersistedMode's `valid` parameter -
// passing a fresh `["treasury", "merchant"]` literal at the call site
// would defeat its internal useCallback memoization every render.
export const ACTIVITY_MODES = ["treasury", "merchant"] as const satisfies readonly ActivityMode[];

/**
 * The Payments/Activity pages' Treasury<->Merchant switch - per page,
 * not a global setting, so a visitor can be looking at treasury
 * payments and merchant activity at once in two tabs.
 */
export function ModeToggle({ value, onChange }: { value: ActivityMode; onChange: (mode: ActivityMode) => void }) {
  return (
    <div className="inline-flex items-center rounded-lg border border-border bg-muted/40 p-0.5" role="tablist">
      {(["treasury", "merchant"] as const).map((mode) => (
        <button
          key={mode}
          type="button"
          role="tab"
          aria-selected={value === mode}
          onClick={() => onChange(mode)}
          className={cn(
            "rounded-md px-3 py-1 text-sm font-medium transition-colors",
            value === mode
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {mode === "treasury" ? "Treasury" : "Merchant"}
        </button>
      ))}
    </div>
  );
}
