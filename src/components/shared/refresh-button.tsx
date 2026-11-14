"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * A manual refresh action for pages whose data is a live status
 * (payment/agent/integration state, counts, a policy's current
 * version, ...) rather than something that only changes when the
 * viewer themselves acts - those pages already refetch on their own
 * mutations, but nothing else here pushes updates, so a person
 * watching for a change (an escalation to approve, a rail call to
 * settle) needs a way to ask again without reloading the page.
 */
export function RefreshButton({
  onRefresh,
  isRefreshing,
}: {
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  return (
    <Button
      variant="outline"
      size="icon-sm"
      onClick={onRefresh}
      disabled={isRefreshing}
      aria-label="Refresh"
    >
      <RefreshCw className={cn("size-3.5", isRefreshing && "animate-spin")} />
    </Button>
  );
}
