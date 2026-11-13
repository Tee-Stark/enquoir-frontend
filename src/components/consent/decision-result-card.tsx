import { CheckCircle2, Info, XCircle, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TONE: Record<"success" | "neutral" | "destructive", { icon: LucideIcon; className: string }> = {
  success: { icon: CheckCircle2, className: "text-success" },
  neutral: { icon: Info, className: "text-muted-foreground" },
  destructive: { icon: XCircle, className: "text-destructive" },
};

/** The terminal card every consent decision ends on - no dashboard link, the customer has no account here. */
export function DecisionResultCard({
  tone,
  title,
  description,
  action,
}: {
  tone: "success" | "neutral" | "destructive";
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  const { icon: Icon, className } = TONE[tone];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className={cn("size-5", className)} />
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      {action && <CardContent>{action}</CardContent>}
    </Card>
  );
}
