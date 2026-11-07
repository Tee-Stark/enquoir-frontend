import type { Metadata } from "next";
import { SessionsView } from "./sessions-view";

export const metadata: Metadata = { title: "Sessions — Enquoir Cloud" };

export default function SessionsSettingsPage() {
  return <SessionsView />;
}
