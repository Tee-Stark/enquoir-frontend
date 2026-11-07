import { Mail } from "lucide-react";
import { PagePlaceholder } from "@/components/feedback/page-placeholder";

export default function InvitationsPage() {
  return (
    <PagePlaceholder
      title="Invitations"
      phase={6}
      description="Pending invitations by email, with assigned role."
      icon={Mail}
    />
  );
}
