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
  getChallengeProgress,
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
      title: "Side Quest Chess quest",
    };
  }

  const title = `${challenge.title} — Side Quest Chess`;
  const description = `${challenge.objective} ${challenge.proofCallout}. Win on Lichess or Chess.com, then verify your latest public game for +${challenge.reward} points.`;
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
      images: [{ url: image, width: 1200, height: 630, alt: `${challenge.title} Side Quest Chess quest card` }],
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
  const progress = getChallengeProgress(metadata);
  const attempts = getChallengeAttempts(metadata, challenge.id).slice().reverse();
  const latestAttempt = getLatestChallengeAttempt(metadata, challenge.id);
  const latestAttemptSummary = buildAttemptSummary(latestAttempt);
  const isSignedIn = Boolean(userId);
  const isActive = activeChallenge?.id === challenge.id;
  const isCompleted = progress.completedChallengeIds.includes(challenge.id);
  const verifierStatus = getVerifierStatus(challenge);
  const verifierLabel = getVerifierStateLabel(verifierStatus);

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={isSignedIn} active="challenges" />

      <div className="content-wrap">
        <Link href="/challenges" className="button secondary">← Back to quest hub</Link>

        <section className="hero-card detail-hero">
          <div className="detail-hero-grid">
            <div>
              <div className="badge-row">
                <span className="eyebrow">{challenge.category}</span>
                <span className="badge danger">{challenge.difficulty}</span>
                <span className="badge gold">+{challenge.reward} pts</span>
                {isCompleted ? <span className="badge green">completed</span> : null}
              </div>
              <h1>{challenge.title}</h1>
              <p className="hero-copy">{challenge.objective}</p>
              <p>{challenge.flavor}</p>
            </div>
            <ChallengeBadge challenge={challenge} earned={isCompleted} size="hero" />
          </div>
          <div className="button-row hero-actions">
            {isSignedIn ? (
              isActive ? (
                <>
                  <form action={checkActiveChallenge}>
                    <button type="submit" className="button primary">Check latest games</button>
                  </form>
                  <form action={startChallenge}>
                    <input type="hidden" name="challengeId" value={challenge.id} />
                    <button type="submit" className="button secondary">Restart this bad idea</button>
                  </form>
                </>
              ) : (
                <form action={startChallenge}>
                  <input type="hidden" name="challengeId" value={challenge.id} />
                  <button type="submit" className="button primary">Start this bad idea</button>
                </form>
              )
            ) : (
              <Link href="/connect" className="button primary">Connect to start</Link>
            )}
            <Link href="/result" className="button secondary">{isCompleted ? "Open proof card" : "Preview proof card"}</Link>
            <Link href={`/dare/${challenge.id}`} className="button secondary">Friend quest page</Link>
            {isCompleted ? <Link href="/proof-log" className="button secondary">Proof log</Link> : null}
          </div>
        </section>

        <section className="mission-card" aria-label="First proof path">
          <div className="section-head">
            <div>
              <span className="eyebrow">Before you start</span>
              <h2>One quest, one real win, one latest-game check.</h2>
            </div>
            <span className="badge green">no PGN upload</span>
          </div>
          <p>
            Use this quick contract before committing: the quest only counts after a win, Side Quest Chess checks your latest public game from Lichess or Chess.com, and the receipt explains pass, fail, or wait without making you inspect PGNs.
          </p>
          <div className="grid">
            <Fact label="1 · Start" value="Make this the active quest so the checker knows which weird rule to judge." />
            <Fact label="2 · Play" value="Play a real public game on your saved Lichess or Chess.com username and try to satisfy the rule while winning." />
            <Fact label="3 · Check" value="Return here or to your account page, run Check latest games, and read the pass, fail, or pending receipt." />
          </div>
          <div className="button-row">
            <Link href="/connect" className="button secondary">Set chess username</Link>
            <Link href="/result" className="button secondary">Open latest receipt</Link>
          </div>
        </section>

        <section className="mission-card share-card">
          <span className="eyebrow">Send this quest</span>
          <h2>Send this exact bad idea.</h2>
          <p>
            Side Quest Chess works better when the quest itself is the invite. This copies a direct quest link with the badge reward and rules intact.
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
              <h2>{isCompleted ? "Completed and ready to brag" : isActive ? "This quest is active" : "Not active yet"}</h2>
            </div>
            <span className={`badge ${isCompleted ? "green" : "blue"}`}>{isCompleted ? "completed" : challenge.completionRate}</span>
          </div>

          {isSignedIn ? (
            <>
              <div className="grid">
                <Fact label="Lichess" value={lichessUsername || "not set yet"} />
                <Fact label="Chess.com" value={chessComUsername || "not set yet"} />
                <Fact label="Attempts" value={`${attempts.length}`} />
                {isCompleted ? <Fact label="Reward banked" value={`+${challenge.reward} pts`} /> : null}
              </div>
              <div className="run-status">
                <p>{challengeBanner(isActive ? activeChallenge : null)}</p>
                {isActive ? (
                  <form action={checkActiveChallenge} className="button-row">
                    <button type="submit" className="button primary">Check latest games</button>
                    <Link href="/account" className="button secondary">Open active run</Link>
                  </form>
                ) : (
                  <p className="muted">Start this side quest to unlock the latest-game checker for this quest.</p>
                )}
                {isCompleted ? (
                  <article className="note-card latest-check">
                    <span className="eyebrow">Completed quest</span>
                    <h3>Badge earned. Receipt ready.</h3>
                    <p>This quest is already in your completed set. Share the dare, compare proof cards, or pick the next bad idea when you want another run.</p>
                    <div className="button-row">
                      <Link href="/proof-log" className="button secondary">Open proof log</Link>
                      <Link href="/challenges" className="button secondary">Pick another quest</Link>
                    </div>
                  </article>
                ) : null}
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
              <p className="muted">Signed-in runners get a Check latest games button here after starting the quest.</p>
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
