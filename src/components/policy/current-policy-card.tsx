import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatMinorUnits } from "@/lib/money";
import type { CurrencyRule, PolicyVersion } from "@/lib/policy/queries";

const CURRENCIES = ["USD", "EUR", "GBP"] as const;

function cell(rule: CurrencyRule | undefined, minorUnits: number | undefined, currency: CurrencyRule["currency"]) {
  if (!rule || !minorUnits) return <span className="text-muted-foreground">Unlimited</span>;
  return formatMinorUnits(minorUnits, currency);
}

function PolicyLists({ policy }: { policy: PolicyVersion }) {
  const lists: { label: string; values: string[] }[] = [
    { label: "Payee allow list", values: policy.payee_allow },
    { label: "Payee block list", values: policy.payee_block },
    { label: "Category block list", values: policy.category_block },
  ];
  return (
    <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-3">
      {lists.map(({ label, values }) => (
        <div key={label}>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
          {values.length === 0 ? (
            <p className="mt-1 text-sm text-muted-foreground">None</p>
          ) : (
            <ul className="mt-1 flex flex-col gap-0.5 text-sm text-foreground">
              {values.map((v) => (
                <li key={v} className="font-mono text-xs">
                  {v}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

/** Any member may read the organisation's current spending policy - editing (EditPolicyForm) is owners/admins only. */
export function CurrentPolicyCard({ policy }: { policy: PolicyVersion }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Current policy</CardTitle>
        <CardDescription>
          {policy.version === 0
            ? "Version 0 - this organisation has never edited its policy; every limit is unlimited."
            : `Version ${policy.version}, saved ${new Date(policy.created_at!).toLocaleString()}${
                policy.created_by ? ` by ${policy.created_by}` : ""
              }.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Currency</TableHead>
              <TableHead>Per transaction</TableHead>
              <TableHead>Rolling 24h</TableHead>
              <TableHead>Rolling 7d</TableHead>
              <TableHead>Rolling 30d</TableHead>
              <TableHead>Per hour</TableHead>
              <TableHead>Approval threshold</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {CURRENCIES.map((currency) => {
              const rule = policy.currency_rules.find((r) => r.currency === currency);
              return (
                <TableRow key={currency}>
                  <TableCell className="font-medium">{currency}</TableCell>
                  <TableCell>{cell(rule, rule?.max_transaction_minor, currency)}</TableCell>
                  <TableCell>{cell(rule, rule?.max_24h_minor, currency)}</TableCell>
                  <TableCell>{cell(rule, rule?.max_7d_minor, currency)}</TableCell>
                  <TableCell>{cell(rule, rule?.max_30d_minor, currency)}</TableCell>
                  <TableCell>
                    {rule?.max_per_hour_count ? rule.max_per_hour_count : (
                      <span className="text-muted-foreground">Unlimited</span>
                    )}
                  </TableCell>
                  <TableCell>{cell(rule, rule?.approval_threshold_minor, currency)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <PolicyLists policy={policy} />
      </CardContent>
    </Card>
  );
}
