import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/empty-state";
import { MoneyDisplay } from "@/components/money";
import { PaymentStateBadge } from "@/components/payments/payment-state-badge";
import type { Payment } from "@/lib/payments/queries";

export function RecentPayments({ payments }: { payments: Payment[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {payments.length === 0 ? (
          <EmptyState icon={ArrowLeftRight} title="No payments yet" className="border-none" />
        ) : (
          <ul className="divide-y divide-border">
            {payments.map((payment) => (
              <li key={payment.key}>
                <Link
                  href={`/payments/${encodeURIComponent(payment.key)}`}
                  className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">
                      {payment.payee.name ?? payment.payee.id}
                    </span>
                    <span className="truncate font-mono text-xs text-muted-foreground">
                      {payment.key}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <MoneyDisplay money={payment.amount} className="text-sm" />
                    <PaymentStateBadge state={payment.state} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
