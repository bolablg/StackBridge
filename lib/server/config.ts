export type StackBridgeMode = "local" | "hosted";

/**
 * Local mode is the contributor-friendly default during development. Production
 * defaults to hosted mode so a misconfigured deployment never silently disables
 * authentication.
 */
export function getStackBridgeMode(): StackBridgeMode {
  const configured = process.env.STACKBRIDGE_MODE?.trim().toLowerCase();
  if (configured === "local" || configured === "hosted") return configured;
  return process.env.NODE_ENV === "production" ? "hosted" : "local";
}

export function isLocalMode() {
  return getStackBridgeMode() === "local";
}

export function getDataEnvironment() {
  const configured = process.env.STACKBRIDGE_DATA_ENV?.trim().toLowerCase();
  if (configured && /^[a-z0-9][a-z0-9_-]{0,31}$/.test(configured)) return configured;
  if (process.env.CLERK_SECRET_KEY?.startsWith("sk_live_")) return "production";
  return process.env.VERCEL_ENV === "production" ? "production" : "preview";
}
