import { notFound } from "next/navigation";
import { renderDashboard } from "../../dashboard-entry";
import { resolvePathKey } from "../../../lib/server/paths";

export const dynamic = "force-dynamic";
const VALID_PATH_VIEWS = new Set(["overview", "roadmap", "diagnostic", "checkin", "library", "simulations"]);

export default async function PathPage({ params }: { params: Promise<{ domain: string; path?: string[] }> }) {
  const { domain, path } = await params;
  if (domain !== "data-engineering") notFound();

  const requestedPathKey = path?.[0];
  if (!requestedPathKey) return renderDashboard();
  if ((path?.length || 0) > 2 || (path?.[1] && !VALID_PATH_VIEWS.has(path[1]))) notFound();

  const pathKey = resolvePathKey(requestedPathKey);
  if (!pathKey) notFound();

  return renderDashboard(pathKey);
}
