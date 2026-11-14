"use client";

import { Button } from "@/components/ui/button";

type Action = { label: string; pending?: boolean; onClick: () => void };

/**
 * The approve/reject (or confirm-only) button row every consent
 * decision ends with. Both buttons disable together, not just the one
 * that was clicked - the two mutations share one token, so firing both
 * at once (approve, then reject, before either settles) would send a
 * second decision against a token the first may have already spent.
 */
export function DecisionActions({ primary, secondary }: { primary: Action; secondary?: Action }) {
  const pending = primary.pending || secondary?.pending;
  return (
    <div className="flex gap-2">
      {secondary && (
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          disabled={pending}
          onClick={secondary.onClick}
        >
          {secondary.label}
        </Button>
      )}
      <Button type="button" className="flex-1" disabled={pending} onClick={primary.onClick}>
        {primary.label}
      </Button>
    </div>
  );
}
