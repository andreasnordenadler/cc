export type CommunityMultiplayerDiscoveryFilter = "all" | "open" | "joined" | "hosted" | "finished";
export type CommunityMultiplayerDiscoverySort = "closing" | "liked" | "newest" | "players";

export type CommunityMultiplayerDiscoveryState = {
  query: string;
  filter: CommunityMultiplayerDiscoveryFilter;
  sort: CommunityMultiplayerDiscoverySort;
  limit: number;
  host: string | null;
};

type SearchParamInput = URLSearchParams | ReadonlyURLSearchParamsLike | Record<string, string | string[] | undefined>;
type ReadonlyURLSearchParamsLike = Pick<URLSearchParams, "get">;

const FILTERS = new Set<CommunityMultiplayerDiscoveryFilter>(["all", "open", "joined", "hosted", "finished"]);
const SORTS = new Set<CommunityMultiplayerDiscoverySort>(["closing", "liked", "newest", "players"]);
const DEFAULT_STATE: CommunityMultiplayerDiscoveryState = {
  query: "",
  filter: "open",
  sort: "closing",
  limit: 4,
  host: null,
};
const DEFAULT_RETURN_HREF = "/multiplayer-side-quests?tab=community";

function readParam(input: SearchParamInput, key: string) {
  if (typeof (input as ReadonlyURLSearchParamsLike).get === "function") {
    return (input as ReadonlyURLSearchParamsLike).get(key) ?? "";
  }
  const value = (input as Record<string, string | string[] | undefined>)[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export function normalizeCommunityMultiplayerDiscoveryText(value: string, maxLength: number) {
  const trimmed = value.trim();
  if (!trimmed || /[\u0000-\u001f\u007f]/.test(trimmed)) return "";
  if (trimmed.length <= maxLength) return trimmed;
  const truncated = trimmed.slice(0, maxLength);
  return /[\uD800-\uDBFF]$/.test(truncated) ? truncated.slice(0, -1) : truncated;
}

export function parseCommunityMultiplayerDiscoveryState(input: SearchParamInput): CommunityMultiplayerDiscoveryState {
  const filterValue = readParam(input, "filter") as CommunityMultiplayerDiscoveryFilter;
  const sortValue = readParam(input, "sort") as CommunityMultiplayerDiscoverySort;
  const host = normalizeCommunityMultiplayerDiscoveryText(readParam(input, "host"), 80) || null;
  const defaultFilter = host ? "all" : DEFAULT_STATE.filter;
  const limitValue = readParam(input, "limit");
  const parsedLimit = /^\d+$/.test(limitValue) ? Number(limitValue) : Number.NaN;
  const limit = Number.isSafeInteger(parsedLimit) && parsedLimit >= 4 && parsedLimit % 4 === 0
    ? parsedLimit
    : DEFAULT_STATE.limit;

  return {
    query: normalizeCommunityMultiplayerDiscoveryText(readParam(input, "q"), 120),
    filter: FILTERS.has(filterValue) ? filterValue : defaultFilter,
    sort: SORTS.has(sortValue) ? sortValue : DEFAULT_STATE.sort,
    limit,
    host,
  };
}

export function buildCommunityMultiplayerDiscoveryHref(state: CommunityMultiplayerDiscoveryState) {
  const canonicalState = parseCommunityMultiplayerDiscoveryState({
    q: state.query,
    filter: state.filter,
    sort: state.sort,
    limit: String(state.limit),
    host: state.host ?? undefined,
  });
  const params = new URLSearchParams({ tab: "community" });
  if (canonicalState.query) params.set("q", canonicalState.query);
  if (canonicalState.filter !== (canonicalState.host ? "all" : DEFAULT_STATE.filter)) params.set("filter", canonicalState.filter);
  if (canonicalState.sort !== DEFAULT_STATE.sort) params.set("sort", canonicalState.sort);
  if (canonicalState.limit !== DEFAULT_STATE.limit) params.set("limit", String(canonicalState.limit));
  if (canonicalState.host) params.set("host", canonicalState.host);
  return `/multiplayer-side-quests?${params.toString()}`;
}

export function buildUpdatedCommunityMultiplayerDiscoveryHref(
  input: SearchParamInput,
  update: Partial<CommunityMultiplayerDiscoveryState> | ((state: CommunityMultiplayerDiscoveryState) => Partial<CommunityMultiplayerDiscoveryState>),
) {
  const currentState = parseCommunityMultiplayerDiscoveryState(input);
  const nextState = typeof update === "function" ? update(currentState) : update;
  return buildCommunityMultiplayerDiscoveryHref({ ...currentState, ...nextState });
}

export function resolveCommunityMultiplayerReturnHref(value?: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || /[\u0000-\u001f\u007f]/.test(value)) {
    return DEFAULT_RETURN_HREF;
  }

  try {
    const url = new URL(value, "https://sidequestchess.invalid");
    if (
      url.origin !== "https://sidequestchess.invalid"
      || url.pathname !== "/multiplayer-side-quests"
      || url.hash
      || url.searchParams.get("tab") !== "community"
    ) {
      return DEFAULT_RETURN_HREF;
    }
    return buildCommunityMultiplayerDiscoveryHref(parseCommunityMultiplayerDiscoveryState(url.searchParams));
  } catch {
    return DEFAULT_RETURN_HREF;
  }
}

export function buildCommunityMultiplayerDetailHref(detailHref: string, returnTo: string) {
  const safeReturnTo = resolveCommunityMultiplayerReturnHref(returnTo);
  const url = new URL(detailHref, "https://sidequestchess.invalid");
  url.searchParams.set("returnTo", safeReturnTo);
  return `${url.pathname}?${url.searchParams.toString()}${url.hash}`;
}
