import { LayoutDashboard } from "lucide-react";
import { PagePlaceholder } from "@/components/feedback/page-placeholder";

export default function OverviewPage() {
  return (
    <PagePlaceholder
      title="Overview"
      phase={3}
      description="A fast read on your organisation's payment activity: totals, success rate, and recent events."
      icon={LayoutDashboard}
    />
  );
}
