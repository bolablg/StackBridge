export function progressRevision(value: unknown) {
  if (!value || typeof value !== "object" || !("revision" in value)) return 0;
  const revision = Number((value as { revision?: unknown }).revision);
  return Number.isSafeInteger(revision) && revision >= 0 ? revision : 0;
}

export function isDashboardStatePayload(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const state = value as Record<string, unknown>;
  return Boolean(
    state.weekStatus && typeof state.weekStatus === "object"
      && state.setup && typeof state.setup === "object"
      && state.diagnostic && typeof state.diagnostic === "object"
      && Array.isArray(state.checkins)
      && Number.isSafeInteger(Number(state.revision))
      && Number(state.revision) >= 0,
  );
}
