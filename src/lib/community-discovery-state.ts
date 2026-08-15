import type { CommunitySoloCatalogFilter, CommunitySoloCatalogSort } from "./catalog-models";

export type CommunityDiscoveryState = {
  query: string;
  filter: CommunitySoloCatalogFilter;
  sort: CommunitySoloCatalogSort;
  limit: number;
  creator: string | null;
};

type SearchParamInput = URLSearchParams | Record<string, string | string[] | undefined>;

const FILTERS = new Set<CommunitySoloCatalogFilter>(["all", "popular", "new", "completed"]);
const SORTS = new Set<CommunitySoloCatalogSort>(["popular", "liked", "newest", "name"]);
const DEFAULT_STATE: CommunityDiscoveryState = {
  query: "",
  filter: "all",
  sort: "popular",
  limit: 10,
  creator: null,
};

function readParam(input: SearchParamInput, key: string) {
  if (input instanceof URLSearchParams) return input.get(key) ?? "";
  const value = input[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function cleanText(value: string, maxLength: number) {
  const trimmed = value.trim();
  if (!trimmed || /[\u0000-\u001f\u007f]/.test(trimmed)) return "";
  return trimmed.slice(0, maxLength);
}

export function parseCommunityDiscoveryState(input: SearchParamInput): CommunityDiscoveryState {
  const filterValue = readParam(input, "filter") as CommunitySoloCatalogFilter;
  const sortValue = readParam(input, "sort") as CommunitySoloCatalogSort;
  const limitValue = readParam(input, "limit");
  const parsedLimit = /^\d+$/.test(limitValue) ? Number(limitValue) : Number.NaN;
  const limit = Number.isSafeInteger(parsedLimit) && parsedLimit >= 10
    ? Math.floor(parsedLimit / 10) * 10
    : DEFAULT_STATE.limit;

  return {
    query: cleanText(readParam(input, "q"), 120),
    filter: FILTERS.has(filterValue) ? filterValue : DEFAULT_STATE.filter,
    sort: SORTS.has(sortValue) ? sortValue : DEFAULT_STATE.sort,
    limit,
    creator: cleanText(readParam(input, "creator"), 160) || null,
  };
}

export function buildCommunityDiscoveryHref(state: CommunityDiscoveryState) {
  const params = new URLSearchParams();
  if (state.query) params.set("q", state.query);
  if (state.filter !== DEFAULT_STATE.filter) params.set("filter", state.filter);
  if (state.sort !== DEFAULT_STATE.sort) params.set("sort", state.sort);
  if (state.limit !== DEFAULT_STATE.limit) params.set("limit", String(state.limit));
  if (state.creator) params.set("creator", state.creator);
  const query = params.toString();
  return `/community-side-quests${query ? `?${query}` : ""}`;
}

export function buildCommunityQuestDetailHref(questId: string, returnTo: string) {
  const safeReturnTo = resolveCommunityDiscoveryReturnHref(returnTo);
  const params = new URLSearchParams({ returnTo: safeReturnTo });
  return `/challenges/community/${encodeURIComponent(questId)}?${params.toString()}`;
}

export function resolveCommunityDiscoveryReturnHref(value?: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || /[\u0000-\u001f\u007f]/.test(value)) {
    return "/community-side-quests";
  }

  try {
    const url = new URL(value, "https://sidequestchess.invalid");
    if (url.origin !== "https://sidequestchess.invalid" || url.pathname !== "/community-side-quests" || url.hash) {
      return "/community-side-quests";
    }
    return buildCommunityDiscoveryHref(parseCommunityDiscoveryState(url.searchParams));
  } catch {
    return "/community-side-quests";
  }
}
