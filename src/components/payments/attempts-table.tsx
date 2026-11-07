import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { components } from "@/lib/api/schema";

type Attempt = components["schemas"]["Attempt"];

const KIND_LABEL: Record<Attempt["kind"], string> = {
  agent_submission: "Agent submission",
  rail_call: "Rail call",
};

/** Outcomes that mean "this attempt did not succeed," for visual emphasis only - never collapsed into one failure bucket for the payment itself. */
const UNHAPPY_OUTCOMES = new Set<Attempt["outcome"]>([
  "invalid",
  "payee_unknown",
  "error",
  "rejected",
  "ambiguous",
  "duplicate_transfers",
  "interrupted",
]);

export function AttemptsTable({ attempts }: { attempts: Attempt[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Kind</TableHead>
          <TableHead>Operation</TableHead>
          <TableHead>Outcome</TableHead>
          <TableHead>Agent</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Started</TableHead>
          <TableHead>Detail</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {attempts.map((attempt) => (
          <TableRow key={attempt.id}>
            <TableCell className="text-muted-foreground">{KIND_LABEL[attempt.kind]}</TableCell>
            <TableCell className="font-mono text-xs">{attempt.operation}</TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={
                  UNHAPPY_OUTCOMES.has(attempt.outcome)
                    ? "border-destructive/30 text-destructive"
                    : "border-success/30 text-success"
                }
              >
                {attempt.outcome}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {attempt.agent?.name ?? attempt.agent?.id ?? "—"}
            </TableCell>
            <TableCell className="tabular-nums text-muted-foreground">
              {attempt.duration_ms !== null ? `${attempt.duration_ms} ms` : "—"}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {new Date(attempt.started_at).toLocaleString()}
            </TableCell>
            <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
              {attempt.error_message ??
                (attempt.transfer_id ? `Transfer ${attempt.transfer_id}` : "—")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
