import { NAV_GROUPS } from "./nav-config";
import { NavLink } from "./nav-link";
import { cn } from "@/lib/utils";

export function SidebarNav({
  collapsed,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-4">
      {NAV_GROUPS.map((group) => (
        <div key={group.label ?? "primary"} className="flex flex-col gap-1">
          {group.label && !collapsed && (
            <p className="px-2.5 pb-1 text-xs font-medium tracking-wide text-sidebar-foreground/40 uppercase">
              {group.label}
            </p>
          )}
          {group.label && collapsed && (
            <div className="mx-2.5 my-1 h-px bg-sidebar-border" />
          )}
          <div className={cn("flex flex-col gap-0.5")}>
            {group.items.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
