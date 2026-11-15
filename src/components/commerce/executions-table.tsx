import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMinorUnits } from "@/lib/money";
import { ExecutionStatusBadge } from "./execution-status-badge";
import type { Execution } from "@/lib/commerce/executions";

export function ExecutionsTable({ executions }: { executions: Execution[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Funding method</TableHead>
          <TableHead>Mandate</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {executions.map((execution) => (
          <TableRow key={execution.id}>
            <TableCell>
              <Link href={`/executions/${execution.id}`} className="font-mono text-xs text-primary hover:underline">
                {execution.id}
              </Link>
            </TableCell>
            <TableCell>{formatMinorUnits(execution.amount_minor, execution.currency as "USD" | "EUR" | "GBP")}</TableCell>
            <TableCell className="text-muted-foreground">
              {execution.funding_method.brand} •••• {execution.funding_method.last_four ?? "····"}
            </TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground">{execution.mandate_id}</TableCell>
            <TableCell>
              <ExecutionStatusBadge status={execution.status} />
            </TableCell>
            <TableCell className="text-muted-foreground">{new Date(execution.created_at).toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
