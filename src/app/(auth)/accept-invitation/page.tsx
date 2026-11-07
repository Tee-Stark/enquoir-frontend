import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AcceptInvitationForm } from "./accept-invitation-form";

export const metadata: Metadata = { title: "Accept invitation — Enquoir Cloud" };

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<Skeleton className="h-80 w-full" />}>
      <AcceptInvitationForm />
    </Suspense>
  );
}
