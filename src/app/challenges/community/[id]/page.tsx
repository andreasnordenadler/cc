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
              <p className="quest-detail-flavor">A public custom rule from the community notice board. Inspect the target, share it with a rival, report anything off, then start and prove it from your SQC account.</p>
              <p className="quest-detail-flavor">The public player view stays intentionally small: this quest, this player label, and more published Side Quests by the same player when available. Private account details stay private.</p>
            </div>
            <div className="challenge-badge hero-badge community-detail-badge" aria-label={`${quest.title} custom crest`}>
              <Image src={quest.badgeImageUrl || "/badges/custom/custom-side-quest-crest.png"} alt="" width={180} height={180} priority />
            </div>
          </div>
          <div className="button-row hero-actions quest-detail-actions">
            <CommunitySoloAnalyticsLink className="button primary" href="/account" type="community_solo_account_handoff" questId={quest.id} status="detail_start_check">Start/check in account</CommunitySoloAnalyticsLink>
            <Link className="button secondary" href={`/groupquests/create?quest=${encodeURIComponent(quest.id)}`}>Use in Multiplayer</Link>
            <CommunitySoloAnalyticsLink className="button secondary" href={quest.creatorBrowsePath} type="community_solo_creator_filter" questId={quest.id} status="detail_more_by_creator">More from {quest.creatorName}</CommunitySoloAnalyticsLink>
            <a className="button ghost" href="#share-community-side-quest">Share public link</a>
            <CommunitySoloAnalyticsLink className="button ghost" href={`/support?topic=community-side-quest&quest=${encodeURIComponent(quest.id)}`} type="community_solo_report_click" questId={quest.id} status="detail_report">Report weird quest</CommunitySoloAnalyticsLink>
          </div>
        </section>

        <section className="mission-card quest-detail-section" id="share-community-side-quest" aria-label="Share Community Side Quest">
          <div className="section-head">
            <div>
              <span className="eyebrow">Share link</span>
              <h2>Send this public Side Quest without exposing private shelf data.</h2>
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
            <CommunitySoloAnalyticsLink className="button secondary" href={`/support?topic=community-side-quest&quest=${encodeURIComponent(quest.id)}`} type="community_solo_report_click" questId={quest.id} status="trust_card_report">Report weird quest</CommunitySoloAnalyticsLink>
          </div>
        </section>

        <section className="mission-card quest-detail-section" aria-label="Community Side Quest rule summary">
          <div className="section-head">
            <div>
              <span className="eyebrow">Public rule summary</span>
              <h2>The rule runners need, without private account clutter.</h2>
              <p>Only the published rule summary is shown here. Draft, private, archived, and malformed custom quests stay out of public browse.</p>
            </div>
          </div>
          <div className="groupquest-onboarding-steps">
            {quest.ruleDetails.map((line, index) => (
              <div className="groupquest-onboarding-step" key={`${line}-${index}`}>
                <em>{index + 1}</em>
                <span><strong>{index === 0 ? quest.ruleLabel : "Additional condition"}</strong><small>{line}</small></span>
              </div>
            ))}
          </div>
        </section>

        <section className="grid groupquests-dashboard-grid" aria-label="Community Side Quest next actions">
          <article className="mission-card groupquests-live-card">
            <span className="eyebrow">Quest review</span>
            <h2>Read the rule before you run it.</h2>
            <p>Check the player label, rule explanation, public link, and report path before adding someone else’s strange idea to your own Side Quest run.</p>
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
