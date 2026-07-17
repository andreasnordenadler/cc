"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import OfficialSoloLikeControl from "./official-solo-like-control";
import { filterCommunitySoloCatalog, filterCustomCatalog, filterMultiplayerCatalog, paginateCatalog, type CommunitySoloCatalogFilter, type CommunitySoloCatalogSort } from "@/lib/catalog-models";
import type { MobileWebMultiplayerPreview } from "@/lib/mobile-web-multiplayer";

export type SoloCatalogClientRow = {
  id: string; title: string; meta: string; href: string; image?: string | null; sourceBadge?: string | null; status?: string | null;
};

export type CustomCatalogClientRow = SoloCatalogClientRow & {
  lifecycle: "draft" | "published" | "archived";
  visibility: "private" | "public";
  updatedAt: string;
};

function CatalogRow({ row, status }: { row: SoloCatalogClientRow; status: string }) {
  return (
    <Link href={row.href} className="sqc-app-row text-only">
      <span className="sqc-row-copy">
        {row.sourceBadge ? <span className="sqc-row-badge">{row.sourceBadge}</span> : null}
        <strong className="sqc-row-title-line"><span>{row.title}</span></strong>
        <small>{row.meta}</small>
      </span>
      <span className="sqc-row-status">{status}</span>
    </Link>
  );
}

function MultiplayerCatalogRow({ row, status, signedIn }: { row: MobileWebMultiplayerPreview; status: string; signedIn: boolean }) {
  return (
    <div className="sqc-app-row sqc-app-row-with-like text-only">
      <Link href={row.href} className="sqc-app-row-main" aria-label={`Open ${row.title}`} />
      <span className="sqc-row-copy">
        <span className="sqc-row-badge">{row.sourceBadge}</span>
        <span className="sqc-row-title-line">
          <strong><span>{row.title}</span></strong>
          <OfficialSoloLikeControl
            targetType="multiplayer"
            targetId={row.id}
            count={row.likeSummary.count}
            likedByViewer={row.likeSummary.likedByViewer}
            signedIn={signedIn}
            returnTo="/multiplayer-side-quests?tab=community"
            label={row.title}
          />
        </span>
        <small>{row.meta}</small>
      </span>
      <span className="sqc-row-status">{status}</span>
    </div>
  );
}

export type CommunitySoloCatalogClientRow = SoloCatalogClientRow & {
  updatedAtMs: number;
  popularityScore: number;
  likeCount: number;
  completedByViewer: boolean;
  isNew: boolean;
};

export function CommunitySoloCatalog({ rows, signedIn }: { rows: CommunitySoloCatalogClientRow[]; signedIn: boolean }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CommunitySoloCatalogFilter>("all");
  const [sort, setSort] = useState<CommunitySoloCatalogSort>("popular");
  const [limit, setLimit] = useState(10);
  const filtered = useMemo(() => filterCommunitySoloCatalog(rows, { query, filter, sort }), [rows, query, filter, sort]);
  const page = paginateCatalog(filtered, limit);
  const filters: Array<{ value: CommunitySoloCatalogFilter; label: string }> = [
    { value: "all", label: "All" },
    { value: "popular", label: "Popular" },
    { value: "new", label: "New" },
    { value: "completed", label: "Completed" },
  ];

  return (
    <>
      <div className="sqc-community-browse-panel" aria-label="Community Side Quest filters">
        <label className="sqc-search-shell">
          <span className="sr-only">Search Community Side Quests</span>
          <input value={query} onChange={(event) => { setQuery(event.target.value); setLimit(10); }} placeholder="Search by name or rule" aria-label="Search Community Side Quests" />
        </label>
        <div className="sqc-community-controls">
          <div className="sqc-filter-row" aria-label="Filter Community Side Quests">
            {filters.map(({ value, label }) => (
              <button type="button" key={value} className={filter === value ? "active" : ""} aria-pressed={filter === value} onClick={() => { setFilter(value); setLimit(10); }}>{label}</button>
            ))}
          </div>
          <label className="sqc-sort-pill">Sort <select aria-label="Sort Community Side Quests" value={sort} onChange={(event) => { setSort(event.target.value as CommunitySoloCatalogSort); setLimit(10); }}><option value="popular">Top</option><option value="liked">Liked</option><option value="newest">Newest</option><option value="name">A–Z</option></select></label>
        </div>
      </div>
      <span>{page.total} result{page.total === 1 ? "" : "s"}</span>
      {page.rows.length ? <div className="sqc-catalog">{page.rows.map(row => <CatalogRow key={row.id} row={row} status={row.status ?? "Ready"} />)}</div> : (
        <div className="sqc-empty-panel standalone"><strong>No Community Side Quests match these filters.</strong><span>{rows.length ? "Try another search or filter." : signedIn ? "Create the first public Side Quest from My Custom Side Quests." : "Public player-made Side Quests will appear here."}</span></div>
      )}
      {page.hasMore ? <button type="button" className="sqc-detail-secondary-button" onClick={() => setLimit(value => value + 10)}>Load more</button> : null}
    </>
  );
}

export function CustomSoloCatalog({ rows }: { rows: CustomCatalogClientRow[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft" | "public" | "archived">("all");
  const [sort, setSort] = useState<"newest" | "name">("newest");
  const [limit, setLimit] = useState(12);
  const filtered = useMemo(() => filterCustomCatalog(rows, { query, filter, sort }), [rows, query, filter, sort]);
  const page = paginateCatalog(filtered, limit);
  const filters = ["all", "published", "draft", "public", "archived"] as const;
  return <>
    <div className="sqc-community-browse-panel" aria-label="My Custom Side Quest filters">
      <label className="sqc-search-shell"><span className="sr-only">Search my custom Side Quests</span><input aria-label="Search my custom Side Quests" placeholder="Search by name or rule" value={query} onChange={event => { setQuery(event.target.value); setLimit(12); }} /></label>
      <div className="sqc-community-controls"><div className="sqc-filter-row" aria-label="Filter my custom Side Quests">{filters.map(value => <button type="button" key={value} className={filter === value ? "active" : ""} aria-pressed={filter === value} onClick={() => { setFilter(value); setLimit(12); }}>{value === "draft" ? "Drafts" : value[0].toUpperCase() + value.slice(1)}</button>)}</div>
      <label className="sqc-sort-pill">Sort <select aria-label="Sort my custom Side Quests" value={sort} onChange={event => setSort(event.target.value as typeof sort)}><option value="newest">Recently updated</option><option value="name">Name</option></select></label></div>
    </div>
    <span aria-live="polite">{page.total} result{page.total === 1 ? "" : "s"}</span>
    {page.rows.length ? <div className="sqc-catalog">{page.rows.map(row => <CatalogRow key={row.id} row={row} status={row.status ?? "Ready"} />)}</div> : <div className="sqc-empty-panel standalone"><strong>No custom Side Quests match these filters.</strong><span>{rows.length ? "Try another search or filter." : "Create a draft first, then publish it when the rule feels ready."}</span></div>}
    {page.hasMore ? <button type="button" className="sqc-detail-secondary-button" onClick={() => setLimit(value => value + 12)}>Load more</button> : null}
  </>;
}

export function CommunityMultiplayerCatalog({ rows, signedIn, initialHost = null }: { rows: MobileWebMultiplayerPreview[]; signedIn: boolean; initialHost?: string | null }) {
  const [query, setQuery] = useState("");
  const host = initialHost;
  const [filter, setFilter] = useState<"all" | "open" | "joined" | "hosted" | "finished">(() => initialHost ? "all" : "open");
  const [sort, setSort] = useState<"closing" | "newest" | "name">("closing");
  const hostRows = useMemo(() => host ? rows.filter(row => row.publiclyListed && row.hostName === host) : rows, [rows, host]);
  const filtered = useMemo(() => filterMultiplayerCatalog(hostRows, { query, filter, sort }), [hostRows, query, filter, sort]);
  const activeMine = rows.filter(row => row.lifecycle === "open" && (row.status === "Hosted" || row.status === "Joined"));
  const finishedMine = rows.filter(row => row.lifecycle === "finished" && (row.status === "Hosted" || row.status === "Joined"));

  return (
    <>
      {signedIn ? <>
        <section className="sqc-native-card green" aria-label="Your Multiplayer Side Quests"><span className="sqc-card-eyebrow">Active · {activeMine.length}</span><h2>Your active Multiplayer Side Quests.</h2>{activeMine.length ? <div className="sqc-catalog">{activeMine.map(row => <MultiplayerCatalogRow key={row.id} row={row} status={row.status} signedIn={signedIn} />)}</div> : <div className="sqc-empty-panel"><strong>No active Multiplayer Side Quests yet.</strong><span>Join an open quest, use an invite code, or create your own.</span></div>}</section>
        <section className="sqc-native-card green" aria-label="Finished Multiplayer Side Quests"><span className="sqc-card-eyebrow">Recently finished · {finishedMine.length}</span><h2>Recently finished Multiplayer Side Quests.</h2>{finishedMine.length ? <div className="sqc-catalog">{finishedMine.map(row => <MultiplayerCatalogRow key={row.id} row={row} status="Finished" signedIn={signedIn} />)}</div> : <p>No finished Multiplayer Side Quests yet.</p>}</section>
      </> : null}
      <section className="sqc-native-card green" aria-label="Community Multiplayer Side Quests">
        <span className="sqc-card-eyebrow">Community catalog</span><h2>Community Multiplayer Side Quests.</h2>
        <div className="sqc-community-browse-panel">
          {host ? <div className="sqc-empty-panel"><strong>Host shelf: {host}</strong><span>Showing public Community Multiplayer Side Quests from this host.</span><Link href="/multiplayer-side-quests?tab=community" className="sqc-detail-secondary-button">Show all hosts</Link></div> : null}
          <label className="sqc-search-shell"><input value={query} onChange={event => setQuery(event.target.value)} placeholder={host ? "Search this host shelf" : "Search multiplayer community"} aria-label="Search multiplayer community" /></label>
          <div className="sqc-community-controls"><div className="sqc-filter-row" aria-label="Filter multiplayer community">{(["open", "all", ...(signedIn ? ["joined", "hosted", "finished"] : [])] as typeof filter[]).map(value => <button type="button" key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{value[0].toUpperCase() + value.slice(1)}</button>)}</div>
          <label className="sqc-sort-pill">Sort <select aria-label="Sort multiplayer community" value={sort} onChange={event => setSort(event.target.value as typeof sort)}><option value="closing">Closing</option><option value="newest">Newest</option><option value="name">Name</option></select></label></div>
        </div>
        {filtered.length ? <div className="sqc-catalog">{filtered.map(row => <MultiplayerCatalogRow key={row.id} row={row} signedIn={signedIn} status={signedIn ? row.lifecycle === "finished" ? "Finished" : row.status : "View"} />)}</div> : <div className="sqc-empty-panel"><strong>No Multiplayer Side Quests match these filters.</strong><span>{rows.length ? "Try another search or filter." : "No public Community Multiplayer Side Quests yet."}</span></div>}
      </section>
    </>
  );
}
