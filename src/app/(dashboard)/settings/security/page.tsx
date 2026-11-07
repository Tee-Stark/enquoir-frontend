import { ShieldCheck } from "lucide-react";
import { PagePlaceholder } from "@/components/feedback/page-placeholder";

export default function SecuritySettingsPage() {
  return (
    <PagePlaceholder
      title="Security"
      phase={2}
      description="Change your password and manage account security."
      icon={ShieldCheck}
    />
  );
}
