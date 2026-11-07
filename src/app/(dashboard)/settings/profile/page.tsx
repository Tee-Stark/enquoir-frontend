import type { Metadata } from "next";
import { ProfileView } from "./profile-view";

export const metadata: Metadata = { title: "Profile — Enquoir Cloud" };

export default function ProfileSettingsPage() {
  return <ProfileView />;
}
