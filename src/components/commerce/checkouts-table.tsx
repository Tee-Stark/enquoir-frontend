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
import { CheckoutStatusBadge } from "./checkout-status-badge";
import type { Checkout } from "@/lib/commerce/checkouts";

export function CheckoutsTable({ checkouts }: { checkouts: Checkout[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>External ID</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Mandate</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Execution</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {checkouts.map((checkout) => (
          <TableRow key={checkout.id}>
            <TableCell>
              <Link href={`/checkouts/${checkout.id}`} className="font-mono text-xs text-primary hover:underline">
                {checkout.id}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">{checkout.external_id}</TableCell>
            <TableCell>{formatMinorUnits(checkout.checkout.total_minor, checkout.checkout.currency as "USD" | "EUR" | "GBP")}</TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground">{checkout.mandate_id}</TableCell>
            <TableCell>
              <CheckoutStatusBadge status={checkout.status} />
            </TableCell>
            <TableCell className="font-mono text-xs">
              {checkout.authorization?.execution_id ? (
                <Link href={`/executions/${checkout.authorization.execution_id}`} className="text-primary hover:underline">
                  {checkout.authorization.execution_id}
                </Link>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell className="text-muted-foreground">{new Date(checkout.created_at).toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
