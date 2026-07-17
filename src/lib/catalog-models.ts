export type SoloCatalogRow = {
  id: string;
  title: string;
  meta: string;
  href?: string | null;
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
  endAt: string;
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

export function filterMultiplayerCatalog<T extends MultiplayerCatalogRow>(
  rows: T[],
  options: { query: string; filter: "all" | "open" | "joined" | "hosted" | "finished"; sort: "closing" | "newest" | "name" },
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
      const left = Date.parse(options.sort === "closing" ? a.endAt : a.createdAt) || 0;
      const right = Date.parse(options.sort === "closing" ? b.endAt : b.createdAt) || 0;
      return options.sort === "closing" ? left - right : right - left;
    });
}
