import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckoutApprovalPanel } from "./panel";

export const metadata: Metadata = { title: "Approve checkout — Enquoir Cloud" };

export default function CheckoutApprovalPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <CheckoutApprovalPanel />
    </Suspense>
  );
}
