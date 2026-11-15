import type { Metadata } from "next";
import { CheckoutReplayView } from "./checkout-replay-view";

export const metadata: Metadata = { title: "Checkout Replay — Enquoir Cloud" };

export default async function CheckoutReplayPage(props: PageProps<"/checkouts/[id]/replay">) {
  const { id } = await props.params;
  return <CheckoutReplayView checkoutId={id} />;
}
