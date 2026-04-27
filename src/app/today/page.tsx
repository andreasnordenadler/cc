import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import ChallengeBadge from "@/components/challenge-badge";
import ChallengeInviteActions from "@/components/challenge-invite-actions";
import SiteNav from "@/components/site-nav";
import { getDailyChallenge } from "@/lib/challenges";

export const metadata: Metadata = {
  title: "Today’s dare — Side Quest Chess",
  description: "The shared daily Side Quest Chess dare: one stupidly hard chess side quest for everyone to try today.",
  alternates: { canonical: "/today" },
  openGraph: {
    title: "Today’s dare — Side Quest Chess",
    description: "One stupidly hard chess side quest for everyone today.",
    url: "/today",
    siteName: "Side Quest Chess",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Today’s dare — Side Quest Chess",
    description: "One stupidly hard chess side quest for everyone today.",
  },
};

export default async function TodayPage() {
  const { userId } = await auth();
  const challenge = getDailyChallenge();
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
              </div>
              <h1>Today’s bad idea: {challenge.title}</h1>
              <p className="hero-copy">{challenge.objective}</p>
              <p>{challenge.flavor}</p>
              <div className="button-row hero-actions">
                <Link href={`/challenges/${challenge.id}`} className="button primary">Start today’s dare</Link>
                <Link href={`/dare/${challenge.id}`} className="button secondary">Open friend-dare page</Link>
              </div>
            </div>
            <ChallengeBadge challenge={challenge} size="hero" />
          </div>
        </section>

        <section className="big-grid">
          <article className="mission-card share-card">
            <span className="eyebrow">Make it social</span>
            <h2>Dare someone to do the same cursed thing today.</h2>
            <p>
              The daily page creates a simple ritual: everyone sees the same quest, then shares the exact challenge page instead of a generic homepage link.
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
            <ul className="rules-list">
              {challenge.rules.map((rule) => <li key={rule}>{rule}</li>)}
            </ul>
          </article>
        </section>
      </div>
    </main>
  );
}
