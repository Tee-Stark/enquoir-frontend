import { ArrowLeftRight } from "lucide-react";
import { PagePlaceholder } from "@/components/feedback/page-placeholder";

export default function PaymentsPage() {
  return (
    <PagePlaceholder
      title="Payments"
      phase={3}
      description="Every payment intent, filterable, with full state history and hash-chain verification."
      icon={ArrowLeftRight}
    />
  );
}
