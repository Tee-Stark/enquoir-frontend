import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileNav } from "./mobile-nav";
import { Wordmark, SandboxBadge } from "./wordmark";

export function Topbar({ onOpenSearch }: { onOpenSearch: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80 md:px-6">
      <div className="flex items-center gap-2">
        <MobileNav />
        <div className="md:hidden">
          <Wordmark />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          className="text-muted-foreground"
          onClick={onOpenSearch}
        >
          <Search className="size-3.5" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="ml-1 hidden rounded border border-border bg-muted px-1 font-mono text-[10px] sm:inline">
            ⌘K
          </kbd>
        </Button>
        <SandboxBadge className="hidden sm:inline-flex" />
      </div>
    </header>
  );
}
