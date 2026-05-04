import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import ChallengeBadge from "@/components/challenge-badge";
import ChallengeInviteActions from "@/components/challenge-invite-actions";
import SiteNav from "@/components/site-nav";
import { getDailyChallenge } from "@/lib/challenges";
import { getVerifierStateLabel, getVerifierStatus } from "@/lib/verifier-status";

export async function generateMetadata(): Promise<Metadata> {
  const challenge = getDailyChallenge();
  const title = `Today’s quest: ${challenge.title} — Side Quest Chess`;
  const description = `${challenge.objective} Try the shared daily SQC side quest for +${challenge.reward} points and the ${challenge.badgeIdentity.name} badge.`;
  const image = `/api/og/dare/${challenge.id}`;

  return {
    title,
    description,
    alternates: { canonical: "/today" },
    openGraph: {
      title,
      description,
      url: "/today",
      siteName: "Side Quest Chess",
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: `${challenge.title} daily Side Quest Chess quest card` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function TodayPage() {
  const { userId } = await auth();
  const challenge = getDailyChallenge();
  const verifierStatus = getVerifierStatus(challenge);
  const verifierLabel = getVerifierStateLabel(verifierStatus);
  const dateLabel = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date());

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(userId)} active="today" />

      <div className="content-wrap">
        <section className="hero-card detail-hero daily-hero">
          <div className="detail-hero-grid">
            <div>
              <div className="badge-row">
                <span className="eyebrow">Daily side quest · {dateLabel}</span>
                <span className="badge gold">+{challenge.reward} pts</span>
                <span className="badge danger">{challenge.difficulty}</span>
                <span className={verifierLabel.className}>{verifierLabel.label}</span>
              </div>
              <h1>Today’s quest: {challenge.title}</h1>
              <p className="hero-copy">{challenge.objective}</p>
              <p>{challenge.flavor}</p>
              <div className="button-row hero-actions">
                <Link href={`/challenges/${challenge.id}`} className="button primary">Start today’s quest</Link>
                <Link href={`/dare/${challenge.id}`} className="button secondary">Open friend-quest page</Link>
              </div>
            </div>
            <ChallengeBadge challenge={challenge} size="hero" />
          </div>
        </section>

        <section className="big-grid">
          <article className="mission-card share-card">
            <span className="eyebrow">Make it social</span>
            <h2>Quest with someone today.</h2>
            <p>
              The daily page creates a simple ritual: everyone sees the same quest, then shares the exact quest page instead of a generic homepage link.
            </p>
            <ChallengeInviteActions
              challengeTitle={challenge.title}
              challengeObjective={challenge.objective}
              challengePath={`/today`}
              reward={challenge.reward}
              badgeName={challenge.badgeIdentity.name}
            />
          </article>

          <article className="mission-card">
            <span className="eyebrow">Badge target</span>
            <h2>{challenge.badgeIdentity.name}</h2>
            <p>{challenge.badgeIdentity.unlockCopy}</p>
            <div className="note-card">
              <strong>{challenge.badgeIdentity.heraldry.motto}</strong>
              <p>{challenge.badgeIdentity.heraldry.meaning}</p>
              <p>{challenge.badgeIdentity.heraldry.weirdness}</p>
            </div>
          </article>

          <article className="mission-card">
            <span className="eyebrow">What counts</span>
            <h2>Funny, but verifiable.</h2>
            <p><strong>{verifierStatus.summary}.</strong> {verifierLabel.promise}</p>
            <p>{verifierStatus.evidence}</p>
            <ul className="rules-list">
              {challenge.rules.map((rule) => <li key={rule}>{rule}</li>)}
            </ul>
          </article>
        </section>
      </div>
    </main>
  );
}
