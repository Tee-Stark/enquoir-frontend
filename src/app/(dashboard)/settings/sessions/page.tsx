import { Monitor } from "lucide-react";
import { PagePlaceholder } from "@/components/feedback/page-placeholder";

export default function SessionsSettingsPage() {
  return (
    <PagePlaceholder
      title="Sessions"
      phase={2}
      description="Active sessions on your account, with the ability to revoke them."
      icon={Monitor}
    />
  );
}
