import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TONE_CLASS = {
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
  accent: "text-accent",
} as const;

export function MetricCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: keyof typeof TONE_CLASS;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 p-4">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p
          className={cn(
            "text-2xl font-semibold tabular-nums text-foreground",
            tone && TONE_CLASS[tone]
          )}
        >
          {value}
        </p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
