import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckoutStatusBadge, type CheckoutStatus } from "@/components/commerce/checkout-status-badge";
import { ExecutionStatusBadge, type ExecutionStatus } from "@/components/commerce/execution-status-badge";
import { formatMs } from "@/lib/format";
import type { components } from "@/lib/api/schema";

type CheckoutReplayStep = components["schemas"]["CheckoutReplayStep"];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right text-foreground">{children}</span>
    </div>
  );
}

export function CheckoutReplayStepDetail({ step }: { step: CheckoutReplayStep }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{step.title}</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        <Row label="At">{new Date(step.at).toLocaleString()}</Row>
        <Row label="Offset">+{formatMs(step.offset_ms)}</Row>

        {step.decision && (
          <>
            <Row label="Decision">
              <CheckoutStatusBadge status={step.decision.status as CheckoutStatus} />
            </Row>
            {step.decision.reasons.length > 0 && (
              <Row label="Reasons">
                <span className="text-right">
                  {step.decision.reasons.map((r) => r.code).join(", ")}
                </span>
              </Row>
            )}
          </>
        )}

        {step.execution_event && (
          <>
            <Row label="Status after">
              <ExecutionStatusBadge status={step.execution_event.status_after as ExecutionStatus} />
            </Row>
            {step.execution_event.source && <Row label="Source">{step.execution_event.source}</Row>}
            {step.execution_event.provider_payment_reference && (
              <Row label="Provider reference">
                <span className="font-mono text-xs">{step.execution_event.provider_payment_reference}</span>
              </Row>
            )}
            {step.execution_event.detail && (
              <Row label="Detail">
                <span className="text-right">{step.execution_event.detail}</span>
              </Row>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
