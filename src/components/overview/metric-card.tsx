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
  size = "default",
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: keyof typeof TONE_CLASS;
  size?: "default" | "lg";
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1.5 p-4">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <p
          className={cn(
            "font-semibold tabular-nums tracking-tight text-foreground",
            size === "lg" ? "text-3xl" : "text-2xl",
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
