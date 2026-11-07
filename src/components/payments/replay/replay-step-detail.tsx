import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentStateBadge, type PaymentState } from "@/components/payments/payment-state-badge";
import { formatMs } from "@/lib/format";
import type { components } from "@/lib/api/schema";

type ReplayStep = components["schemas"]["ReplayStep"];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right text-foreground">{children}</span>
    </div>
  );
}

export function ReplayStepDetail({ step }: { step: ReplayStep }) {
  const fromState = step.from_state as PaymentState | null;
  const toState = step.to_state as PaymentState | null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{step.title}</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        <Row label="At">{new Date(step.at).toLocaleString()}</Row>
        <Row label="Offset">+{formatMs(step.offset_ms)}</Row>
        {step.duration_ms !== null && <Row label="Duration">{formatMs(step.duration_ms)}</Row>}

        {step.type === "transition" && toState && (
          <Row label="Transition">
            <span className="flex items-center gap-2">
              {fromState && <PaymentStateBadge state={fromState} />}
              {fromState && <span className="text-muted-foreground">→</span>}
              <PaymentStateBadge state={toState} />
            </span>
          </Row>
        )}

        {step.attempt && (
          <>
            <Row label="Operation">
              <span className="font-mono text-xs">{step.attempt.operation}</span>
            </Row>
            {step.attempt.agent && <Row label="Agent">{step.attempt.agent.name ?? step.attempt.agent.id}</Row>}
            {step.attempt.transfer_id && (
              <Row label="Transfer ID">
                <span className="font-mono text-xs">{step.attempt.transfer_id}</span>
              </Row>
            )}
            {step.attempt.transfer_status && <Row label="Transfer status">{step.attempt.transfer_status}</Row>}
            {step.attempt.http_status !== null && <Row label="HTTP status">{step.attempt.http_status}</Row>}
            {step.attempt.error_code && (
              <Row label="Error code">
                <span className="text-destructive">{step.attempt.error_code}</span>
              </Row>
            )}
            {step.attempt.error_message && (
              <Row label="Error">
                <span className="text-destructive">{step.attempt.error_message}</span>
              </Row>
            )}
          </>
        )}

        {step.event && (
          <Row label="Event hash">
            <span className="font-mono text-xs break-all">{step.event.hash}</span>
          </Row>
        )}
      </CardContent>
    </Card>
  );
}
