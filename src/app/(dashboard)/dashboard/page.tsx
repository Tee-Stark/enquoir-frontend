import type { Metadata } from "next";
import { OverviewView } from "./overview-view";

export const metadata: Metadata = { title: "Overview — Enquoir Cloud" };

export default function OverviewPage() {
  return <OverviewView />;
}
