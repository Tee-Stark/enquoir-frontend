import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { problemMessage } from "@/lib/api/client";

export function ErrorState({
  error,
  onRetry,
  className,
}: {
  error: unknown;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-destructive/40 px-6 py-12 text-center",
        className
      )}
    >
      <AlertTriangle className="mb-2 size-8 text-destructive" />
      <p className="text-sm font-medium text-foreground">
        Something went wrong
      </p>
      <p className="max-w-sm text-sm text-muted-foreground">
        {problemMessage(error)}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
          Try again
        </Button>
      )}
    </div>
  );
}
