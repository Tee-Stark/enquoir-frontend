"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Wordmark, SandboxBadge } from "./wordmark";
import { SidebarNav } from "./sidebar-nav";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon-sm" className="md:hidden" />}
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-sidebar p-0 text-sidebar-foreground">
        <SheetHeader className="border-b border-sidebar-border px-3 py-0">
          <div className="flex h-14 items-center justify-between">
            <Wordmark />
            <SheetTitle className="sr-only">Navigation</SheetTitle>
          </div>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-2 py-3">
          <SidebarNav onNavigate={() => setOpen(false)} />
        </div>
        <div className="border-t border-sidebar-border p-3">
          <SandboxBadge />
        </div>
      </SheetContent>
    </Sheet>
  );
}
