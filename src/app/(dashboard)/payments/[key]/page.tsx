import type { Metadata } from "next";
import { PaymentDetailView } from "./payment-detail-view";

export const metadata: Metadata = { title: "Payment — Enquoir Cloud" };

export default async function PaymentDetailPage(props: PageProps<"/payments/[key]">) {
  const { key } = await props.params;
  return <PaymentDetailView paymentKey={key} />;
}
