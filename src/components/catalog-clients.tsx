"use client";

import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import OfficialSoloLikeControl from "./official-solo-like-control";
import { applyCommunitySoloLikeState, applyMultiplayerLikeState, filterCommunitySoloCatalog, filterCustomCatalog, filterMultiplayerCatalog, paginateCatalog, type CommunitySoloCatalogFilter, type CommunitySoloCatalogSort } from "@/lib/catalog-models";
import type { MobileWebMultiplayerPreview } from "@/lib/mobile-web-multiplayer";

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

function CommunitySoloCatalogRow({ row, signedIn, onLikeStateChange }: { row: CommunitySoloCatalogClientRow; signedIn: boolean; onLikeStateChange: (liked: boolean) => void }) {
  return (
    <div className="sqc-app-row sqc-app-row-with-like">
      <Link href={row.href} className="sqc-app-row-main" aria-label={`Open ${row.title}`} />
      <span className="sqc-row-icon" aria-hidden="true">
        <Image className="sqc-row-glow generic" alt="" src="/mobile-source/badges/glow/sqc-coat-generic-glow.png" width={50} height={50} />
        <Image className="sqc-row-image" alt="" src={row.image ?? "/mobile-source/badges/custom-side-quest-crest.png"} width={42} height={42} />
      </span>
      <span className="sqc-row-copy">
        {row.sourceBadge ? <span className="sqc-row-badge">{row.sourceBadge}</span> : null}
        <span className="sqc-row-title-line">
          <strong><span>{row.title}</span></strong>
          <OfficialSoloLikeControl
            targetId={row.id}
            count={row.likeCount}
            likedByViewer={row.likedByViewer}
            signedIn={signedIn}
            returnTo="/community-side-quests"
            label={row.title}
            onLikeStateChange={onLikeStateChange}
          />
        </span>
        <small>{row.meta}</small>
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
  updatedAtMs: number;
  popularityScore: number;
  likeCount: number;
  likedByViewer: boolean;
  completedByViewer: boolean;
  isNew: boolean;
};

export function CommunitySoloCatalog({ rows, signedIn, initialCreator = null }: { rows: CommunitySoloCatalogClientRow[]; signedIn: boolean; initialCreator?: string | null }) {
  const [liveRows, setLiveRows] = useState(rows);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CommunitySoloCatalogFilter>("all");
  const [sort, setSort] = useState<CommunitySoloCatalogSort>("popular");
  const [limit, setLimit] = useState(10);
  const creatorRow = initialCreator ? liveRows.find((row) => row.creatorKey === initialCreator) : null;
  const creator = creatorRow?.creatorKey ?? null;
  const filtered = useMemo(() => filterCommunitySoloCatalog(liveRows, { query, filter, sort, creator }), [liveRows, query, filter, sort, creator]);
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
        {creatorRow ? <div className="sqc-empty-panel"><strong>Creator shelf: {creatorRow.creatorName ?? "SQC player"}</strong><span>Showing public Community Solo Side Quests from this creator.</span><Link href="/community-side-quests" className="sqc-detail-secondary-button">Show all creators</Link></div> : null}
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
      {page.rows.length ? <div className="sqc-catalog">{page.rows.map(row => <CommunitySoloCatalogRow key={row.id} row={row} signedIn={signedIn} onLikeStateChange={(liked) => setLiveRows((current) => applyCommunitySoloLikeState(current, row.id, liked))} />)}</div> : (
        <div className="sqc-empty-panel standalone"><strong>No Community Side Quests match these filters.</strong><span>{liveRows.length ? "Try another search or filter." : signedIn ? "Create the first public Side Quest from My Custom Side Quests." : "Public player-made Side Quests will appear here."}</span></div>
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
  if (rows !== previousRows) {
    setPreviousRows(rows);
    setLiveRows(rows);
    setRowsGeneration((current) => current + 1);
  }
  const hostRows = useMemo(() => host ? liveRows.filter(row => row.publiclyListed && row.hostName === host) : liveRows, [liveRows, host]);
  const filtered = useMemo(() => filterMultiplayerCatalog(hostRows, { query, filter, sort }), [hostRows, query, filter, sort]);
  const page = paginateCatalog(filtered, limit);
  const activeMine = liveRows.filter(row => row.lifecycle === "open" && (row.status === "Hosted" || row.status === "Joined"));
  const finishedMine = liveRows.filter(row => row.lifecycle === "finished" && (row.status === "Hosted" || row.status === "Joined"));

  return (
    <>
      {signedIn ? <>
        <section className="sqc-native-card green" aria-label="Your Multiplayer Side Quests"><span className="sqc-card-eyebrow">Active · {activeMine.length}</span><h2>Your active Multiplayer Side Quests.</h2>{activeMine.length ? <div className="sqc-catalog">{activeMine.map(row => <MultiplayerCatalogRow key={row.id} row={row} status={row.status} signedIn={signedIn} stateGeneration={rowsGeneration} externallyBusy={pendingLikeIds.has(row.id)} onLikeStateChange={(liked) => { setPendingLikeIds((current) => new Set(current).add(row.id)); if (rowsGenerationRef.current === rowsGeneration) { setLiveRows((current) => applyMultiplayerLikeState(current, row.id, liked)); } }} onMutationSettled={() => setPendingLikeIds((current) => { const next = new Set(current); next.delete(row.id); return next; })} />)}</div> : <div className="sqc-empty-panel"><strong>No active Multiplayer Side Quests yet.</strong><span>Join an open quest, use an invite code, or create your own.</span></div>}</section>
        <section className="sqc-native-card green" aria-label="Finished Multiplayer Side Quests"><span className="sqc-card-eyebrow">Recently finished · {finishedMine.length}</span><h2>Recently finished Multiplayer Side Quests.</h2>{finishedMine.length ? <div className="sqc-catalog">{finishedMine.map(row => <MultiplayerCatalogRow key={row.id} row={row} status="Finished" signedIn={signedIn} stateGeneration={rowsGeneration} externallyBusy={pendingLikeIds.has(row.id)} onLikeStateChange={(liked) => { setPendingLikeIds((current) => new Set(current).add(row.id)); if (rowsGenerationRef.current === rowsGeneration) { setLiveRows((current) => applyMultiplayerLikeState(current, row.id, liked)); } }} onMutationSettled={() => setPendingLikeIds((current) => { const next = new Set(current); next.delete(row.id); return next; })} />)}</div> : <p>No finished Multiplayer Side Quests yet.</p>}</section>
      </> : null}
      <section className="sqc-native-card green" aria-label="Community Multiplayer Side Quests">
        <span className="sqc-card-eyebrow">Community catalog</span><h2>Community Multiplayer Side Quests.</h2>
        <div className="sqc-community-browse-panel">
          {host ? <div className="sqc-empty-panel"><strong>Host shelf: {host}</strong><span>Showing public Community Multiplayer Side Quests from this host.</span><Link href="/multiplayer-side-quests?tab=community" className="sqc-detail-secondary-button">Show all hosts</Link></div> : null}
          <label className="sqc-search-shell"><input value={query} onChange={event => { setQuery(event.target.value); setLimit(4); }} placeholder={host ? "Search this host shelf" : "Search multiplayer community"} aria-label="Search multiplayer community" /></label>
          <div className="sqc-community-controls"><div className="sqc-filter-row" aria-label="Filter multiplayer community">{(["open", "all", ...(signedIn ? ["joined", "hosted", "finished"] : [])] as typeof filter[]).map(value => <button type="button" key={value} className={filter === value ? "active" : ""} onClick={() => { setFilter(value); setLimit(4); }}>{value[0].toUpperCase() + value.slice(1)}</button>)}</div>
          <label className="sqc-sort-pill">Sort <select aria-label="Sort multiplayer community" value={sort} onChange={event => { setSort(event.target.value as typeof sort); setLimit(4); }}><option value="closing">Closing</option><option value="liked">Liked</option><option value="newest">New</option><option value="players">Players</option></select></label></div>
        </div>
        {page.rows.length ? <div className="sqc-catalog">{page.rows.map(row => <MultiplayerCatalogRow key={row.id} row={row} signedIn={signedIn} status={signedIn ? row.lifecycle === "finished" ? "Finished" : row.status : "View"} stateGeneration={rowsGeneration} externallyBusy={pendingLikeIds.has(row.id)} onLikeStateChange={(liked) => { setPendingLikeIds((current) => new Set(current).add(row.id)); if (rowsGenerationRef.current === rowsGeneration) { setLiveRows((current) => applyMultiplayerLikeState(current, row.id, liked)); } }} onMutationSettled={() => setPendingLikeIds((current) => { const next = new Set(current); next.delete(row.id); return next; })} />)}</div> : <div className="sqc-empty-panel"><strong>No Multiplayer Side Quests match these filters.</strong><span>{liveRows.length ? "Try another search or filter." : "No public Community Multiplayer Side Quests yet."}</span></div>}
        {page.hasMore ? <button type="button" className="sqc-detail-secondary-button" onClick={() => setLimit(value => value + 4)}>More community Side Quests ({page.total - page.rows.length})</button> : null}
      </section>
    </>
  );
}
