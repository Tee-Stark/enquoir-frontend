"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Check, LogOut, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/lib/auth/session";
import { useLogOut, useSwitchOrganisation } from "@/lib/auth/account";
import { problemMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils";

export function SidebarUserMenu({ collapsed }: { collapsed?: boolean }) {
  const { data } = useSession();
  const switchOrganisation = useSwitchOrganisation();
  const logOut = useLogOut();

  if (!data) return null;

  const { user, organisation, organisations } = data;
  const initial = user.email[0]?.toUpperCase() ?? "?";
  const otherOrganisations = organisations?.filter((org) => org.id !== organisation.id) ?? [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-1.5 py-1.5 text-left transition-colors hover:bg-sidebar-accent/60",
          collapsed && "justify-center"
        )}
      >
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/25 text-xs font-semibold text-primary">
          {initial}
        </span>
        {!collapsed && (
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-xs font-medium text-sidebar-foreground">
              {organisation.name}
            </span>
            <span className="truncate text-[11px] text-sidebar-foreground/50">
              {user.email}
            </span>
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" className="w-56">
        <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
        {otherOrganisations.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Switch organisation</DropdownMenuLabel>
            <DropdownMenuItem disabled className="opacity-100">
              <Check className="size-3.5" />
              {organisation.name}
            </DropdownMenuItem>
            {otherOrganisations.map((org) => (
              <DropdownMenuItem
                key={org.id}
                disabled={switchOrganisation.isPending}
                onClick={() =>
                  switchOrganisation.mutate(org.id, {
                    onError: (error) => toast.error(problemMessage(error)),
                  })
                }
              >
                {org.name}
              </DropdownMenuItem>
            ))}
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/settings/profile" />}>
          <Settings /> Settings
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={() => logOut.mutate()}>
          <LogOut /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
