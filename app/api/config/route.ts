import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || null,
    clerkFrontendApiUrl: process.env.CLERK_FRONTEND_API_URL || null,
  }, { headers: { "Cache-Control": "no-store" } });
}
