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
  const description = `${quest.summary} Public player-created Side Quest by ${quest.creatorName}.`;
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
              <span className="eyebrow">Player-created by {quest.creatorName}</span>
              <h1>{quest.title}</h1>
              <p className="hero-copy">{quest.summary}</p>
              <p className="quest-detail-flavor">A public custom rule from the community notice board. Inspect the target, share it with a rival, report anything off, then start and prove it from your SQC account.</p>
              <p className="quest-detail-flavor">Creator context stays intentionally small: public quest name, public creator label, and more public recipes by the same player when available. Private account details stay private.</p>
            </div>
            <div className="challenge-badge hero-badge community-detail-badge" aria-label={`${quest.title} custom crest`}>
              <Image src={quest.badgeImageUrl || "/badges/custom/custom-side-quest-crest.png"} alt="" width={180} height={180} priority />
            </div>
          </div>
          <div className="button-row hero-actions quest-detail-actions">
            <CommunitySoloAnalyticsLink className="button primary" href="/account" type="community_solo_account_handoff" questId={quest.id} status="detail_start_check">Start/check in account</CommunitySoloAnalyticsLink>
            <Link className="button secondary" href={`/groupquests/create?quest=${encodeURIComponent(quest.id)}`}>Use in Multiplayer</Link>
            <CommunitySoloAnalyticsLink className="button secondary" href={quest.creatorBrowsePath} type="community_solo_creator_filter" questId={quest.id} status="detail_more_by_creator">More by {quest.creatorName}</CommunitySoloAnalyticsLink>
            <a className="button ghost" href="#share-community-side-quest">Share public link</a>
            <CommunitySoloAnalyticsLink className="button ghost" href={`/support?topic=community-side-quest&quest=${encodeURIComponent(quest.id)}`} type="community_solo_report_click" questId={quest.id} status="detail_report">Report weird quest</CommunitySoloAnalyticsLink>
          </div>
        </section>

        <section className="mission-card quest-detail-section" id="share-community-side-quest" aria-label="Share Community Side Quest">
          <div className="section-head">
            <div>
              <span className="eyebrow">Share link</span>
              <h2>Send this public recipe without exposing private shelf data.</h2>
              <p>Copy the canonical Community Solo URL or use the same SQC share actions used for proof receipts. Drafts, archived recipes, and raw custom configs stay private.</p>
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

        <section className="mission-card quest-detail-section" aria-label="Community Side Quest creator context">
          <div className="section-head">
            <div>
              <span className="eyebrow">Creator context</span>
              <h2>Made public by {quest.creatorName}.</h2>
              <p>This opens the public Community Solo board filtered to recipes from the same public creator label. If there are no other public recipes, the page safely falls back without exposing private profile data.</p>
            </div>
            <CommunitySoloAnalyticsLink className="button secondary" href={quest.creatorBrowsePath} type="community_solo_creator_filter" questId={quest.id} status="creator_context_card">Open creator context</CommunitySoloAnalyticsLink>
          </div>
        </section>

        <section className="mission-card quest-detail-section" aria-label="Community Side Quest trust and safety">
          <div className="section-head">
            <div>
              <span className="eyebrow">Community trust</span>
              <h2>Player-created, publicly labeled, easy to flag.</h2>
              <p>This is not an official SQC quest. It is a public recipe from {quest.creatorName}. If the rule looks abusive, confusing, spammy, or broken, report it with the quest title so it can be reviewed.</p>
            </div>
            <CommunitySoloAnalyticsLink className="button secondary" href={`/support?topic=community-side-quest&quest=${encodeURIComponent(quest.id)}`} type="community_solo_report_click" questId={quest.id} status="trust_card_report">Report weird quest</CommunitySoloAnalyticsLink>
          </div>
        </section>

        <section className="mission-card quest-detail-section" aria-label="Community Side Quest rule summary">
          <div className="section-head">
            <div>
              <span className="eyebrow">Safe rule summary</span>
              <h2>The public recipe, without leaking private workspace clutter.</h2>
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
            <span className="eyebrow">Roomy web view</span>
            <h2>Review the recipe before you run it.</h2>
            <p>Use this wide view for creator context, rule explanation, public links, report/trust affordances, and account actions. Everything here is phrased for players, not internal tooling.</p>
            <Link className="button secondary" href="/challenges/community">Browse more Community Solo</Link>
          </article>
          <article className="mission-card groupquests-live-card">
            <span className="eyebrow">Compact mobile flow</span>
            <h2>Keep the same quest in your pocket.</h2>
            <p>The mobile flow keeps the same Community Solo loop compact: browse, inspect, start, check, prove, report, and collect the reward moment with the same account state.</p>
            <CommunitySoloAnalyticsLink className="button primary" href="/account" type="community_solo_account_handoff" questId={quest.id} status="detail_account_card">Open your SQC account</CommunitySoloAnalyticsLink>
          </article>
        </section>
      </div>
    </main>
  );
}
