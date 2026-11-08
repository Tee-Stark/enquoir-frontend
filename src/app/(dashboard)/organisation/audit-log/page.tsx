import type { Metadata } from "next";
import { AuditLogView } from "./audit-log-view";

export const metadata: Metadata = { title: "Audit log — Enquoir Cloud" };

export default function AuditLogPage() {
  return <AuditLogView />;
}
