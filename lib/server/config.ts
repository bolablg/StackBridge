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
