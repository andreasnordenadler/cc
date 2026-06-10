import Image from "next/image";
import Link from "next/link";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { CommunitySoloAnalytics, CommunitySoloAnalyticsLink } from "@/components/analytics/community-solo-analytics";
import SiteNav from "@/components/site-nav";
import { listPublicCommunitySideQuests, type PublicCommunitySideQuest } from "@/lib/community-side-quests";
import { listPublicGroupQuests } from "@/lib/groupquests";
import { getChallengeProgress, type UserMetadataRecord } from "@/lib/user-metadata";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Community Solo Side Quests · Side Quest Chess",
  description: "Browse public player-created Solo Side Quests for Side Quest Chess.",
};

type CommunitySearchParams = {
  creator?: string;
  q?: string;
  filter?: string;
  sort?: string;
};

export default async function CommunitySideQuestsPage({ searchParams }: { searchParams?: Promise<CommunitySearchParams> }) {
  const { userId } = await auth();
  const resolvedSearchParams: CommunitySearchParams = searchParams ? await searchParams : {};
  const { creator } = resolvedSearchParams;
  const communityQuery = cleanCommunityQuery(resolvedSearchParams.q);
  const communityFilter = cleanCommunityFilter(resolvedSearchParams.filter);
  const communitySort = cleanCommunitySort(resolvedSearchParams.sort, communityFilter);
  const client = await clerkClient();
  const publicGroupQuests = await listPublicGroupQuests(client);
  const completedIds = await getSignedInCompletedIds(client, userId);
  const quests = await listPublicCommunitySideQuests(client, { limit: 80, groupQuests: publicGroupQuests });
  const selectedCreator = typeof creator === "string" ? decodeURIComponent(creator) : null;
  const visibleQuests = sortCommunityQuests(
    quests.filter((quest) => matchesCommunityFilters(quest, { selectedCreator, communityQuery, communityFilter, completedIds })),
    communitySort,
  );
  const selectedCreatorQuest = selectedCreator ? quests.find((quest) => quest.creatorKey === selectedCreator) : null;
  const activeFilterCount = [selectedCreator, communityQuery, communityFilter !== "all" ? communityFilter : null].filter(Boolean).length;

  return (
    <main className="site-shell">
      <CommunitySoloAnalytics
        type={selectedCreator ? "community_solo_creator_filter" : "community_solo_browse"}
        status={selectedCreator ? "creator_filter" : communityFilter}
        onceKey={`community-solo:${selectedCreator ?? "all"}:${communityFilter}:${communitySort}:${communityQuery}:${visibleQuests.length}`}
      />
      <SiteNav isSignedIn={Boolean(userId)} active="challenges" />

      <div className="content-wrap">
        <section className="hero-card side-quests-hub-hero">
          <span className="eyebrow">Community Solo Side Quests</span>
          <h1>The bad ideas escaped into the village.</h1>
          <p className="hero-copy">
            Browse public Solo Side Quests made by SQC players. Some are elegant. Some are cursed. Inspect the rules, share a link, report anything off, and start the quest from the same SQC account you use everywhere.
          </p>
          <div className="hero-actions button-row">
            <Link className="button secondary" href="/challenges">Back to SQC Official</Link>
            <CommunitySoloAnalyticsLink className="button primary" href="/account" type="community_solo_account_handoff" status="browse_hero">Open account to start</CommunitySoloAnalyticsLink>
          </div>
        </section>

        <section className="mission-card" aria-label="Community Solo Side Quest explanation">
          <div className="section-head">
            <div>
              <span className="eyebrow">How community works</span>
              <h2>Public recipes, private chaos control.</h2>
              <p>
                Community Side Quests are player-created rules published for other players to inspect and try. SQC Official quests stay separate; Community is where the weird experiments live.
              </p>
            </div>
          </div>
          <div className="grid side-quest-mode-grid">
            <InfoCard title="SQC Official stays curated" copy="Official quests are released by SQC with verifier gates and coat-of-arms identity." />
            <InfoCard title="Community stays labeled" copy="Player-created quests show public player names and custom rule summaries so you know whose bad idea you are borrowing." />
            <InfoCard title="Ready when the rule hooks you" copy="Community Solo keeps discovery, inspection, starting, proof, reporting, and rewards in one SQC account path, so a strange public recipe can become your next run without losing context." />
            <InfoCard title="Report weird quests" copy="If a public rule looks abusive, confusing, or broken, use Support and include the quest title. Community should feel odd, not hostile." />
          </div>
        </section>

        <section className="mission-card" aria-label="Public Community Solo Side Quest listings">
          <div className="section-head">
            <div>
              <span className="eyebrow">Open community recipes</span>
              <h2>Pick someone else’s strange rule.</h2>
              <p>{quests.length ? `${visibleQuests.length} of ${quests.length} public Community Solo Side Quest${quests.length === 1 ? "" : "s"}${selectedCreatorQuest ? ` by ${selectedCreatorQuest.creatorName}` : " available right now"}.` : "No public Community Solo Side Quests are available yet."}</p>
            </div>
            <span className="badge gold">{visibleQuests.length}/{quests.length}</span>
          </div>

          <CommunityDiscoveryControls
            query={communityQuery}
            filter={communityFilter}
            sort={communitySort}
            creator={selectedCreator}
            activeFilterCount={activeFilterCount}
            completedAvailable={Boolean(userId)}
          />

          {selectedCreatorQuest ? (
            <div className="groupquest-empty-state" id={`creator-${selectedCreatorQuest.creatorKey}`}>
              <p><strong>{selectedCreatorQuest.creatorName}</strong> has {visibleQuests.length} public Community Solo recipe{visibleQuests.length === 1 ? "" : "s"} on the public board. This is a player shelf, not a public profile; private account details stay private.</p>
              <CommunitySoloAnalyticsLink className="button secondary" href="/challenges/community" type="community_solo_browse" status="clear_creator_filter">Show all players</CommunitySoloAnalyticsLink>
            </div>
          ) : selectedCreator ? (
            <div className="groupquest-empty-state" role="status">
              <p><strong>That player shelf is empty.</strong> The link may be stale, the recipe may have been unpublished, or the public label may have changed. Nothing private is shown just because a URL guessed at it.</p>
              <div className="button-row">
                <CommunitySoloAnalyticsLink className="button primary" href="/challenges/community" type="community_solo_browse" status="creator_filter_miss_clear">Show all Community Solo</CommunitySoloAnalyticsLink>
                <CommunitySoloAnalyticsLink className="button secondary" href="/support?topic=community-side-quest" type="community_solo_report_click" status="creator_filter_miss_support">Ask Support</CommunitySoloAnalyticsLink>
              </div>
            </div>
          ) : null}

          {visibleQuests.length ? (
            <div className="big-grid starter-route-grid">
              {visibleQuests.map((quest) => <CommunityQuestCard key={`${quest.creatorUserId}:${quest.id}`} quest={quest} />)}
            </div>
          ) : (
            <div className="groupquest-empty-state" role="status">
              <p>{activeFilterCount ? "No public Community Solo Side Quests match those filters yet. Try clearing search, player, or completion filters; private drafts and account details stay hidden." : selectedCreator ? "No public Community Solo Side Quests are visible on that player shelf. The recipe may have been unpublished, archived, or cleaned up." : "No public Community Solo Side Quests yet. Publish one from your Custom Side Quest library and become the local goblin of chess rules."}</p>
              <CommunitySoloAnalyticsLink className="button primary" href={selectedCreator ? "/challenges/community" : "/account"} type={selectedCreator ? "community_solo_browse" : "community_solo_account_handoff"} status={selectedCreator ? "empty_creator_clear" : "empty_account_handoff"}>{selectedCreator ? "Show all Community Solo" : "Open account"}</CommunitySoloAnalyticsLink>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function CommunityDiscoveryControls({
  activeFilterCount,
  completedAvailable,
  creator,
  filter,
  query,
  sort,
}: {
  activeFilterCount: number;
  completedAvailable: boolean;
  creator: string | null;
  filter: CommunityBrowseFilter;
  query: string;
  sort: CommunitySort;
}) {
  const preserveCreator = creator ? <input type="hidden" name="creator" value={creator} /> : null;
  return (
    <div className="groupquest-empty-state" role="search" aria-label="Community Solo discovery filters">
      <form action="/challenges/community" className="support-form">
        {preserveCreator}
        <label htmlFor="community-search">Search public recipes</label>
        <div className="form-row compact-form-row">
          <input id="community-search" name="q" defaultValue={query} placeholder="Search by title, player, rule, or goal" />
          <button className="button secondary" type="submit">Search</button>
        </div>
        <div className="form-row compact-form-row">
          <label>
            Filter
            <select name="filter" defaultValue={filter}>
              <option value="all">All</option>
              <option value="popular">Popular</option>
              <option value="new">New</option>
              <option value="completed">Completed by me{completedAvailable ? "" : " (sign in)"}</option>
            </select>
          </label>
          <label>
            Sort
            <select name="sort" defaultValue={sort}>
              <option value="popular">Top</option>
              <option value="newest">Newest</option>
              <option value="az">A–Z</option>
            </select>
          </label>
        </div>
      </form>
      <div className="button-row">
        {COMMUNITY_FILTERS.map((item) => (
          <Link key={item.value} className={`button ${filter === item.value ? "primary" : "ghost"}`} href={buildCommunityFilterHref({ creator, query, filter: item.value, sort })}>{item.label}</Link>
        ))}
        {activeFilterCount ? <Link className="button secondary" href="/challenges/community">Clear filters</Link> : null}
      </div>
    </div>
  );
}

function InfoCard({ copy, title }: { copy: string; title: string }) {
  return (
    <article className="mission-card side-quest-mode-card">
      <span className="eyebrow">Community guide</span>
      <h3>{title}</h3>
      <p>{copy}</p>
    </article>
  );
}

function CommunityQuestCard({ quest }: { quest: PublicCommunitySideQuest }) {
  return (
    <article className="challenge-card community-side-quest-card">
      <div className="challenge-card-art custom-side-quest-art" aria-hidden="true">
        <Image src={quest.badgeImageUrl || "/badges/custom/custom-side-quest-crest.png"} alt="" width={96} height={96} />
      </div>
      <div className="challenge-card-body">
        <span className="eyebrow">Community · by {quest.creatorName}</span>
        <h3><Link href={quest.detailPath}>{quest.title}</Link></h3>
        <p>{quest.summary}</p>
        <div className="public-groupquest-meta">
          <small>{quest.ruleLabel}</small>
          <small>{formatCommunityStats(quest)}</small>
          <small>Updated {formatDate(quest.updatedAt)}</small>
          <small><Link href={quest.creatorBrowsePath}>More from {quest.creatorName}</Link></small>
        </div>
        <div className="button-row">
          <CommunitySoloAnalyticsLink className="button secondary" href={quest.detailPath} type="community_solo_detail" questId={quest.id} status="card_inspect">Inspect recipe</CommunitySoloAnalyticsLink>
          <CommunitySoloAnalyticsLink className="button ghost" href={quest.creatorBrowsePath} type="community_solo_creator_filter" questId={quest.id} status="card_creator_context">Player shelf</CommunitySoloAnalyticsLink>
          <CommunitySoloAnalyticsLink className="button ghost" href="/account" type="community_solo_account_handoff" questId={quest.id} status="card_start_check">Start/check in account</CommunitySoloAnalyticsLink>
          <CommunitySoloAnalyticsLink className="button ghost" href={`/support?topic=community-side-quest&quest=${encodeURIComponent(quest.id)}`} type="community_solo_report_click" questId={quest.id} status="card_report">Report weird quest</CommunitySoloAnalyticsLink>
        </div>
      </div>
    </article>
  );
}

type CommunityBrowseFilter = "all" | "popular" | "new" | "completed";
type CommunitySort = "popular" | "newest" | "az";

const COMMUNITY_FILTERS: Array<{ value: CommunityBrowseFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "popular", label: "Popular" },
  { value: "new", label: "New" },
  { value: "completed", label: "Completed" },
];

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "recently";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "Europe/Stockholm" }).format(date);
}

function formatCommunityStats(quest: PublicCommunitySideQuest) {
  const parts = [
    quest.stats.soloCompletions ? `${quest.stats.soloCompletions} Solo completion${quest.stats.soloCompletions === 1 ? "" : "s"}` : null,
    quest.stats.soloSelections ? `${quest.stats.soloSelections} active runner${quest.stats.soloSelections === 1 ? "" : "s"}` : null,
    quest.stats.multiplayerLineups ? `${quest.stats.multiplayerLineups} Multiplayer lineup${quest.stats.multiplayerLineups === 1 ? "" : "s"}` : null,
  ].filter(Boolean);
  return parts.join(" · ") || "Fresh community recipe";
}

function cleanCommunityQuery(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 80) : "";
}

function cleanCommunityFilter(value: unknown): CommunityBrowseFilter {
  return value === "popular" || value === "new" || value === "completed" ? value : "all";
}

function cleanCommunitySort(value: unknown, filter: CommunityBrowseFilter): CommunitySort {
  if (value === "newest" || value === "az" || value === "popular") return value;
  return filter === "new" ? "newest" : filter === "popular" ? "popular" : "newest";
}

function matchesCommunityFilters(
  quest: PublicCommunitySideQuest,
  {
    communityFilter,
    communityQuery,
    completedIds,
    selectedCreator,
  }: { communityFilter: CommunityBrowseFilter; communityQuery: string; completedIds: Set<string>; selectedCreator: string | null },
) {
  if (selectedCreator && quest.creatorKey !== selectedCreator) return false;
  if (communityFilter === "completed" && !completedIds.has(quest.id)) return false;
  if (communityFilter === "popular" && quest.popularityScore <= 0) return false;
  if (communityFilter === "new" && Date.now() - quest.updatedAtMs > 1000 * 60 * 60 * 24 * 30) return false;
  if (!communityQuery) return true;
  const haystack = `${quest.title} ${quest.summary} ${quest.creatorName} ${quest.ruleLabel} ${quest.ruleDetails.join(" ")}`.toLowerCase();
  return communityQuery.toLowerCase().split(/\s+/).every((term) => haystack.includes(term));
}

function sortCommunityQuests(quests: PublicCommunitySideQuest[], sort: CommunitySort) {
  return [...quests].sort((a, b) => {
    if (sort === "az") return a.title.localeCompare(b.title);
    if (sort === "popular" && a.popularityScore !== b.popularityScore) return b.popularityScore - a.popularityScore;
    return b.updatedAtMs - a.updatedAtMs;
  });
}

function buildCommunityFilterHref({ creator, filter, query, sort }: { creator: string | null; filter: CommunityBrowseFilter; query: string; sort: CommunitySort }) {
  const params = new URLSearchParams();
  if (creator) params.set("creator", creator);
  if (query) params.set("q", query);
  if (filter !== "all") params.set("filter", filter);
  if (sort !== cleanCommunitySort(undefined, filter)) params.set("sort", sort);
  const suffix = params.toString();
  return suffix ? `/challenges/community?${suffix}` : "/challenges/community";
}

async function getSignedInCompletedIds(client: Awaited<ReturnType<typeof clerkClient>>, userId: string | null) {
  if (!userId) return new Set<string>();
  try {
    const user = await client.users.getUser(userId);
    const publicMetadata = user.publicMetadata && typeof user.publicMetadata === "object" ? user.publicMetadata as UserMetadataRecord : {};
    return new Set(getChallengeProgress(publicMetadata).completedChallengeIds);
  } catch (error) {
    console.warn("community completed filter unavailable", { userId, reason: error instanceof Error ? error.message : "unknown" });
    return new Set<string>();
  }
}
