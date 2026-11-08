import type { Metadata } from "next";
import { AgentsView } from "./agents-view";

export const metadata: Metadata = { title: "Agents — Enquoir Cloud" };

export default function AgentsPage() {
  return <AgentsView />;
}
