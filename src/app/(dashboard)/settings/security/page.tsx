import type { Metadata } from "next";
import { SecurityView } from "./security-view";

export const metadata: Metadata = { title: "Security — Enquoir Cloud" };

export default function SecuritySettingsPage() {
  return <SecurityView />;
}
