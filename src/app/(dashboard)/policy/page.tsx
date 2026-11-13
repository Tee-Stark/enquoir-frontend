import type { Metadata } from "next";
import { PolicyView } from "./policy-view";

export const metadata: Metadata = { title: "Spending policy — Enquoir Cloud" };

export default function PolicyPage() {
  return <PolicyView />;
}
