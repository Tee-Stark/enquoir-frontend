import type { LucideIcon } from "lucide-react";
import { Construction } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Honest "not built yet" content for a nav destination whose feature phase
 * hasn't landed. Never substitute fake data here - per the product spec,
 * missing functionality must read as missing, not simulated.
 */
export function PagePlaceholder({
  title,
  phase,
  description,
  icon: Icon = Construction,
}: {
  title: string;
  phase: number;
  description: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Icon className="size-4" />
            Not built yet
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          This module arrives in Phase {phase} of the implementation roadmap.
          The navigation and shell are real - the feature behind it isn&apos;t
          built yet, so nothing here is simulated.
        </CardContent>
      </Card>
    </div>
  );
}
