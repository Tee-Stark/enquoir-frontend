import type { Metadata } from "next";
import { MembersView } from "./members-view";

export const metadata: Metadata = { title: "Members — Enquoir Cloud" };

export default function MembersPage() {
  return <MembersView />;
}
