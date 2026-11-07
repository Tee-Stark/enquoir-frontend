"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@/lib/auth/session";
import { isApiError } from "@/lib/api/client";
import { ErrorState } from "@/components/feedback/error-state";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Gates the dashboard behind a real session. The session cookie is the only
 * source of truth - this never guesses from local state, it asks the
 * backend (via useSession, cached by TanStack Query) and redirects to
 * /login on an unauthenticated response.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data, isPending, isError, error } = useSession();
  const unauthenticated = isError && isApiError(error) && error.code === "unauthenticated";

  useEffect(() => {
    if (unauthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [unauthenticated, pathname, router]);

  if (isPending) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background">
        <Skeleton className="size-8 rounded-full" />
      </div>
    );
  }

  if (unauthenticated) {
    // Redirecting via the effect above - render nothing in the meantime.
    return null;
  }

  if (isError) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background px-4">
        <ErrorState error={error} className="max-w-md" />
      </div>
    );
  }

  if (!data) return null;

  return <>{children}</>;
}
