import { ScrollText } from "lucide-react";
import { PagePlaceholder } from "@/components/feedback/page-placeholder";

export default function AuditLogPage() {
  return (
    <PagePlaceholder
      title="Audit log"
      phase={6}
      description="What happened in this organisation, by whom, and when."
      icon={ScrollText}
    />
  );
}
