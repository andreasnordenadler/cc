import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";
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
              <p className="quest-detail-flavor">A public custom rule from the community notice board. Inspect, share, report, start, check, and prove it on website or app — same product, different layout.</p>
              <p className="quest-detail-flavor">Creator context is intentionally small: public quest name, public creator label, and more public recipes by the same creator when available. No private account profile is exposed here.</p>
            </div>
            <div className="challenge-badge hero-badge community-detail-badge" aria-label={`${quest.title} custom crest`}>
              <Image src={quest.badgeImageUrl || "/badges/custom/custom-side-quest-crest.png"} alt="" width={180} height={180} priority />
            </div>
          </div>
          <div className="button-row hero-actions quest-detail-actions">
            <Link className="button primary" href="/account">Start/check in account</Link>
            <Link className="button secondary" href="/groupquests/create">Use in Multiplayer</Link>
            <Link className="button secondary" href={quest.creatorBrowsePath}>More by {quest.creatorName}</Link>
            <Link className="button ghost" href={`/support?topic=community-side-quest&quest=${encodeURIComponent(quest.id)}`}>Report weird quest</Link>
          </div>
        </section>

        <section className="mission-card quest-detail-section" aria-label="Community Side Quest creator context">
          <div className="section-head">
            <div>
              <span className="eyebrow">Creator context</span>
              <h2>Made public by {quest.creatorName}.</h2>
              <p>This link opens the public Community Solo board filtered to recipes from the same creator label. If that creator has no other public recipes, the page safely falls back without exposing private profile data.</p>
            </div>
            <Link className="button secondary" href={quest.creatorBrowsePath}>Open creator context</Link>
          </div>
        </section>

        <section className="mission-card quest-detail-section" aria-label="Community Side Quest trust and safety">
          <div className="section-head">
            <div>
              <span className="eyebrow">Community trust</span>
              <h2>Player-created, publicly labeled, easy to flag.</h2>
              <p>This is not an official SQC quest. It is a public recipe from {quest.creatorName}. If the rule looks abusive, confusing, spammy, or broken, report it with the quest title so it can be reviewed.</p>
            </div>
            <Link className="button secondary" href={`/support?topic=community-side-quest&quest=${encodeURIComponent(quest.id)}`}>Report weird quest</Link>
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
            <span className="eyebrow">Website role</span>
            <h2>Use the wide community view.</h2>
            <p>The website supports the same Community Solo product with a wider layout: creator context, rule explanation, public URLs, report/trust affordances, and account handoff. It does not start anonymous runs.</p>
            <Link className="button secondary" href="/challenges/community">Browse more Community Solo</Link>
          </article>
          <article className="mission-card groupquests-live-card">
            <span className="eyebrow">Mobile role</span>
            <h2>Use the native community view.</h2>
            <p>The mobile app supports the same Community Solo product in a compact native layout: browse, inspect, start, check, prove, report, and collect the reward moment.</p>
            <Link className="button primary" href="/account">Open your SQC account</Link>
          </article>
        </section>
      </div>
    </main>
  );
}
