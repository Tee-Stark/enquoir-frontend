import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { LogInForm } from "./login-form";

export const metadata: Metadata = { title: "Log in — Enquoir Cloud" };

export default function LogInPage() {
  return (
    <Suspense fallback={<Skeleton className="h-80 w-full" />}>
      <LogInForm />
    </Suspense>
  );
}
