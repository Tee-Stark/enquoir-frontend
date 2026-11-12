import { Wordmark, SandboxBadge } from "@/components/shell/wordmark";

// Several pages under this layout (login's ?next=, verify-email's and
// reset-password's ?token=) read useSearchParams(), which is per-request by
// nature - there's no one static shell to prerender for the whole group,
// the same reasoning the (dashboard) layout documents for itself.
export const instant = false;

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-4 py-12">
      <Wordmark />
      <div className="w-full max-w-sm">{children}</div>
      <SandboxBadge />
    </div>
  );
}
