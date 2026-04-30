import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import ChallengeBadge from "@/components/challenge-badge";
import ChallengeInviteActions from "@/components/challenge-invite-actions";
import SiteNav from "@/components/site-nav";
import { checkActiveChallenge, startChallenge } from "@/app/actions";
import { CHALLENGES, getChallengeById } from "@/lib/challenges";
import { getVerifierStateLabel, getVerifierStatus } from "@/lib/verifier-status";
import {
  buildAttemptSummary,
  challengeBanner,
  getActiveChallenge,
  getChallengeAttempts,
  getChessComUsername,
  getLatestChallengeAttempt,
  getLichessUsername,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

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
      title: "Side Quest Chess challenge",
    };
  }

  const title = `${challenge.title} — Side Quest Chess`;
  const description = `${challenge.objective} ${challenge.proofCallout}. Unlock ${challenge.badgeIdentity.name} for +${challenge.reward} points.`;
  const url = `/challenges/${challenge.id}`;
  const image = `/api/og/dare/${challenge.id}`;

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
      images: [{ url: image, width: 1200, height: 630, alt: `${challenge.title} Side Quest Chess challenge card` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const challenge = getChallengeById(id);

  if (!challenge) {
    notFound();
  }

  const { userId } = await auth();
  const user = userId ? await currentUser() : null;
  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const lichessUsername = getLichessUsername(metadata);
  const chessComUsername = getChessComUsername(metadata);
  const activeChallenge = getActiveChallenge(metadata);
  const attempts = getChallengeAttempts(metadata, challenge.id).slice().reverse();
  const latestAttempt = getLatestChallengeAttempt(metadata, challenge.id);
  const latestAttemptSummary = buildAttemptSummary(latestAttempt);
  const isSignedIn = Boolean(userId);
  const isActive = activeChallenge?.id === challenge.id;
  const verifierStatus = getVerifierStatus(challenge);
  const verifierLabel = getVerifierStateLabel(verifierStatus);

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={isSignedIn} active="challenges" />

      <div className="content-wrap">
        <Link href="/challenges" className="button secondary">← Back to challenge hub</Link>

        <section className="hero-card detail-hero">
          <div className="detail-hero-grid">
            <div>
              <div className="badge-row">
                <span className="eyebrow">{challenge.category}</span>
                <span className="badge danger">{challenge.difficulty}</span>
                <span className="badge gold">+{challenge.reward} pts</span>
                <span className={verifierLabel.className}>{verifierLabel.label}</span>
              </div>
              <h1>{challenge.title}</h1>
              <p className="hero-copy">{challenge.objective}</p>
              <p>{challenge.flavor}</p>
            </div>
            <ChallengeBadge challenge={challenge} size="hero" />
          </div>
          <div className="button-row hero-actions">
            {isSignedIn ? (
              <form action={startChallenge}>
                <input type="hidden" name="challengeId" value={challenge.id} />
                <button type="submit" className="button primary">
                  {isActive ? "Restart this bad idea" : "Start this bad idea"}
                </button>
              </form>
            ) : (
              <Link href="/connect" className="button primary">Connect to start</Link>
            )}
            <Link href="/result" className="button secondary">Preview proof card</Link>
            <Link href={`/dare/${challenge.id}`} className="button secondary">Friend dare page</Link>
          </div>
        </section>

        <section className="mission-card" aria-label="First proof path">
          <div className="section-head">
            <div>
              <span className="eyebrow">First proof path</span>
              <h2>What to do after you accept this quest.</h2>
            </div>
            <span className="badge green">live-backed</span>
          </div>
          <p>
            The clean loop is intentionally small: start this exact dare, win one eligible public game on Lichess or Chess.com, then ask SQC to check your latest games for a receipt.
          </p>
          <div className="grid">
            <Fact label="1 · Start" value="Make this the active dare so the checker knows which weird rule to judge." />
            <Fact label="2 · Play" value="Play a real public game on your saved Lichess or Chess.com username and try to satisfy the rule while winning." />
            <Fact label="3 · Check" value="Return here or to your account page, run Check latest games, and read the pass, fail, or pending receipt." />
          </div>
          <div className="button-row">
            <Link href="/connect" className="button secondary">Set chess username</Link>
            <Link href="/result" className="button secondary">Open latest receipt</Link>
          </div>
        </section>

        <section className="mission-card share-card">
          <span className="eyebrow">Dare a friend</span>
          <h2>Send this exact bad idea.</h2>
          <p>
            Side Quest Chess works better when the challenge itself is the invite. This copies a direct dare link with the badge reward and rules intact.
          </p>
          <ChallengeInviteActions
            challengeTitle={challenge.title}
            challengeObjective={challenge.objective}
            challengePath={`/dare/${challenge.id}`}
            reward={challenge.reward}
            badgeName={challenge.badgeIdentity.name}
          />
        </section>

        <section className="big-grid">
          <article className="mission-card">
            <span className="eyebrow">What counts</span>
            <h2>Funny, but rule-clear.</h2>
            <ul className="rules-list">
              {challenge.rules.map((rule) => <li key={rule}>{rule}</li>)}
            </ul>
          </article>

          <article className="mission-card">
            <span className="eyebrow">Unlock badge</span>
            <ChallengeBadge challenge={challenge} size="hero" />
            <h2>{challenge.badge}</h2>
            <p>{challenge.badgeIdentity.unlockCopy}</p>
            <div className="note-card">
              <strong>{challenge.badgeIdentity.heraldry.motto}</strong>
              <p>{challenge.badgeIdentity.heraldry.meaning}</p>
              <p>{challenge.badgeIdentity.heraldry.weirdness}</p>
            </div>
            <div className="note-card">
              <strong>{verifierStatus.summary}</strong>
              <p>{verifierStatus.evidence}</p>
              <p>{verifierLabel.promise}</p>
              <Link href="/verifiers">Open verifier board</Link>
            </div>
          </article>
        </section>

        <section className="mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Your run</span>
              <h2>{isActive ? "This dare is active" : "Not active yet"}</h2>
            </div>
            <span className="badge blue">{challenge.completionRate}</span>
          </div>

          {isSignedIn ? (
            <>
              <div className="grid">
                <Fact label="Lichess" value={lichessUsername || "not set yet"} />
                <Fact label="Chess.com" value={chessComUsername || "not set yet"} />
                <Fact label="Attempts" value={`${attempts.length}`} />
              </div>
              <div className="run-status">
                <p>{challengeBanner(isActive ? activeChallenge : null)}</p>
                {isActive ? (
                  <form action={checkActiveChallenge} className="button-row">
                    <button type="submit" className="button primary">Check latest games</button>
                    <Link href="/account" className="button secondary">Open active run</Link>
                  </form>
                ) : (
                  <p className="muted">Start this side quest to unlock the latest-game checker for this challenge.</p>
                )}
                <article className="note-card latest-check">
                  <span className="eyebrow">Latest check</span>
                  <h3>{latestAttemptSummary.headline}</h3>
                  <p>{latestAttemptSummary.detail}</p>
                  <small>{latestAttemptSummary.meta}</small>
                </article>
              </div>
            </>
          ) : (
            <div className="run-status">
              <p>Browse first. Connect only when you want Side Quest Chess to remember this chaos and turn it into proof.</p>
              <p className="muted">Signed-in runners get a Check latest games button here after starting the dare.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="fact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
