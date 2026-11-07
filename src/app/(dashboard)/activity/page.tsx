import { Activity as ActivityIcon } from "lucide-react";
import { PagePlaceholder } from "@/components/feedback/page-placeholder";

export default function ActivityPage() {
  return (
    <PagePlaceholder
      title="Activity"
      phase={4}
      description="A unified view of agent submissions and Airwallex calls, with outcomes and timing."
      icon={ActivityIcon}
    />
  );
}
