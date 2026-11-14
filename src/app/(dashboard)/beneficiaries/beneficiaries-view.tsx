"use client";

import { Landmark } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ErrorState } from "@/components/feedback/error-state";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageHeader } from "@/components/page-header";
import { RegisterBeneficiaryDialog } from "@/components/beneficiaries/register-beneficiary-dialog";
import { RefreshButton } from "@/components/shared/refresh-button";
import { useSession } from "@/lib/auth/session";
import { useBeneficiaries } from "@/lib/beneficiaries/queries";

export function BeneficiariesView() {
  const { data, isPending, isFetching, isError, error, refetch } = useBeneficiaries();
  const session = useSession();

  const beneficiaries = data?.data ?? [];
  const role = session.data?.role;
  // Operators and above register payees from the dashboard - and only once
  // the email is verified, per the product spec's verification gate.
  const canRegister =
    (role === "owner" || role === "admin" || role === "operator") &&
    session.data?.user.email_verified === true;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="Beneficiaries"
          description="Payees registered on the rail before they can be paid."
        />
        <div className="flex items-center gap-2">
          <RefreshButton onRefresh={() => refetch()} isRefreshing={isFetching} />
          <RegisterBeneficiaryDialog disabled={!canRegister} />
        </div>
      </div>

      {isPending && <Skeleton className="h-64 w-full" />}
      {isError && <ErrorState error={error} onRetry={refetch} />}

      {data && beneficiaries.length === 0 && (
        <EmptyState
          icon={Landmark}
          title="No payees yet"
          description="Register a US bank account before an agent can pay it."
        />
      )}

      {data && beneficiaries.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Routing number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Registered</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {beneficiaries.map((beneficiary) => (
                  <TableRow key={beneficiary.id}>
                    <TableCell className="font-medium">{beneficiary.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      •••• {beneficiary.account_last4}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {beneficiary.routing_number}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {beneficiary.account_category}
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {new Date(beneficiary.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
