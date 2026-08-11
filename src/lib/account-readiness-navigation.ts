export type AccountReadinessField = "lichess-username" | "chesscom-username";

export function getAccountReadinessHref(field: AccountReadinessField, desktop: boolean) {
  return desktop ? `/settings#${field}` : `#${field}`;
}
