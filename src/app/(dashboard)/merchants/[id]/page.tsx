import type { Metadata } from "next";
import { MerchantDetailView } from "./merchant-detail-view";

export const metadata: Metadata = { title: "Merchant integration — Enquoir Cloud" };

export default async function MerchantDetailPage(props: PageProps<"/merchants/[id]">) {
  const { id } = await props.params;
  return <MerchantDetailView integrationId={id} />;
}
