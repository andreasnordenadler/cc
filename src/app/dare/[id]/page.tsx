import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ChallengeBadge from "@/components/challenge-badge";
import ChallengeInviteActions from "@/components/challenge-invite-actions";
import SiteNav from "@/components/site-nav";
import { CHALLENGES, getChallengeById } from "@/lib/challenges";

export function generateStaticParams() {
  return CHALLENGES.map((challenge) => ({ id: challenge.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const challenge = getChallengeById(id);

  if (!challenge) {
    return {
      title: "Side Quest Chess dare",
    };
  }

  const title = `I dare you: ${challenge.title} — Side Quest Chess`;
  const description = `${challenge.objective} Unlock ${challenge.badgeIdentity.name} for +${challenge.reward} points.`;
  const url = `/dare/${challenge.id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Side Quest Chess",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function DarePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const challenge = getChallengeById(id);

  if (!challenge) {
    notFound();
  }

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={false} active="challenges" />

      <div className="content-wrap">
        <section className="hero-grid">
          <article className="hero-card detail-hero">
            <span className="eyebrow">Friend dare received</span>
            <h1>You have been dared.</h1>
            <p className="hero-copy">
              Someone thinks you should try <strong>{challenge.title}</strong>: {challenge.objective}
            </p>
            <div className="button-row hero-actions">
              <Link href={`/challenges/${challenge.id}`} className="button primary">Accept this bad idea</Link>
              <Link href="/challenges" className="button secondary">Browse safer nonsense</Link>
            </div>
          </article>

          <aside className="mission-card share-card">
            <span className="eyebrow">The prize</span>
            <ChallengeBadge challenge={challenge} size="hero" />
            <h2>{challenge.badgeIdentity.name}</h2>
            <p>{challenge.badgeIdentity.unlockCopy}</p>
            <div className="proof-line">{challenge.proofCallout} · +{challenge.reward} points</div>
          </aside>
        </section>

        <section className="big-grid">
          <article className="mission-card">
            <span className="eyebrow">What counts</span>
            <h2>Rules before chaos.</h2>
            <ul className="rules-list">
              {challenge.rules.map((rule) => <li key={rule}>{rule}</li>)}
            </ul>
          </article>

          <article className="mission-card share-card">
            <span className="eyebrow">Escalate responsibly</span>
            <h2>Dare someone else.</h2>
            <p>
              Copy the same challenge-specific invite and make the group chat worse in a very measurable way.
            </p>
            <ChallengeInviteActions
              challengeTitle={challenge.title}
              challengeObjective={challenge.objective}
              challengePath={`/dare/${challenge.id}`}
              reward={challenge.reward}
              badgeName={challenge.badgeIdentity.name}
            />
          </article>
        </section>
      </div>
    </main>
  );
}
