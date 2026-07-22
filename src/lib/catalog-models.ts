export type SoloCatalogRow = {
  id: string;
  title: string;
  meta: string;
  href: string;
  status?: string | null;
};

export type MultiplayerCatalogRow = {
  id: string;
  title: string;
  meta: string;
  quests: string[];
  status: "Not joined" | "Joined" | "Hosted";
  lifecycle: "open" | "finished";
  createdAt: string;
  startAt: string;
  endAt: string;
  likeSummary: { count: number };
  playerCount: number;
};

export function filterSoloCatalog<T extends SoloCatalogRow>(
  rows: T[],
  options: { query: string; status: "all" | "completed"; sort: "name" | "newest" },
): T[] {
  const query = options.query.trim().toLocaleLowerCase();
  return rows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => !query || `${row.title} ${row.meta}`.toLocaleLowerCase().includes(query))
    .filter(({ row }) => options.status === "all" || row.status?.toLocaleLowerCase() === "completed")
    .sort((a, b) => options.sort === "name" ? a.row.title.localeCompare(b.row.title) : a.index - b.index)
    .map(({ row }) => row);
}

export type CommunitySoloCatalogRow = SoloCatalogRow & {
  creatorKey?: string;
  updatedAtMs: number;
  popularityScore: number;
  likeCount: number;
  completedByViewer: boolean;
  isNew: boolean;
};

export type CommunitySoloCatalogFilter = "all" | "popular" | "new" | "completed";
export type CommunitySoloCatalogSort = "popular" | "liked" | "newest" | "name";

export function applyCommunitySoloLikeState<T extends { id: string; likeCount: number; likedByViewer: boolean }>(
  rows: T[],
  targetId: string,
  likedByViewer: boolean,
): T[] {
  return rows.map((row) => row.id === targetId
    ? { ...row, likedByViewer, likeCount: Math.max(0, row.likeCount + (likedByViewer === row.likedByViewer ? 0 : likedByViewer ? 1 : -1)) }
    : row);
}

export function filterCommunitySoloCatalog<T extends CommunitySoloCatalogRow>(
  rows: T[],
  options: { query: string; filter: CommunitySoloCatalogFilter; sort: CommunitySoloCatalogSort; creator?: string | null },
): T[] {
  const query = options.query.trim().toLocaleLowerCase();
  const creator = options.creator?.trim() ?? "";
  return rows
    .filter((row) => !creator || row.creatorKey === creator)
    .filter((row) => !query || `${row.title} ${row.meta}`.toLocaleLowerCase().includes(query))
    .filter((row) => {
      if (options.filter === "popular") return row.popularityScore + row.likeCount * 5 > 0;
      if (options.filter === "new") return row.isNew;
      if (options.filter === "completed") return row.completedByViewer;
      return true;
    })
    .sort((a, b) => {
      if (options.sort === "name") return a.title.localeCompare(b.title);
      if (options.sort === "liked") return b.likeCount - a.likeCount || b.updatedAtMs - a.updatedAtMs || a.title.localeCompare(b.title);
      if (options.sort === "newest") return b.updatedAtMs - a.updatedAtMs || a.title.localeCompare(b.title);
      return (b.popularityScore + b.likeCount * 5) - (a.popularityScore + a.likeCount * 5)
        || b.updatedAtMs - a.updatedAtMs
        || a.title.localeCompare(b.title);
    });
}

export type CustomCatalogRow = SoloCatalogRow & {
  lifecycle: "draft" | "published" | "archived";
  visibility: "private" | "public";
  updatedAt: string;
};

export function filterCustomCatalog<T extends CustomCatalogRow>(
  rows: T[],
  options: { query: string; filter: "all" | "published" | "draft" | "public" | "archived"; sort: "newest" | "name" },
): T[] {
  const query = options.query.trim().toLocaleLowerCase();
  return rows
    .filter((row) => !query || `${row.title} ${row.meta}`.toLocaleLowerCase().includes(query))
    .filter((row) => {
      if (options.filter === "all") return true;
      if (options.filter === "public") return row.visibility === "public";
      return row.lifecycle === options.filter;
    })
    .sort((a, b) => options.sort === "name"
      ? a.title.localeCompare(b.title)
      : (Date.parse(b.updatedAt) || 0) - (Date.parse(a.updatedAt) || 0) || a.title.localeCompare(b.title));
}

export function paginateCatalog<T>(rows: T[], limit: number) {
  const safeLimit = Math.max(0, limit);
  return { rows: rows.slice(0, safeLimit), hasMore: rows.length > safeLimit, total: rows.length };
}

export function applyMultiplayerLikeState<
  T extends { id: string; likeSummary: { count: number; likedByViewer: boolean } },
>(rows: T[], targetId: string, likedByViewer: boolean): T[] {
  return rows.map((row) => row.id === targetId
    ? {
        ...row,
        likeSummary: {
          ...row.likeSummary,
          count: Math.max(0, row.likeSummary.count + (likedByViewer === row.likeSummary.likedByViewer ? 0 : likedByViewer ? 1 : -1)),
          likedByViewer,
        },
      }
    : row);
}

export function filterMultiplayerCatalog<T extends MultiplayerCatalogRow>(
  rows: T[],
  options: { query: string; filter: "all" | "open" | "joined" | "hosted" | "finished"; sort: "closing" | "liked" | "newest" | "players" | "name" },
): T[] {
  const query = options.query.trim().toLocaleLowerCase();
  return rows
    .filter((row) => !query || `${row.title} ${row.meta} ${row.quests.join(" ")}`.toLocaleLowerCase().includes(query))
    .filter((row) => {
      if (options.filter === "all") return true;
      if (options.filter === "open" || options.filter === "finished") return row.lifecycle === options.filter;
      return row.lifecycle === "open" && row.status.toLocaleLowerCase() === options.filter;
    })
    .sort((a, b) => {
      if (options.sort === "name") return a.title.localeCompare(b.title);
      if (options.sort === "players") return b.playerCount - a.playerCount;
      if (options.sort === "liked") {
        return b.likeSummary.count - a.likeSummary.count
          || (Date.parse(b.startAt) || 0) - (Date.parse(a.startAt) || 0);
      }
      const left = Date.parse(options.sort === "closing" ? a.endAt : options.sort === "newest" ? a.startAt : a.createdAt) || 0;
      const right = Date.parse(options.sort === "closing" ? b.endAt : options.sort === "newest" ? b.startAt : b.createdAt) || 0;
      return options.sort === "closing" ? left - right : right - left;
    });
}
