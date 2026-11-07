import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoneyDisplay } from "@/components/money";
import { PaymentStateBadge } from "./payment-state-badge";
import type { Payment } from "@/lib/payments/queries";

export function PaymentsTable({ payments }: { payments: Payment[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Key</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Beneficiary</TableHead>
          <TableHead>Reference</TableHead>
          <TableHead>Agent</TableHead>
          <TableHead>State</TableHead>
          <TableHead className="text-right">Submissions</TableHead>
          <TableHead className="text-right">Rail calls</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Last change</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.key}>
            <TableCell>
              <Link
                href={`/payments/${encodeURIComponent(payment.key)}`}
                className="font-mono text-xs text-primary hover:underline"
              >
                {payment.key}
              </Link>
            </TableCell>
            <TableCell>
              <MoneyDisplay money={payment.amount} />
            </TableCell>
            <TableCell className="text-muted-foreground">
              {payment.payee.name ?? payment.payee.id}
            </TableCell>
            <TableCell className="text-muted-foreground">{payment.reference}</TableCell>
            <TableCell className="text-muted-foreground">
              {payment.agent ? payment.agent.name ?? payment.agent.id : "Enquoir"}
            </TableCell>
            <TableCell>
              <PaymentStateBadge state={payment.state} />
            </TableCell>
            <TableCell className="text-right tabular-nums text-muted-foreground">
              {payment.submissions}
            </TableCell>
            <TableCell className="text-right tabular-nums text-muted-foreground">
              {payment.rail_calls}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {new Date(payment.created_at).toLocaleString()}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {payment.state_changed_at
                ? new Date(payment.state_changed_at).toLocaleString()
                : "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
