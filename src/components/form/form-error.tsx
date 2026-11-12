"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isApiError, problemMessage } from "@/lib/api/client";

/**
 * Renders the backend's Problem detail as a banner, and - when the error is
 * validation_failed and names a field, and the caller passes its form's
 * setError - also highlights that field, so a server-side validation error
 * the client's own Zod schema didn't catch still points at the right input.
 */
export function FormError<TFieldValues extends FieldValues = FieldValues>({
  error,
  setError,
}: {
  error: unknown;
  setError?: UseFormSetError<TFieldValues>;
}) {
  useEffect(() => {
    if (setError && isApiError(error) && error.code === "validation_failed" && error.field) {
      setError(error.field as Path<TFieldValues>, {
        type: "server",
        message: problemMessage(error),
      });
    }
  }, [error, setError]);

  if (!error) return null;
  return (
    <Alert variant="destructive">
      <AlertCircle />
      <AlertDescription>{problemMessage(error)}</AlertDescription>
    </Alert>
  );
}
