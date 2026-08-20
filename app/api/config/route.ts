import { NextResponse } from "next/server";
import { getStackBridgeMode, isLocalMode } from "../../../lib/server/config";

export const dynamic = "force-dynamic";

export function GET() {
  const localMode = isLocalMode();
  return NextResponse.json({
    mode: getStackBridgeMode(),
    clerkPublishableKey: localMode ? null : process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || null,
    clerkFrontendApiUrl: localMode ? null : process.env.CLERK_FRONTEND_API_URL || null,
  }, { headers: { "Cache-Control": "no-store" } });
}
