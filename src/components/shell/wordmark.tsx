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
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
        E
      </span>
      {!collapsed && (
        <span className="text-[15px] font-semibold tracking-tight text-sidebar-foreground">
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
        "inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-2.5 py-0.5 font-mono text-[11px] font-medium tracking-wide text-warning uppercase",
        className
      )}
    >
      <span className="size-1.5 animate-pulse rounded-full bg-warning" />
      Sandbox
    </span>
  );
}
