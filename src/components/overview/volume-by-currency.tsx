import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { components } from "@/lib/api/schema";

type Volume = components["schemas"]["AnalyticsSummary"]["volume"][number];

/** One row per currency, side by side - never added together. */
export function VolumeByCurrency({ volume }: { volume: Volume[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Applied volume</CardTitle>
        <CardDescription>By currency - never summed.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {volume.length === 0 ? (
          <p className="text-sm text-muted-foreground">No applied payments in this period.</p>
        ) : (
          volume.map((v) => (
            <div key={v.currency} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{v.currency}</span>
              <span className="tabular-nums text-foreground">
                {v.applied_amount}{" "}
                <span className="text-muted-foreground">({v.applied_count})</span>
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
