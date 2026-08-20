import { renderDashboard } from "./dashboard-entry";

export const dynamic = "force-dynamic";

export default async function Page() {
  return renderDashboard();
}
