import { ShieldCheck, ShieldX } from "lucide-react";
import { cn } from "@/lib/utils";
import type { components } from "@/lib/api/schema";

type Chain = components["schemas"]["PaymentDetail"]["chain"];

/**
 * Shows exactly what the backend verified - never independently inferred
 * from whether hashes are merely present. `chain.valid`/`chain.error` are
 * the only source of truth here.
 */
export function HashChainBadge({ chain, className }: { chain: Chain; className?: string }) {
  if (chain.valid) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-sm font-medium text-success",
          className
        )}
      >
        <ShieldCheck className="size-4" />
        Chain verified
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-sm font-medium text-destructive",
        className
      )}
    >
      <ShieldX className="size-4" />
      Verification failed{chain.error ? `: ${chain.error}` : ""}
    </span>
  );
}
