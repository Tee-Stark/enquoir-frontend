"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/feedback/error-state";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center">
      <ErrorState error={error} onRetry={reset} className="max-w-md" />
    </div>
  );
}
