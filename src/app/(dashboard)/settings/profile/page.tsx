import { User } from "lucide-react";
import { PagePlaceholder } from "@/components/feedback/page-placeholder";

export default function ProfileSettingsPage() {
  return (
    <PagePlaceholder
      title="Profile"
      phase={2}
      description="Account information and email verification status."
      icon={User}
    />
  );
}
