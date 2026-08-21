import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { isLocalMode } from "./lib/server/config";

function withHttps(value?: string) {
  const normalized = value?.trim().replace(/\/$/, "");
  if (!normalized) return null;
  return /^https?:\/\//.test(normalized) ? normalized : `https://${normalized}`;
}

function authorizedParties() {
  const configured = (process.env.CLERK_AUTHORIZED_PARTIES || "").split(",").map(withHttps).filter(Boolean) as string[];
  const vercelOrigins = [
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ].map(withHttps).filter(Boolean) as string[];
  return Array.from(new Set([...configured, ...vercelOrigins]));
}

const parties = authorizedParties();
const clerk = clerkMiddleware({
  ...(parties.length ? { authorizedParties: parties } : {}),
  contentSecurityPolicy: {
    directives: {
      "base-uri": ["'self'"],
      "frame-ancestors": ["'none'"],
      "object-src": ["'none'"],
    },
  },
});

export default async function proxy(request: NextRequest, event: NextFetchEvent) {
  if (isLocalMode() || !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) return NextResponse.next();
  // Next's local request adapter can reinvoke middleware after Clerk decorates the request.
  // Let that already-decorated pass continue instead of authenticating it recursively.
  if (request.headers.has("x-clerk-auth-status")) return NextResponse.next();
  return await clerk(request, event) || NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
