import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Activity,
  BarChart3,
  Bot,
  Landmark,
  Users,
  Mail,
  ScrollText,
  User,
  ShieldCheck,
  Monitor,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type NavGroup = {
  label: string | null;
  items: NavItem[];
};

/** The full dashboard nav, grouped exactly as the product spec lays it out. */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { label: "Payments", href: "/payments", icon: ArrowLeftRight },
      { label: "Activity", href: "/activity", icon: Activity },
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Infrastructure",
    items: [
      { label: "Agents", href: "/agents", icon: Bot },
      { label: "Beneficiaries", href: "/beneficiaries", icon: Landmark },
    ],
  },
  {
    label: "Organisation",
    items: [
      { label: "Members", href: "/organisation/members", icon: Users },
      { label: "Invitations", href: "/organisation/invitations", icon: Mail },
      { label: "Audit log", href: "/organisation/audit-log", icon: ScrollText },
    ],
  },
  {
    label: "Settings",
    items: [
      { label: "Profile", href: "/settings/profile", icon: User },
      { label: "Security", href: "/settings/security", icon: ShieldCheck },
      { label: "Sessions", href: "/settings/sessions", icon: Monitor },
    ],
  },
];
