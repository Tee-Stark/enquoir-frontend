import { Users } from "lucide-react";
import { PagePlaceholder } from "@/components/feedback/page-placeholder";

export default function MembersPage() {
  return (
    <PagePlaceholder
      title="Members"
      phase={6}
      description="The people in this organisation, their roles, and role changes."
      icon={Users}
    />
  );
}
