import { AuthGuard } from "@/components/auth/auth-guard";
import { DashboardShell } from "@/components/shell/dashboard-shell";

// Every dashboard page is behind a client-side session check and renders
// per-organisation backend data - there's no meaningful static shell to
// prerender here, so this segment opts out of Cache Components' static
// shell / instant-navigation validation rather than fighting it page by
// page. See the Next.js "Authentication with Cache Components" guide and
// the `instant` route segment config docs.
export const instant = false;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
