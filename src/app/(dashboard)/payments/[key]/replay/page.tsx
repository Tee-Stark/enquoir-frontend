import type { Metadata } from "next";
import { ReplayView } from "./replay-view";

export const metadata: Metadata = { title: "Replay — Enquoir Cloud" };

export default async function PaymentReplayPage(props: PageProps<"/payments/[key]/replay">) {
  const { key } = await props.params;
  return <ReplayView paymentKey={key} />;
}
