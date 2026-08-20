import { notFound } from "next/navigation";
import { renderDashboard } from "../../dashboard-entry";

export const dynamic = "force-dynamic";

export default async function PathPage({ params }: { params: Promise<{ domain: string; path?: string[] }> }) {
  const { domain } = await params;
  if (domain !== "data-engineering") notFound();
  return renderDashboard();
}
