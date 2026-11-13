import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { RevocationPanel } from "./panel";

export const metadata: Metadata = { title: "Confirm revocation — Enquoir Cloud" };

export default function RevocationPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <RevocationPanel />
    </Suspense>
  );
}
