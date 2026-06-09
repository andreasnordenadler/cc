import Image from "next/image";
import Link from "next/link";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { CommunitySoloAnalytics, CommunitySoloAnalyticsLink } from "@/components/analytics/community-solo-analytics";
import SiteNav from "@/components/site-nav";
import { listPublicCommunitySideQuests, type PublicCommunitySideQuest } from "@/lib/community-side-quests";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Community Solo Side Quests · Side Quest Chess",
  description: "Browse public player-created Solo Side Quests for Side Quest Chess.",
};

export default async function CommunitySideQuestsPage({ searchParams }: { searchParams?: Promise<{ creator?: string }> }) {
  const { userId } = await auth();
  const resolvedSearchParams: { creator?: string } = searchParams ? await searchParams : {};
  const { creator } = resolvedSearchParams;
  const client = await clerkClient();
  const quests = await listPublicCommunitySideQuests(client, { limit: 80 });
  const selectedCreator = typeof creator === "string" ? decodeURIComponent(creator) : null;
  const visibleQuests = selectedCreator ? quests.filter((quest) => quest.creatorKey === selectedCreator) : quests;
  const selectedCreatorQuest = selectedCreator ? quests.find((quest) => quest.creatorKey === selectedCreator) : null;

  return (
    <main className="site-shell">
      <CommunitySoloAnalytics
        type={selectedCreator ? "community_solo_creator_filter" : "community_solo_browse"}
        status={selectedCreator ? "creator_filter" : "all"}
        onceKey={`community-solo:${selectedCreator ?? "all"}:${visibleQuests.length}`}
      />
      <SiteNav isSignedIn={Boolean(userId)} active="challenges" />

      <div className="content-wrap">
        <section className="hero-card side-quests-hub-hero">
          <span className="eyebrow">Community Solo Side Quests</span>
          <h1>The bad ideas escaped into the village.</h1>
          <p className="hero-copy">
            Browse public Solo Side Quests made by SQC players. Some are elegant. Some are cursed. Inspect, share, report, start, check, and prove them on website or app — same product, different layout.
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
            <InfoCard title="Community stays labeled" copy="Player-created quests show creator names and custom rule summaries so you know whose bad idea you are borrowing." />
            <InfoCard title="Equal on app and website" copy="Both surfaces support Community Solo discovery, inspection, starting, proof, reporting, and rewards. Choose either surface as your SQC home; website spreads it out, mobile keeps it compact and native." />
            <InfoCard title="Report weird quests" copy="If a public rule looks abusive, confusing, or broken, use Support and include the quest title. Community should feel odd, not hostile." />
          </div>
        </section>

        <section className="mission-card" aria-label="Public Community Solo Side Quest listings">
          <div className="section-head">
            <div>
              <span className="eyebrow">Open community recipes</span>
              <h2>Pick someone else’s strange rule.</h2>
              <p>{quests.length ? `${visibleQuests.length} public Community Solo Side Quest${visibleQuests.length === 1 ? "" : "s"}${selectedCreatorQuest ? ` by ${selectedCreatorQuest.creatorName}` : " available right now"}.` : "No public Community Solo Side Quests are available yet."}</p>
            </div>
            <span className="badge gold">{visibleQuests.length}</span>
          </div>

          {selectedCreatorQuest ? (
            <div className="groupquest-empty-state" id={`creator-${selectedCreatorQuest.creatorKey}`}>
              <p><strong>{selectedCreatorQuest.creatorName}</strong> has {visibleQuests.length} public Community Solo recipe{visibleQuests.length === 1 ? "" : "s"} on the public board. This is a creator context view, not a public profile; private account details stay private.</p>
              <CommunitySoloAnalyticsLink className="button secondary" href="/challenges/community" type="community_solo_browse" status="clear_creator_filter">Show all creators</CommunitySoloAnalyticsLink>
            </div>
          ) : selectedCreator ? (
            <div className="groupquest-empty-state" role="status">
              <p><strong>That creator shelf is empty.</strong> The creator link may be stale, the recipe may have been unpublished, or the public label may have changed. Nothing private is shown just because a URL guessed at it.</p>
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
              <p>{selectedCreator ? "No public Community Solo Side Quests are visible for that creator context. The recipe may have been unpublished, archived, or cleaned up." : "No public Community Solo Side Quests yet. Publish one from your Custom Side Quest library and become the local goblin of chess rules."}</p>
              <CommunitySoloAnalyticsLink className="button primary" href={selectedCreator ? "/challenges/community" : "/account"} type={selectedCreator ? "community_solo_browse" : "community_solo_account_handoff"} status={selectedCreator ? "empty_creator_clear" : "empty_account_handoff"}>{selectedCreator ? "Show all Community Solo" : "Open account"}</CommunitySoloAnalyticsLink>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function InfoCard({ copy, title }: { copy: string; title: string }) {
  return (
    <article className="mission-card side-quest-mode-card">
      <span className="eyebrow">Shared surface</span>
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
          <small>Updated {formatDate(quest.updatedAt)}</small>
          <small><Link href={quest.creatorBrowsePath}>More by {quest.creatorName}</Link></small>
        </div>
        <div className="button-row">
          <CommunitySoloAnalyticsLink className="button secondary" href={quest.detailPath} type="community_solo_detail" questId={quest.id} status="card_inspect">Inspect recipe</CommunitySoloAnalyticsLink>
          <CommunitySoloAnalyticsLink className="button ghost" href={quest.creatorBrowsePath} type="community_solo_creator_filter" questId={quest.id} status="card_creator_context">Creator context</CommunitySoloAnalyticsLink>
          <CommunitySoloAnalyticsLink className="button ghost" href="/account" type="community_solo_account_handoff" questId={quest.id} status="card_start_check">Start/check in account</CommunitySoloAnalyticsLink>
          <CommunitySoloAnalyticsLink className="button ghost" href={`/support?topic=community-side-quest&quest=${encodeURIComponent(quest.id)}`} type="community_solo_report_click" questId={quest.id} status="card_report">Report weird quest</CommunitySoloAnalyticsLink>
        </div>
      </div>
    </article>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "recently";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "Europe/Stockholm" }).format(date);
}
