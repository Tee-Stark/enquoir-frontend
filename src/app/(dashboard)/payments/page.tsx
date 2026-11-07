import type { Metadata } from "next";
import { PaymentsView } from "./payments-view";

export const metadata: Metadata = { title: "Payments — Enquoir Cloud" };

export default function PaymentsPage() {
  return <PaymentsView />;
}
