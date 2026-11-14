"use client";

import { XCircle } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/feedback/error-state";
import { isApiError, problemMessage } from "@/lib/api/client";

/**
 * Owns the "read token from the URL, fetch what it's for, render it"
 * state machine every consent flow (mandate consent, revocation
 * confirmation, checkout approval) shares - the decision itself is each
 * flow's own, supplied as `children`.
 */
export function ConsentViewGate<T>({
  token,
  query,
  children,
}: {
  token: string | null;
  query: { data?: T; isPending: boolean; isError: boolean; error: unknown; refetch: () => void };
  children: (data: T) => React.ReactNode;
}) {
  if (!token) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="size-5 text-destructive" />
            Invalid link
          </CardTitle>
          <CardDescription>This link is missing its token.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (query.isPending) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (query.isError) {
    if (isApiError(query.error) && query.error.code === "token_invalid") {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="size-5 text-destructive" />
              This link no longer works
            </CardTitle>
            <CardDescription>{problemMessage(query.error)}</CardDescription>
          </CardHeader>
        </Card>
      );
    }
    return <ErrorState error={query.error} onRetry={query.refetch} />;
  }

  return <Card>{children(query.data as T)}</Card>;
}
