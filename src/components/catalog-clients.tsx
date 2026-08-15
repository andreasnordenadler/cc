"use client";

import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import OfficialSoloLikeControl from "./official-solo-like-control";
import { applyCommunitySoloLikeState, applyMultiplayerLikeState, filterCommunitySoloCatalog, filterCustomCatalog, filterMultiplayerCatalog, getCommunityMultiplayerEmptyState, getCommunitySoloEmptyState, paginateCatalog, type CommunitySoloCatalogFilter, type CommunitySoloCatalogSort } from "@/lib/catalog-models";
import type { MobileWebMultiplayerPreview } from "@/lib/mobile-web-multiplayer";
import { buildCommunityDiscoveryHref, buildCommunityQuestDetailHref, type CommunityDiscoveryState } from "@/lib/community-discovery-state";

export type SoloCatalogClientRow = {
  id: string; title: string; meta: string; href: string; image?: string | null; sourceBadge?: string | null; status?: string | null;
};

export type CustomCatalogClientRow = SoloCatalogClientRow & {
  lifecycle: "draft" | "published" | "archived";
  visibility: "private" | "public";
  updatedAt: string;
};

function CatalogRow({ row, status, showImage = false }: { row: SoloCatalogClientRow; status: string; showImage?: boolean }) {
  return (
    <Link href={row.href} className={showImage ? "sqc-app-row" : "sqc-app-row text-only"}>
      {showImage ? <span className="sqc-row-icon" aria-hidden="true">
        <Image className="sqc-row-glow generic" alt="" src="/mobile-source/badges/glow/sqc-coat-generic-glow.png" width={50} height={50} />
        <Image className="sqc-row-image" alt="" src={row.image ?? "/mobile-source/badges/custom-side-quest-crest.png"} width={42} height={42} />
      </span> : null}
      <span className="sqc-row-copy">
        {row.sourceBadge ? <span className="sqc-row-badge">{row.sourceBadge}</span> : null}
        <strong className="sqc-row-title-line"><span>{row.title}</span></strong>
        <small>{row.meta}</small>
      </span>
      <span className="sqc-row-status">{status}</span>
    </Link>
  );
}

function CommunitySoloCatalogRow({ row, signedIn, returnTo, onLikeStateChange }: { row: CommunitySoloCatalogClientRow; signedIn: boolean; returnTo: string; onLikeStateChange: (liked: boolean) => void }) {
  const detailHref = buildCommunityQuestDetailHref(row.id, returnTo);
  return (
    <div className="sqc-app-row sqc-app-row-with-like">
      <Link href={detailHref} className="sqc-app-row-main" aria-label={`Open ${row.title}`} />
      <span className="sqc-row-icon" aria-hidden="true">
        <Image className="sqc-row-glow generic" alt="" src="/mobile-source/badges/glow/sqc-coat-generic-glow.png" width={50} height={50} />
        <Image className="sqc-row-image" alt="" src={row.image ?? "/mobile-source/badges/custom-side-quest-crest.png"} width={42} height={42} />
      </span>
      <span className="sqc-row-copy">
        <span className="sqc-community-row-context">
          {row.sourceBadge ? <span className="sqc-row-badge">{row.sourceBadge}</span> : null}
          {row.isNew ? <span className="sqc-community-row-freshness">New this month</span> : null}
        </span>
        <span className="sqc-row-title-line">
          <strong><span>{row.title}</span></strong>
          <OfficialSoloLikeControl
            targetId={row.id}
            count={row.likeCount}
            likedByViewer={row.likedByViewer}
            signedIn={signedIn}
            returnTo={returnTo}
            label={row.title}
            onLikeStateChange={onLikeStateChange}
          />
        </span>
        <small className="sqc-community-row-mobile-meta">{row.meta}</small>
        <span className="sqc-community-row-details">
          {row.creatorName && row.creatorBrowsePath ? (
            <Link
              className="sqc-community-row-creator"
              href={row.creatorBrowsePath}
              aria-label={`Browse Side Quests by ${row.creatorName}`}
            >
              By {row.creatorName}
            </Link>
          ) : row.creatorName ? <span className="sqc-community-row-creator">By {row.creatorName}</span> : null}
          <span className="sqc-community-row-summary">{row.summary}</span>
          <span className="sqc-community-row-stats" role="group" aria-label="Quest activity">
            <span className="sqc-community-row-stat"><strong>{row.stats.soloAttempts}</strong><small>{row.stats.soloAttempts === 1 ? "try" : "tries"}</small></span>
            <span className="sqc-community-row-stat"><strong>{row.stats.soloCompletions}</strong><small>completed</small></span>
            <span className="sqc-community-row-stat"><strong>{row.stats.multiplayerLineups}</strong><small>multiplayer {row.stats.multiplayerLineups === 1 ? "use" : "uses"}</small></span>
          </span>
          <span className="sqc-community-row-open">View Side Quest details <span aria-hidden="true">→</span></span>
        </span>
      </span>
      <span className="sqc-row-status">{row.status ?? "Ready"}</span>
    </div>
  );
}

function MultiplayerCatalogRow({ row, status, signedIn, externallyBusy, stateGeneration, onLikeStateChange, onMutationSettled }: { row: MobileWebMultiplayerPreview; status: string; signedIn: boolean; externallyBusy: boolean; stateGeneration: number; onLikeStateChange: (liked: boolean) => void; onMutationSettled: () => void }) {
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
            onLikeStateChange={onLikeStateChange}
            externallyBusy={externallyBusy}
            onMutationSettled={onMutationSettled}
            stateGeneration={stateGeneration}
          />
        </span>
        <small>{row.meta}</small>
      </span>
      <span className="sqc-row-status">{status}</span>
    </div>
  );
}

export type CommunitySoloCatalogClientRow = SoloCatalogClientRow & {
  creatorKey?: string;
  creatorName?: string;
  creatorBrowsePath?: string;
  summary: string;
  stats: {
    soloAttempts: number;
    soloCompletions: number;
    multiplayerLineups: number;
  };
  updatedAtMs: number;
  popularityScore: number;
  likeCount: number;
  likedByViewer: boolean;
  completedByViewer: boolean;
  isNew: boolean;
};

export function CommunitySoloCatalog({ rows, signedIn, initialCreator = null, initialState }: { rows: CommunitySoloCatalogClientRow[]; signedIn: boolean; initialCreator?: string | null; initialState?: CommunityDiscoveryState }) {
  const [liveRows, setLiveRows] = useState(rows);
  const [query, setQuery] = useState(initialState?.query ?? "");
  const [filter, setFilter] = useState<CommunitySoloCatalogFilter>(initialState?.filter ?? "all");
  const [sort, setSort] = useState<CommunitySoloCatalogSort>(initialState?.sort ?? "popular");
  const [limit, setLimit] = useState(initialState?.limit ?? 10);
  const creatorRow = initialCreator ? liveRows.find((row) => row.creatorKey === initialCreator) : null;
  const creator = creatorRow?.creatorKey ?? null;
  const filtered = useMemo(() => filterCommunitySoloCatalog(liveRows, { query, filter, sort, creator }), [liveRows, query, filter, sort, creator]);
  const page = paginateCatalog(filtered, limit);
  const catalogSummary = useMemo(() => {
    const creators = new Set(liveRows.map((row) => row.creatorKey ?? row.creatorName ?? `quest:${row.id}`));
    return liveRows.reduce((summary, row) => {
      summary.attempts += row.stats.soloAttempts;
      summary.completions += row.stats.soloCompletions;
      summary.multiplayerUses += row.stats.multiplayerLineups;
      return summary;
    }, {
      quests: liveRows.length,
      creators: creators.size,
      attempts: 0,
      completions: 0,
      multiplayerUses: 0,
    });
  }, [liveRows]);
  const filters: Array<{ value: CommunitySoloCatalogFilter; label: string }> = [
    { value: "all", label: "All" },
    { value: "popular", label: "Popular" },
    { value: "new", label: "New" },
    { value: "completed", label: "Completed" },
  ];
  const discoveryHref = buildCommunityDiscoveryHref({ query, filter, sort, limit, creator });

  function replaceDiscoveryState(next: Partial<CommunityDiscoveryState>) {
    const href = buildCommunityDiscoveryHref({ query, filter, sort, limit, creator, ...next });
    window.history.replaceState(null, "", href);
  }

  return (
    <>
      <div className="sqc-community-browse-panel" aria-label="Community Side Quest filters">
        <label className="sqc-search-shell">
          <span className="sr-only">Search Community Side Quests</span>
          <input value={query} onChange={(event) => { const nextQuery = event.target.value; setQuery(nextQuery); setLimit(10); replaceDiscoveryState({ query: nextQuery, limit: 10 }); }} placeholder="Search by name or rule" aria-label="Search Community Side Quests" />
        </label>
        <div className="sqc-community-controls">
          <div className="sqc-filter-row" aria-label="Filter Community Side Quests">
            {filters.map(({ value, label }) => (
              <button type="button" key={value} className={filter === value ? "active" : ""} aria-pressed={filter === value} onClick={() => { setFilter(value); setLimit(10); replaceDiscoveryState({ filter: value, limit: 10 }); }}>{label}</button>
            ))}
          </div>
          <label className="sqc-sort-pill">Sort <select aria-label="Sort Community Side Quests" value={sort} onChange={(event) => { const nextSort = event.target.value as CommunitySoloCatalogSort; setSort(nextSort); setLimit(10); replaceDiscoveryState({ sort: nextSort, limit: 10 }); }}><option value="popular">Top</option><option value="liked">Liked</option><option value="newest">Newest</option><option value="name">A–Z</option></select></label>
        </div>
      </div>
      <span>{page.total} result{page.total === 1 ? "" : "s"}</span>
      {page.rows.length ? (
        <div className={page.rows.length === 1 ? "sqc-community-results-layout single-result" : "sqc-community-results-layout"}>
          <div className={page.rows.length === 1 ? "sqc-catalog single-result" : "sqc-catalog"}>
            {page.rows.map(row => <CommunitySoloCatalogRow key={row.id} row={row} signedIn={signedIn} returnTo={discoveryHref} onLikeStateChange={(liked) => setLiveRows((current) => applyCommunitySoloLikeState(current, row.id, liked))} />)}
          </div>
          {page.rows.length === 1 ? (
            <aside className="sqc-community-catalog-summary" aria-label="Public catalog at a glance">
              <span>Across the full public catalog</span>
              <h3>Community at a glance</h3>
              <p>Real activity from every public Community Side Quest.</p>
              <div>
                <span><strong>{catalogSummary.quests}</strong><span>public {catalogSummary.quests === 1 ? "quest" : "quests"}</span></span>
                <span><strong>{catalogSummary.creators}</strong><span>{catalogSummary.creators === 1 ? "creator" : "creators"}</span></span>
                <span><strong>{catalogSummary.attempts}</strong><span>attempts</span></span>
                <span><strong>{catalogSummary.completions}</strong><span>{catalogSummary.completions === 1 ? "completion" : "completions"}</span></span>
                <span><strong>{catalogSummary.multiplayerUses}</strong><span>multiplayer uses</span></span>
              </div>
            </aside>
          ) : null}
        </div>
      ) : (() => {
        const emptyState = getCommunitySoloEmptyState({ hasCatalogRows: liveRows.length > 0, signedIn });
        return <div className="sqc-empty-panel standalone"><strong>{emptyState.title}</strong><span>{emptyState.guidance}</span></div>;
      })()}
      {page.hasMore ? <button type="button" className="sqc-detail-secondary-button" onClick={() => { const nextLimit = limit + 10; setLimit(nextLimit); replaceDiscoveryState({ limit: nextLimit }); }}>Load more</button> : null}
    </>
  );
}

export function CustomSoloCatalog({ rows }: { rows: CustomCatalogClientRow[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft" | "public" | "archived">("all");
  const filtered = useMemo(() => filterCustomCatalog(rows, { query, filter, sort: "newest" }), [rows, query, filter]);
  const filters = ["all", "published", "draft", "public", "archived"] as const;
  return <>
    <div className="sqc-community-browse-panel" aria-label="My Custom Side Quest filters">
      <label className="sqc-search-shell"><span className="sr-only">Search my custom Side Quests</span><input aria-label="Search my custom Side Quests" placeholder="Search by name or rule" value={query} onChange={event => setQuery(event.target.value)} /></label>
      <div className="sqc-community-controls"><div className="sqc-filter-row" aria-label="Filter my custom Side Quests">{filters.map(value => <button type="button" key={value} className={filter === value ? "active" : ""} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value === "draft" ? "Drafts" : value[0].toUpperCase() + value.slice(1)}</button>)}</div></div>
    </div>
    <span aria-live="polite">{filtered.length} result{filtered.length === 1 ? "" : "s"}</span>
    {filtered.length ? <div className="sqc-catalog">{filtered.map((row: CustomCatalogClientRow) => <CatalogRow key={row.id} row={row} status={row.status ?? "Ready"} showImage />)}</div> : <div className="sqc-empty-panel standalone"><strong>No custom Side Quests match these filters.</strong><span>{rows.length ? "Try another search or filter." : "Create a draft first, then publish it when the rule feels ready."}</span></div>}
  </>;
}

export function CommunityMultiplayerCatalog({ rows, signedIn, initialHost = null, catalogStatus = "available" }: { rows: MobileWebMultiplayerPreview[]; signedIn: boolean; initialHost?: string | null; catalogStatus?: "available" | "unavailable" }) {
  const [liveRows, setLiveRows] = useState(rows);
  const [previousRows, setPreviousRows] = useState(rows);
  const [pendingLikeIds, setPendingLikeIds] = useState<Set<string>>(() => new Set());
  const [rowsGeneration, setRowsGeneration] = useState(0);
  const rowsGenerationRef = useRef(rowsGeneration);
  useLayoutEffect(() => {
    rowsGenerationRef.current = rowsGeneration;
  }, [rowsGeneration]);
  const [query, setQuery] = useState("");
  const host = initialHost;
  const [filter, setFilter] = useState<"all" | "open" | "joined" | "hosted" | "finished">(() => initialHost ? "all" : "open");
  const [sort, setSort] = useState<"closing" | "liked" | "newest" | "players">("closing");
  const [limit, setLimit] = useState(4);
  const [mineListLimit, setMineListLimit] = useState(4);
  const [historyListLimit, setHistoryListLimit] = useState(3);
  if (rows !== previousRows) {
    setPreviousRows(rows);
    setLiveRows(rows);
    setRowsGeneration((current) => current + 1);
  }
  const publicRows = useMemo(() => liveRows.filter(row => row.publiclyListed), [liveRows]);
  const hostRows = useMemo(() => host ? publicRows.filter(row => row.hostName === host) : publicRows, [publicRows, host]);
  const filtered = useMemo(() => filterMultiplayerCatalog(hostRows, { query, filter, sort }), [hostRows, query, filter, sort]);
  const page = paginateCatalog(filtered, limit);
  const activeMine = liveRows.filter(row => row.lifecycle === "open" && (row.status === "Hosted" || row.status === "Joined"));
  const visibleActiveMine = activeMine.slice(0, mineListLimit);
  const hiddenMineCount = Math.max(0, activeMine.length - visibleActiveMine.length);
  const finishedMine = liveRows.filter(row => row.lifecycle === "finished" && (row.status === "Hosted" || row.status === "Joined"));
  const visibleFinishedMine = finishedMine.slice(0, historyListLimit);
  const hiddenHistoryCount = Math.max(0, finishedMine.length - visibleFinishedMine.length);

  return (
    <>
      {signedIn ? <>
        <section className="sqc-native-card green" aria-label="Your Multiplayer Side Quests"><span className="sqc-card-eyebrow">Active · {activeMine.length}</span><h2>Your active Multiplayer Side Quests.</h2>{activeMine.length ? <div className="sqc-catalog">{visibleActiveMine.map(row => <MultiplayerCatalogRow key={row.id} row={row} status={row.status} signedIn={signedIn} stateGeneration={rowsGeneration} externallyBusy={pendingLikeIds.has(row.id)} onLikeStateChange={(liked) => { setPendingLikeIds((current) => new Set(current).add(row.id)); if (rowsGenerationRef.current === rowsGeneration) { setLiveRows((current) => applyMultiplayerLikeState(current, row.id, liked)); } }} onMutationSettled={() => setPendingLikeIds((current) => { const next = new Set(current); next.delete(row.id); return next; })} />)}</div> : <div className="sqc-empty-panel"><strong>No active Multiplayer Side Quests yet.</strong><span>Join an open quest, use an invite code, or create your own.</span></div>}{hiddenMineCount ? <button type="button" className="sqc-detail-secondary-button" aria-label="Show more of my Multiplayer Side Quests" onClick={() => setMineListLimit((current) => current + 4)}>More my quests ({hiddenMineCount})</button> : null}</section>
        <section className="sqc-native-card green" aria-label="Finished Multiplayer Side Quests"><span className="sqc-card-eyebrow">Recently finished · {finishedMine.length}</span><h2>Recently finished Multiplayer Side Quests.</h2>{finishedMine.length ? <div className="sqc-catalog">{visibleFinishedMine.map(row => <MultiplayerCatalogRow key={row.id} row={row} status="Finished" signedIn={signedIn} stateGeneration={rowsGeneration} externallyBusy={pendingLikeIds.has(row.id)} onLikeStateChange={(liked) => { setPendingLikeIds((current) => new Set(current).add(row.id)); if (rowsGenerationRef.current === rowsGeneration) { setLiveRows((current) => applyMultiplayerLikeState(current, row.id, liked)); } }} onMutationSettled={() => setPendingLikeIds((current) => { const next = new Set(current); next.delete(row.id); return next; })} />)}</div> : <p>No finished Multiplayer Side Quests yet.</p>}{hiddenHistoryCount ? <button type="button" className="sqc-detail-secondary-button" aria-label="Show more finished Multiplayer Side Quests" onClick={() => setHistoryListLimit((current) => current + 3)}>More history ({hiddenHistoryCount})</button> : null}</section>
      </> : null}
      <section className="sqc-native-card green" aria-label="Community Multiplayer Side Quests">
        <span className="sqc-card-eyebrow">Community catalog</span><h2>Community Multiplayer Side Quests.</h2>
        <div className="sqc-community-browse-panel">
          {host ? <div className="sqc-empty-panel"><strong>Host shelf: {host}</strong><span>Showing public Community Multiplayer Side Quests from this host.</span><Link href="/multiplayer-side-quests?tab=community" className="sqc-detail-secondary-button">Show all hosts</Link></div> : null}
          <label className="sqc-search-shell"><input value={query} onChange={event => { setQuery(event.target.value); setLimit(4); }} placeholder={host ? "Search this host shelf" : "Search multiplayer community"} aria-label="Search multiplayer community" /></label>
          <div className="sqc-community-controls"><div className="sqc-filter-row" aria-label="Filter multiplayer community">{(["open", "all", ...(signedIn ? ["joined", "hosted", "finished"] : [])] as typeof filter[]).map(value => <button type="button" key={value} className={filter === value ? "active" : ""} onClick={() => { setFilter(value); setLimit(4); }}>{value[0].toUpperCase() + value.slice(1)}</button>)}</div>
          <label className="sqc-sort-pill">Sort <select aria-label="Sort multiplayer community" value={sort} onChange={event => { setSort(event.target.value as typeof sort); setLimit(4); }}><option value="closing">Closing</option><option value="liked">Liked</option><option value="newest">New</option><option value="players">Players</option></select></label></div>
        </div>
        {page.rows.length ? <div className="sqc-catalog">{page.rows.map(row => <MultiplayerCatalogRow key={row.id} row={row} signedIn={signedIn} status={signedIn ? row.lifecycle === "finished" ? "Finished" : row.status : "View"} stateGeneration={rowsGeneration} externallyBusy={pendingLikeIds.has(row.id)} onLikeStateChange={(liked) => { setPendingLikeIds((current) => new Set(current).add(row.id)); if (rowsGenerationRef.current === rowsGeneration) { setLiveRows((current) => applyMultiplayerLikeState(current, row.id, liked)); } }} onMutationSettled={() => setPendingLikeIds((current) => { const next = new Set(current); next.delete(row.id); return next; })} />)}</div> : (() => {
          if (catalogStatus === "unavailable") return <div className="sqc-empty-panel"><strong>Public Multiplayer Side Quests could not be loaded.</strong><span>Check your connection and try again.</span></div>;
          const emptyState = getCommunityMultiplayerEmptyState({ hasCatalogRows: publicRows.length > 0, hasHostFilter: Boolean(host) });
          return <div className="sqc-empty-panel"><strong>{emptyState.title}</strong>{emptyState.guidance ? <span>{emptyState.guidance}</span> : null}</div>;
        })()}
        {page.hasMore ? <button type="button" className="sqc-detail-secondary-button" onClick={() => setLimit(value => value + 4)}>More community Side Quests ({page.total - page.rows.length})</button> : null}
      </section>
    </>
  );
}
