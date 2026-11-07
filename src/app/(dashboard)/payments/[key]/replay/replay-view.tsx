"use client";

import Link from "next/link";
import { ArrowLeft, FileSearch, History } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/feedback/error-state";
import { EmptyState } from "@/components/feedback/empty-state";
import { PaymentStateBadge } from "@/components/payments/payment-state-badge";
import { HashChainBadge } from "@/components/payments/hash-chain-badge";
import { ReplayControls } from "@/components/payments/replay/replay-controls";
import { ReplayTimeline } from "@/components/payments/replay/replay-timeline";
import { ReplayStepDetail } from "@/components/payments/replay/replay-step-detail";
import { useReplayPlayback } from "@/components/payments/replay/use-replay-playback";
import { isApiError } from "@/lib/api/client";
import { useReplay } from "@/lib/payments/queries";
import { formatMs } from "@/lib/format";
import type { components } from "@/lib/api/schema";

type Replay = components["schemas"]["Replay"];

export function ReplayView({ paymentKey }: { paymentKey: string }) {
  const { data: replay, isPending, isError, error, refetch } = useReplay(paymentKey);

  if (isPending) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (isError) {
    if (isApiError(error) && error.code === "not_found") {
      return (
        <EmptyState
          icon={FileSearch}
          title="Payment not found"
          description={`No payment with key "${paymentKey}" in this organisation.`}
          action={
            <Link href="/payments" className={buttonVariants({ variant: "outline", className: "mt-2" })}>
              Back to payments
            </Link>
          }
        />
      );
    }
    return <ErrorState error={error} onRetry={refetch} />;
  }

  return <ReplayPlayer paymentKey={paymentKey} replay={replay} />;
}

/**
 * Split out from ReplayView so the playback hook is only ever called once
 * the replay has actually loaded - no conditional hook calls above.
 */
function ReplayPlayer({ paymentKey, replay }: { paymentKey: string; replay: Replay }) {
  const steps = replay.steps;
  const deltaMsList = steps.map((s) => s.delta_ms);
  const playback = useReplayPlayback(deltaMsList);
  const currentStep = steps[playback.currentIndex];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`/payments/${paymentKey}`}
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> {paymentKey}
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
            <History className="size-4 text-muted-foreground" />
            Replay
          </h1>
          <PaymentStateBadge state={replay.payment.state} />
          <HashChainBadge chain={replay.chain} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {steps.length} step{steps.length === 1 ? "" : "s"}
          {steps.length > 0 ? ` over ${formatMs(replay.duration_ms)}` : ""}
        </p>
      </div>

      {steps.length === 0 ? (
        <EmptyState
          icon={History}
          title="Nothing to replay yet"
          description="This payment has no recorded steps."
        />
      ) : (
        <>
          <Card>
            <CardContent className="pt-4">
              <ReplayControls
                isPlaying={playback.isPlaying}
                currentIndex={playback.currentIndex}
                stepCount={steps.length}
                speed={playback.speed}
                onPlay={playback.play}
                onPause={playback.pause}
                onNext={playback.next}
                onPrev={playback.prev}
                onRestart={playback.restart}
                onSpeedChange={playback.setSpeed}
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Timeline</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[32rem] overflow-y-auto">
                <ReplayTimeline
                  steps={steps}
                  currentIndex={playback.currentIndex}
                  onSelect={playback.jumpTo}
                />
              </CardContent>
            </Card>

            {currentStep && <ReplayStepDetail step={currentStep} />}
          </div>
        </>
      )}
    </div>
  );
}
