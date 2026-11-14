import type { Metadata } from "next";
import { MerchantsView } from "./merchants-view";

export const metadata: Metadata = { title: "Merchant integrations — Enquoir Cloud" };

export default function MerchantsPage() {
  return <MerchantsView />;
}
