import type { Metadata } from "next";
import { ExecutionDetailView } from "./execution-detail-view";

export const metadata: Metadata = { title: "Execution — Enquoir Cloud" };

export default async function ExecutionDetailPage(props: PageProps<"/executions/[id]">) {
  const { id } = await props.params;
  return <ExecutionDetailView executionId={id} />;
}
