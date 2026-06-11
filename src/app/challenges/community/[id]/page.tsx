import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { CommunitySoloAnalytics, CommunitySoloAnalyticsLink } from "@/components/analytics/community-solo-analytics";
import ShareProofActions from "@/components/share-proof-actions";
import SiteNav from "@/components/site-nav";
import { findPublicCommunitySideQuestById } from "@/lib/community-side-quests";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const client = await clerkClient();
  const quest = await findPublicCommunitySideQuestById(client, decodeURIComponent(id));
  if (!quest) return { title: "Community Solo Side Quest · Side Quest Chess" };
  const title = `${quest.title} · Community Solo Side Quest · Side Quest Chess`;
  const description = `${quest.summary} Public Community Solo Side Quest by ${quest.creatorName}.`;
  return {
    title,
    description,
    alternates: { canonical: quest.detailPath },
    openGraph: {
      title,
      description,
      url: quest.detailPath,
      siteName: "Side Quest Chess",
      type: "website",
      images: quest.badgeImageUrl ? [{ url: quest.badgeImageUrl, alt: `${quest.title} custom Side Quest crest` }] : undefined,
    },
    twitter: { card: "summary", title, description },
  };
}

export default async function CommunitySideQuestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  const { id } = await params;
  const client = await clerkClient();
  const quest = await findPublicCommunitySideQuestById(client, decodeURIComponent(id));

  if (!quest) notFound();

  return (
    <main className="site-shell">
      <CommunitySoloAnalytics type="community_solo_detail" questId={quest.id} status="detail_view" onceKey={`community-solo-detail:${quest.id}`} />
      <SiteNav isSignedIn={Boolean(userId)} active="challenges" />

      <div className="content-wrap quest-detail-wrap">
        <Link href="/challenges/community" className="button secondary back-to-hub">← Back to Community Solo</Link>

        <section className="hero-card detail-hero quest-detail-hero community-side-quest-detail-hero">
          <div className="quest-detail-meta card-meta quest-card-meta">
            <span className="badge green">Community</span>
            <span className="badge">Solo Side Quest</span>
          </div>
          <div className="detail-hero-grid quest-detail-hero-grid">
            <div className="quest-detail-copy">
              <span className="eyebrow">Community Solo by {quest.creatorName}</span>
              <h1>{quest.title}</h1>
              <p className="hero-copy">{quest.summary}</p>
              <p className="quest-detail-flavor">A public custom rule from the community notice board. Read the promise, check the rule shape, then choose whether it belongs in your next SQC run.</p>
            </div>
            <div className="community-detail-badge-panel">
              <div className="challenge-badge hero-badge community-detail-badge" aria-label={`${quest.title} custom crest`}>
                <Image src={quest.badgeImageUrl || "/badges/v6/bishop-field-trip-badge.png"} alt="" width={180} height={180} priority />
              </div>
              <div className="community-detail-fact-stack" aria-label={`${quest.title} quick facts`}>
                <span>{quest.ruleLabel}</span>
                <span>{formatCommunityStats(quest)}</span>
                <span>Updated {formatDate(quest.updatedAt)}</span>
              </div>
            </div>
          </div>
          <div className="community-detail-run-panel" aria-label="Community Solo run plan">
            <div className="community-detail-rule-card">
              <span className="eyebrow">Rule preview</span>
              <h2>Know the dare before you start.</h2>
              <ul>
                {quest.ruleDetails.slice(0, 4).map((line, index) => <li key={`${line}-${index}`}>{line}</li>)}
              </ul>
            </div>
            <div className="community-detail-action-panel" aria-label="Community Solo actions">
              <span className="eyebrow">Next step</span>
              <div className="community-detail-primary-actions">
                <CommunitySoloAnalyticsLink className="button primary" href="/account" type="community_solo_account_handoff" questId={quest.id} status="detail_start_from_account">Start from account</CommunitySoloAnalyticsLink>
                <Link className="button secondary" href={`/groupquests/create?quest=${encodeURIComponent(quest.id)}`}>Use in Multiplayer</Link>
              </div>
              <div className="community-detail-secondary-actions" aria-label="Secondary Community Solo actions">
                <CommunitySoloAnalyticsLink href={quest.creatorBrowsePath} type="community_solo_creator_filter" questId={quest.id} status="detail_more_by_player">More from {quest.creatorName}</CommunitySoloAnalyticsLink>
                <a href="#share-community-side-quest">Share public link</a>
                <CommunitySoloAnalyticsLink href={`/support?topic=community-side-quest&quest=${encodeURIComponent(quest.id)}`} type="community_solo_report_click" questId={quest.id} status="detail_report">Report quest</CommunitySoloAnalyticsLink>
              </div>
            </div>
          </div>
        </section>

        <section className="mission-card quest-detail-section community-detail-guide" aria-label="Community Side Quest rule summary">
          <div className="section-head">
            <div>
              <span className="eyebrow">Run checklist</span>
              <h2>Three checks before borrowing this rule.</h2>
              <p>Community Solo should feel strange but readable: a clear public rule, a normal SQC account start path, and a fast report path if the quest looks wrong.</p>
            </div>
          </div>
          <div className="community-detail-checklist">
            <div><strong>1. Read the promise</strong><span>{quest.summary}</span></div>
            <div><strong>2. Confirm the verifier rule</strong><span>{quest.ruleLabel}: {quest.ruleDetails[0]}</span></div>
            <div><strong>3. Start from your account</strong><span>Your SQC account keeps proof checks, receipts, rewards, and reporting together.</span></div>
          </div>
        </section>

        <section className="mission-card quest-detail-section" id="share-community-side-quest" aria-label="Share Community Side Quest">
          <div className="section-head">
            <div>
              <span className="eyebrow">Share link</span>
              <h2>Send this public Side Quest without exposing private saved-quest data.</h2>
              <p>Copy the canonical Community Solo URL or use the same SQC share actions used for proof receipts. Drafts, archived quests, and private rule data stay private.</p>
            </div>
          </div>
          <ShareProofActions
            challengeTitle={quest.title}
            copy={`Try “${quest.title}” on Side Quest Chess — a Community Solo Side Quest by ${quest.creatorName}.`}
            sharePath={quest.detailPath}
            shareLabel="Copy public quest link"
            copiedCopy="Public Community Solo link copied."
            socialCopy={`Try “${quest.title}” on Side Quest Chess — a Community Solo Side Quest by ${quest.creatorName}.`}
            socialTitle={`Try ${quest.title} on Side Quest Chess`}
            shareAriaLabel="Share Community Solo Side Quest on social media"
          />
        </section>

        <section className="mission-card quest-detail-section" aria-label="More Community Side Quests from this player">
          <div className="section-head">
            <div>
              <span className="eyebrow">More from this player</span>
              <h2>Browse {quest.creatorName}&apos;s published Side Quests.</h2>
              <p>This opens the public Community Solo board filtered to Side Quests from the same public player label. If there are no other public quests, the page falls back cleanly without exposing private profile data.</p>
            </div>
            <CommunitySoloAnalyticsLink className="button secondary" href={quest.creatorBrowsePath} type="community_solo_creator_filter" questId={quest.id} status="creator_context_card">See more from player</CommunitySoloAnalyticsLink>
          </div>
        </section>

        <section className="mission-card quest-detail-section" aria-label="Community Side Quest trust and safety">
          <div className="section-head">
            <div>
              <span className="eyebrow">Community trust</span>
              <h2>Player-created, publicly labeled, easy to flag.</h2>
              <p>This is not an official SQC quest. It is a public Side Quest from {quest.creatorName}. If the rule looks abusive, confusing, spammy, or broken, report it with the quest title so it can be reviewed.</p>
            </div>
            <CommunitySoloAnalyticsLink className="button secondary" href={`/support?topic=community-side-quest&quest=${encodeURIComponent(quest.id)}`} type="community_solo_report_click" questId={quest.id} status="trust_card_report">Report quest</CommunitySoloAnalyticsLink>
          </div>
        </section>

        <section className="grid groupquests-dashboard-grid" aria-label="Community Side Quest next actions">
          <article className="mission-card groupquests-live-card">
            <span className="eyebrow">Quest review</span>
            <h2>Read the rule before you run it.</h2>
            <p>Check the player label, rule preview, public link, and report path before adding someone else’s strange idea to your own Side Quest run.</p>
            <Link className="button secondary" href="/challenges/community">Browse more Community Solo</Link>
          </article>
          <article className="mission-card groupquests-live-card">
            <span className="eyebrow">Start from account</span>
            <h2>Run it from your SQC account.</h2>
            <p>Your account keeps the Community Solo loop together: start the quest, check a game, prove the run, report problems, and collect the reward moment without losing context.</p>
            <CommunitySoloAnalyticsLink className="button primary" href="/account" type="community_solo_account_handoff" questId={quest.id} status="detail_account_card">Open your SQC account</CommunitySoloAnalyticsLink>
          </article>
        </section>
      </div>
    </main>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "recently";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "Europe/Stockholm" }).format(date);
}

function formatCommunityStats(quest: NonNullable<Awaited<ReturnType<typeof findPublicCommunitySideQuestById>>>) {
  const parts = [
    quest.stats.soloCompletions ? `${quest.stats.soloCompletions} Solo completion${quest.stats.soloCompletions === 1 ? "" : "s"}` : null,
    quest.stats.soloSelections ? `${quest.stats.soloSelections} active runner${quest.stats.soloSelections === 1 ? "" : "s"}` : null,
    quest.stats.multiplayerLineups ? `${quest.stats.multiplayerLineups} Multiplayer lineup${quest.stats.multiplayerLineups === 1 ? "" : "s"}` : null,
  ].filter(Boolean);
  return parts.join(" · ") || "Fresh Community Solo quest";
}
