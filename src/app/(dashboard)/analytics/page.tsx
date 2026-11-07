import type { Metadata } from "next";
import { AnalyticsView } from "./analytics-view";

export const metadata: Metadata = { title: "Analytics — Enquoir Cloud" };

export default function AnalyticsPage() {
  return <AnalyticsView />;
}
