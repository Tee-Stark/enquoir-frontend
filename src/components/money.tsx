import { cn } from "@/lib/utils";
import { formatMoney, type Money } from "@/lib/money";

/** Always shows the currency alongside the amount - never sum across these. */
export function MoneyDisplay({
  money,
  className,
}: {
  money: Money;
  className?: string;
}) {
  return (
    <span className={cn("tabular-nums", className)}>
      {formatMoney(money)}{" "}
      <span className="text-xs text-muted-foreground">{money.currency}</span>
    </span>
  );
}
