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
    <main className="site-shell challenges-page-shell">
      <CommunitySoloAnalytics
        type={selectedCreator ? "community_solo_creator_filter" : "community_solo_browse"}
        status={selectedCreator ? "creator_filter" : communityFilter}
        onceKey={`community-solo:${selectedCreator ?? "all"}:${communityFilter}:${communitySort}:${communityQuery}:${visibleQuests.length}`}
      />
      <SiteNav isSignedIn={Boolean(userId)} active="challenges" />

      <div className="content-wrap challenges-page-wrap">
        <section className="challenges-clean-hero community-clean-hero" aria-labelledby="community-solo-title">
          <div>
            <span className="eyebrow">Community Solo</span>
            <h1 id="community-solo-title">Player-made rules, clearly labeled.</h1>
            <p>
              Community Solo is the public board for custom Side Quests. Browse lightly, inspect before starting, and keep Official SQC separate from player-made experiments.
            </p>
          </div>
          <div className="challenges-clean-hero-actions" aria-label="Community Solo actions">
            <Link className="mode-link-card" href="/challenges">
              <span>Official deck</span>
              <strong>Back to curated quests</strong>
            </Link>
            <CommunitySoloAnalyticsLink className="mode-link-card" href="/account/custom-side-quests" type="community_solo_account_handoff" status="browse_hero">
              <span>Your customs</span>
              <strong>Create or publish</strong>
            </CommunitySoloAnalyticsLink>
          </div>
        </section>

        <section className="community-board-card" aria-label="Public Community Solo Side Quest listings">
          <div className="community-board-head">
            <div>
              <span className="eyebrow">Public board</span>
              <h2>{selectedCreatorQuest ? `${selectedCreatorQuest.creatorName}'s public quests` : "Browse Community Solo"}</h2>
              <p>{quests.length ? `${visibleQuests.length} of ${quests.length} public quest${quests.length === 1 ? "" : "s"} shown.` : "No public Community Solo Side Quests are available yet."}</p>
            </div>
            <strong className="community-board-count">{visibleQuests.length}/{quests.length}</strong>
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
            <div className="community-context-note" id={`creator-${selectedCreatorQuest.creatorKey}`}>
              Showing public quests from <strong>{selectedCreatorQuest.creatorName}</strong>. Private drafts and account details stay hidden.
              <CommunitySoloAnalyticsLink href="/challenges/community" type="community_solo_browse" status="clear_creator_filter">Show everyone</CommunitySoloAnalyticsLink>
            </div>
          ) : selectedCreator ? (
            <div className="community-context-note" role="status">
              <strong>No public quests for that player right now.</strong> The link may be stale or the quest may have been unpublished.
              <CommunitySoloAnalyticsLink href="/challenges/community" type="community_solo_browse" status="creator_filter_miss_clear">Show all Community Solo</CommunitySoloAnalyticsLink>
            </div>
          ) : null}

          {visibleQuests.length ? (
            <div className="community-quest-list">
              {visibleQuests.map((quest) => <CommunityQuestCard key={`${quest.creatorUserId}:${quest.id}`} quest={quest} />)}
            </div>
          ) : (
            <div className="community-empty-state" role="status">
              <p>{activeFilterCount ? "No Community Solo quests match those filters. Clear search or try a broader view." : "No public Community Solo quests yet. Publish one from Custom Solo Side Quests when you want the village to see it."}</p>
              <CommunitySoloAnalyticsLink className="button primary" href={activeFilterCount ? "/challenges/community" : "/account/custom-side-quests"} type={activeFilterCount ? "community_solo_browse" : "community_solo_account_handoff"} status={activeFilterCount ? "empty_clear" : "empty_account_handoff"}>{activeFilterCount ? "Clear filters" : "Open your custom quests"}</CommunitySoloAnalyticsLink>
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
    <form action="/challenges/community" className="community-filter-bar" role="search" aria-label="Community Solo discovery filters">
      {preserveCreator}
      <label className="community-search-field" htmlFor="community-search">
        <span>Search</span>
        <input id="community-search" name="q" defaultValue={query} placeholder="Title, player, rule, or goal" />
      </label>
      <label>
        <span>Filter</span>
        <select name="filter" defaultValue={filter}>
          <option value="all">All</option>
          <option value="popular">Popular</option>
          <option value="new">New</option>
          <option value="completed">Completed by me{completedAvailable ? "" : " (sign in)"}</option>
        </select>
      </label>
      <label>
        <span>Sort</span>
        <select name="sort" defaultValue={sort}>
          <option value="popular">Top</option>
          <option value="newest">Newest</option>
          <option value="az">A–Z</option>
        </select>
      </label>
      <button className="button primary" type="submit">Apply</button>
      {activeFilterCount ? <Link className="button secondary" href="/challenges/community">Clear</Link> : null}
    </form>
  );
}

function CommunityQuestCard({ quest }: { quest: PublicCommunitySideQuest }) {
  return (
    <article className="community-quest-row-card">
      <div className="community-quest-badge" aria-hidden="true">
        <Image src={quest.badgeImageUrl || "/badges/custom/clean/custom-coat-knight-gold.png"} alt="" width={86} height={86} />
      </div>
      <div className="community-quest-main-copy">
        <span className="community-quest-source">Community · by {quest.creatorName}</span>
        <h3><Link href={quest.detailPath}>{quest.title}</Link></h3>
        <p>{quest.summary}</p>
        <div className="community-quest-tags" aria-label={`${quest.title} quick facts`}>
          <span>{quest.ruleLabel}</span>
          <span>{formatCommunityStats(quest)}</span>
          <span>Updated {formatDate(quest.updatedAt)}</span>
        </div>
      </div>
      <div className="community-quest-rule-stack" aria-label={`${quest.title} rule preview`}>
        <strong>Rule preview</strong>
        <ul>
          {quest.ruleDetails.slice(0, 2).map((detail) => <li key={detail}>{detail}</li>)}
        </ul>
      </div>
      <div className="community-quest-row-actions">
        <CommunitySoloAnalyticsLink className="button primary" href={quest.detailPath} type="community_solo_detail" questId={quest.id} status="card_inspect">Inspect</CommunitySoloAnalyticsLink>
        <CommunitySoloAnalyticsLink className="button secondary" href="/account/custom-side-quests" type="community_solo_account_handoff" questId={quest.id} status="card_start_check">Start from account</CommunitySoloAnalyticsLink>
        <div>
          <CommunitySoloAnalyticsLink href={quest.creatorBrowsePath} type="community_solo_creator_filter" questId={quest.id} status="card_creator_context">More from player</CommunitySoloAnalyticsLink>
          <CommunitySoloAnalyticsLink href={`/support?topic=community-side-quest&quest=${encodeURIComponent(quest.id)}`} type="community_solo_report_click" questId={quest.id} status="card_report">Report</CommunitySoloAnalyticsLink>
        </div>
      </div>
    </article>
  );
}

type CommunityBrowseFilter = "all" | "popular" | "new" | "completed";
type CommunitySort = "popular" | "newest" | "az";

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
  return parts.join(" · ") || "Fresh Community Solo quest";
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

async function getSignedInCompletedIds(client: Awaited<ReturnType<typeof clerkClient>>, userId: string | null) {
  if (!userId) return new Set<string>();
  try {
    const user = await client.users.getUser(userId);
    const metadata = user.publicMetadata as UserMetadataRecord;
    return new Set(getChallengeProgress(metadata).completedChallengeIds);
  } catch {
    return new Set<string>();
  }
}
