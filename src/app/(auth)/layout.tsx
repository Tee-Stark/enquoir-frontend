import { Wordmark, SandboxBadge } from "@/components/shell/wordmark";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-4 py-12">
      <Wordmark />
      <div className="w-full max-w-sm">{children}</div>
      <SandboxBadge />
    </div>
  );
}
