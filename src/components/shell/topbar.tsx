import { MobileNav } from "./mobile-nav";
import { Wordmark, SandboxBadge } from "./wordmark";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80 md:px-6">
      <div className="flex items-center gap-2">
        <MobileNav />
        <div className="md:hidden">
          <Wordmark />
        </div>
      </div>
      <SandboxBadge className="hidden sm:inline-flex" />
    </header>
  );
}
