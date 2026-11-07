import { Landmark } from "lucide-react";
import { PagePlaceholder } from "@/components/feedback/page-placeholder";

export default function BeneficiariesPage() {
  return (
    <PagePlaceholder
      title="Beneficiaries"
      phase={6}
      description="Payees registered on the rail before they can be paid."
      icon={Landmark}
    />
  );
}
