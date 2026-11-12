import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { UnverifiedBanner } from "./unverified-banner";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto w-full max-w-7xl">
            <UnverifiedBanner />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
