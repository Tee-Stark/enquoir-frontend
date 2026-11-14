import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MandateConsentPanel } from "./panel";

export const metadata: Metadata = { title: "Approve mandate — Enquoir Cloud" };

export default function MandateConsentPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <MandateConsentPanel />
    </Suspense>
  );
}
