import type { Metadata } from "next";
import { BeneficiariesView } from "./beneficiaries-view";

export const metadata: Metadata = { title: "Beneficiaries — Enquoir Cloud" };

export default function BeneficiariesPage() {
  return <BeneficiariesView />;
}
