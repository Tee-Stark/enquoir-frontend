"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { NAV_GROUPS } from "./nav-config";

/**
 * Cmd/Ctrl+K (or the topbar's Search button) jumps straight to any
 * dashboard section by name, without hunting through the sidebar -
 * reuses NAV_GROUPS as the single source of truth, so a new nav item
 * is searchable here for free. Open state is lifted to DashboardShell
 * so the topbar button and the shortcut drive the same dialog.
 */
export function CommandMenu({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Jump to"
      description="Search for a page to jump to"
    >
      <Command>
        <CommandInput placeholder="Jump to a page…" />
        <CommandList>
          <CommandEmpty>No matching page.</CommandEmpty>
          {NAV_GROUPS.map((group) => (
            <CommandGroup key={group.label ?? "primary"} heading={group.label ?? undefined}>
              {group.items.map((item) => (
                <CommandItem key={item.href} value={item.label} onSelect={() => go(item.href)}>
                  <item.icon />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
