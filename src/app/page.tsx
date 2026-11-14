import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Scale, ScrollText } from "lucide-react";
import { Wordmark } from "@/components/shell/wordmark";
import { GoToDashboardButton } from "@/components/marketing/go-to-dashboard-button";

export const metadata: Metadata = {
  title: "Enquoir — Agentic financial infrastructure",
  description:
    "Enquoir is the control plane for agentic finance. Define spending authority, enforce policies, authorise transactions, and maintain a clear audit trail across every financial action.",
};

const capabilities = [
  {
    icon: ShieldCheck,
    title: "Governance",
    description: "Define what agents are allowed to do with money.",
  },
  {
    icon: Scale,
    title: "Authorisation",
    description:
      "Evaluate financial actions against mandates and spending policies.",
  },
  {
    icon: ScrollText,
    title: "Auditability",
    description:
      "Maintain visibility into decisions, approvals, and transaction outcomes.",
  },
] as const;

// The public, unauthenticated front door. Deliberately a plain static page -
// no session reads, no dashboard data - so it loads for every visitor
// regardless of auth state. The only client-side piece is the CTA button,
// which checks the session on its own to decide where to send a click.
export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="border-b border-border/60">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Wordmark />
          <GoToDashboardButton size="sm" />
        </nav>
      </header>

      <main className="flex-1">
        <section className="bg-[url('/brand/enquoir-hero-bg.svg')] bg-cover bg-center bg-no-repeat px-4 py-24 sm:px-6 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
              Give your agents financial authority. Keep control.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-muted-foreground">
              Enquoir is the control plane for agentic finance. Define
              spending authority, enforce policies, authorise transactions,
              and maintain a clear audit trail across every financial
              action.
            </p>
            <div className="mt-10 flex justify-center">
              <GoToDashboardButton size="lg" />
            </div>
          </div>
        </section>

        <section className="border-t border-border/60 bg-card/30">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
            <div className="grid gap-8 sm:grid-cols-3">
              {capabilities.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex flex-col gap-3">
                  <Icon aria-hidden className="size-5 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border/60">
          <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl">
              Give your agents room to act. Keep every transaction
              accountable.
            </h2>
            <div className="mt-8 flex justify-center">
              <GoToDashboardButton size="lg" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <Wordmark />
          <p>&copy; 2026 Enquoir. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-foreground">
              Log in
            </Link>
            <Link href="/signup" className="hover:text-foreground">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
