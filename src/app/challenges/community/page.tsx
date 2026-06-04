import Image from "next/image";
import Link from "next/link";
import { auth, clerkClient } from "@clerk/nextjs/server";
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
      <SiteNav isSignedIn={Boolean(userId)} active="challenges" />

      <div className="content-wrap">
        <section className="hero-card side-quests-hub-hero">
          <span className="eyebrow">Community Solo Side Quests</span>
          <h1>The bad ideas escaped into the village.</h1>
          <p className="hero-copy">
            Browse public Solo Side Quests made by SQC players. Some are elegant. Some are cursed. All of them should make a normal chess game slightly less normal.
          </p>
          <div className="hero-actions button-row">
            <Link className="button secondary" href="/challenges">Back to SQC Official</Link>
            <Link className="button primary" href="/account">Create your own</Link>
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
            <InfoCard title="Mobile gets the quick action" copy="Use the app to browse compactly, start, check, and prove. Use the website when you want the richer tavern-wall view." />
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
              <p><strong>{selectedCreatorQuest.creatorName}</strong> has {visibleQuests.length} public Community Solo recipe{visibleQuests.length === 1 ? "" : "s"} on the tavern wall. This is a creator context view, not a public profile; private account details stay private.</p>
              <Link className="button secondary" href="/challenges/community">Show all creators</Link>
            </div>
          ) : null}

          {visibleQuests.length ? (
            <div className="big-grid starter-route-grid">
              {visibleQuests.map((quest) => <CommunityQuestCard key={`${quest.creatorUserId}:${quest.id}`} quest={quest} />)}
            </div>
          ) : (
            <div className="groupquest-empty-state" role="status">
              <p>{selectedCreator ? "No public Community Solo Side Quests are visible for that creator context. The recipe may have been unpublished, archived, or cleaned up." : "No public Community Solo Side Quests yet. Publish one from your Custom Side Quest library and become the local goblin of chess rules."}</p>
              <Link className="button primary" href={selectedCreator ? "/challenges/community" : "/account"}>{selectedCreator ? "Show all Community Solo" : "Open account"}</Link>
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
          <Link className="button secondary" href={quest.detailPath}>Inspect recipe</Link>
          <Link className="button ghost" href={quest.creatorBrowsePath}>Creator context</Link>
          <Link className="button ghost" href="/account">Try in account</Link>
          <Link className="button ghost" href={`/support?topic=community-side-quest&quest=${encodeURIComponent(quest.id)}`}>Report weird quest</Link>
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
