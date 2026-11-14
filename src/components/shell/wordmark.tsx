import Image from "next/image";
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
      <Image
        src="/brand/enquoir-mark.png"
        alt=""
        width={28}
        height={28}
        className="size-7 shrink-0 object-contain"
      />
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
