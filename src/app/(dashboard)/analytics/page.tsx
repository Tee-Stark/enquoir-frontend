import { BarChart3 } from "lucide-react";
import { PagePlaceholder } from "@/components/feedback/page-placeholder";

export default function AnalyticsPage() {
  return (
    <PagePlaceholder
      title="Analytics"
      phase={5}
      description="Summary metrics and time-series trends, currency-separated, in any time zone."
      icon={BarChart3}
    />
  );
}
