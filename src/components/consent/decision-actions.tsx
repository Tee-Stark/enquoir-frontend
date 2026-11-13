"use client";

import { Button } from "@/components/ui/button";

type Action = { label: string; pending?: boolean; onClick: () => void };

/** The approve/reject (or confirm-only) button row every consent decision ends with. */
export function DecisionActions({ primary, secondary }: { primary: Action; secondary?: Action }) {
  return (
    <div className="flex gap-2">
      {secondary && (
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          disabled={secondary.pending}
          onClick={secondary.onClick}
        >
          {secondary.label}
        </Button>
      )}
      <Button type="button" className="flex-1" disabled={primary.pending} onClick={primary.onClick}>
        {primary.label}
      </Button>
    </div>
  );
}
