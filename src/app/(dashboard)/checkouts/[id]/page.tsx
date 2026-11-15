import type { Metadata } from "next";
import { CheckoutDetailView } from "./checkout-detail-view";

export const metadata: Metadata = { title: "Checkout — Enquoir Cloud" };

export default async function CheckoutDetailPage(props: PageProps<"/checkouts/[id]">) {
  const { id } = await props.params;
  return <CheckoutDetailView checkoutId={id} />;
}
