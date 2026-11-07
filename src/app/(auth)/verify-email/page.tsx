import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { VerifyEmailPanel } from "./verify-email-panel";

export const metadata: Metadata = { title: "Verify email — Enquoir Cloud" };

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
      <VerifyEmailPanel />
    </Suspense>
  );
}
