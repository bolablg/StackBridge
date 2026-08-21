import { notFound } from "next/navigation";
import { renderDashboard } from "../../dashboard-entry";
import { resolvePathKey } from "../../../lib/server/paths";

export const dynamic = "force-dynamic";

export default async function PathPage({ params }: { params: Promise<{ domain: string; path?: string[] }> }) {
  const { domain, path } = await params;
  if (domain !== "data-engineering") notFound();

  const requestedPathKey = path?.[0];
  if (!requestedPathKey) return renderDashboard();

  const pathKey = resolvePathKey(requestedPathKey);
  if (!pathKey) notFound();

  return renderDashboard(pathKey);
}
