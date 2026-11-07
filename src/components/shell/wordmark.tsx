import { cn } from "@/lib/utils";

export function Wordmark({
  collapsed,
  className,
}: {
  collapsed?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
        E
      </span>
      {!collapsed && (
        <span className="text-base font-semibold tracking-tight text-sidebar-foreground">
          Enquoir
        </span>
      )}
    </div>
  );
}

export function SandboxBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning",
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-warning" />
      Sandbox environment
    </span>
  );
}
