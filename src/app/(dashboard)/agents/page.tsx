import { Bot } from "lucide-react";
import { PagePlaceholder } from "@/components/feedback/page-placeholder";

export default function AgentsPage() {
  return (
    <PagePlaceholder
      title="Agents"
      phase={6}
      description="The AI agents that can submit payments on this organisation's behalf, and their API keys."
      icon={Bot}
    />
  );
}
