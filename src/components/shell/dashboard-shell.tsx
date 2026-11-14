"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { UnverifiedBanner } from "./unverified-banner";
import { CommandMenu } from "./command-menu";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenSearch={() => setCommandOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto w-full max-w-7xl">
            <UnverifiedBanner />
            {children}
          </div>
        </main>
      </div>
      <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}
