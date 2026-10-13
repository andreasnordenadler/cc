// Provider milliseconds only: missing or malformed dates stay unavailable.
// Callers choose createdAt for start and lastMoveAt for end; never substitute.
export function providerMillisecondsToIso(value: unknown): string | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : undefined;
}
