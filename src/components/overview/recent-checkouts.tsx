import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/empty-state";
import { formatMinorUnits } from "@/lib/money";
import { CheckoutStatusBadge } from "@/components/commerce/checkout-status-badge";
import type { Checkout } from "@/lib/commerce/checkouts";

export function RecentCheckouts({ checkouts }: { checkouts: Checkout[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent checkouts</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {checkouts.length === 0 ? (
          <EmptyState icon={ShoppingCart} title="No checkouts yet" className="border-none" />
        ) : (
          <ul className="divide-y divide-border">
            {checkouts.map((checkout) => (
              <li key={checkout.id}>
                <Link
                  href={`/checkouts/${checkout.id}`}
                  className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">{checkout.external_id}</span>
                    <span className="truncate font-mono text-xs text-muted-foreground">{checkout.id}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm text-foreground">
                      {formatMinorUnits(checkout.checkout.total_minor, checkout.checkout.currency as "USD" | "EUR" | "GBP")}
                    </span>
                    <CheckoutStatusBadge status={checkout.status} />
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
