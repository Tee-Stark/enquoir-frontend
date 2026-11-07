"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function RootError({
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
    <div className="flex h-dvh flex-col items-center justify-center gap-3 bg-background px-6 text-center">
      <p className="text-sm font-medium text-destructive">
        Something went wrong
      </p>
      <h1 className="text-xl font-semibold text-foreground">
        Enquoir Cloud hit an unexpected error
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        It&apos;s safe to try again. If this keeps happening, note what you
        were doing when it broke.
      </p>
      <Button onClick={reset} className="mt-2">
        Try again
      </Button>
    </div>
  );
}
