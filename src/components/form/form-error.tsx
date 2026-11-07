import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { problemMessage } from "@/lib/api/client";

export function FormError({ error }: { error: unknown }) {
  if (!error) return null;
  return (
    <Alert variant="destructive">
      <AlertCircle />
      <AlertDescription>{problemMessage(error)}</AlertDescription>
    </Alert>
  );
}
