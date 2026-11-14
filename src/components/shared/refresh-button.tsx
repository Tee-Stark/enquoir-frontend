"use client";

import { useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Keeps the spin visible at least this long. Most of these pages
 * refetch from a small, already-warm query - isRefreshing can flip
 * back to false within a few milliseconds, too fast for the
 * animation to read as anything happened at all.
 */
const MIN_SPIN_MS = 500;

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
  const [minSpinActive, setMinSpinActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Started from the click itself, not an effect watching isRefreshing -
  // that keeps the "turn it on" and "turn it off" sides owned by the
  // same ordinary event handler, with nothing racing to clear this
  // timer early just because the real fetch happened to finish first.
  // If the real fetch outlasts MIN_SPIN_MS, isRefreshing alone keeps
  // `spinning` true until it actually finishes.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleClick = () => {
    setMinSpinActive(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setMinSpinActive(false), MIN_SPIN_MS);
    onRefresh();
  };

  const spinning = isRefreshing || minSpinActive;

  return (
    <Button
      variant="outline"
      size="icon-sm"
      onClick={handleClick}
      disabled={spinning}
      aria-label="Refresh"
    >
      <RefreshCw className={cn("size-3.5", spinning && "animate-spin")} />
    </Button>
  );
}
