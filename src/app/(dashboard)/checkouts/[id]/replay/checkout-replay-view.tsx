"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowLeft, History, ShoppingCart } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/feedback/error-state";
import { EmptyState } from "@/components/feedback/empty-state";
import { CheckoutStatusBadge } from "@/components/commerce/checkout-status-badge";
import { ReplayControls } from "@/components/payments/replay/replay-controls";
import { useReplayPlayback } from "@/components/payments/replay/use-replay-playback";
import { CheckoutReplayTimeline } from "@/components/commerce/replay/checkout-replay-timeline";
import { CheckoutReplayStepDetail } from "@/components/commerce/replay/checkout-replay-step-detail";
import { isApiError } from "@/lib/api/client";
import { useCheckoutReplay } from "@/lib/commerce/checkouts";
import { formatMs } from "@/lib/format";
import type { components } from "@/lib/api/schema";

type CheckoutReplay = components["schemas"]["CheckoutReplay"];

export function CheckoutReplayView({ checkoutId }: { checkoutId: string }) {
  const { data: replay, isPending, isError, error, refetch } = useCheckoutReplay(checkoutId);

  if (isPending) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (isError) {
    if (isApiError(error) && error.code === "not_found") {
      return (
        <EmptyState
          icon={ShoppingCart}
          title="Checkout not found"
          description={`No checkout with ID "${checkoutId}" in this organisation.`}
          action={
            <Link href="/activity" className={buttonVariants({ variant: "outline", className: "mt-2" })}>
              Back to activity
            </Link>
          }
        />
      );
    }
    return <ErrorState error={error} onRetry={refetch} />;
  }

  return <CheckoutReplayPlayer checkoutId={checkoutId} replay={replay} />;
}

/**
 * Split out from CheckoutReplayView so the playback hook is only ever
 * called once the replay has actually loaded - no conditional hook
 * calls above, mirroring the payment ReplayPlayer split.
 */
function CheckoutReplayPlayer({ checkoutId, replay }: { checkoutId: string; replay: CheckoutReplay }) {
  const steps = replay.steps;
  const deltaMsList = useMemo(() => steps.map((s) => s.delta_ms), [steps]);
  const playback = useReplayPlayback(deltaMsList);
  const currentStep = steps[playback.currentIndex];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`/checkouts/${checkoutId}`}
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> {checkoutId}
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
            <History className="size-4 text-muted-foreground" />
            Replay
          </h1>
          <CheckoutStatusBadge status={replay.checkout.status} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {steps.length} step{steps.length === 1 ? "" : "s"}
          {steps.length > 0 ? ` over ${formatMs(replay.duration_ms)}` : ""}
        </p>
      </div>

      {steps.length === 0 ? (
        <EmptyState icon={History} title="Nothing to replay yet" description="This checkout has no recorded steps." />
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
                <CheckoutReplayTimeline steps={steps} currentIndex={playback.currentIndex} onSelect={playback.jumpTo} />
              </CardContent>
            </Card>

            {currentStep && <CheckoutReplayStepDetail step={currentStep} />}
          </div>
        </>
      )}
    </div>
  );
}
