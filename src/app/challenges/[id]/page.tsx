import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import ChallengeBadge from "@/components/challenge-badge";
import ChallengeInviteActions from "@/components/challenge-invite-actions";
import DeactivateQuestControl from "@/components/deactivate-quest-control";
import ProofPositionBoard from "@/components/proof-position-board";
import SiteNav from "@/components/site-nav";
import StartQuestControls from "@/components/start-quest-controls";
import { checkActiveChallenge } from "@/app/actions";
import { CHALLENGES, getChallengeById, type Challenge } from "@/lib/challenges";
import {
  buildAttemptSummary,
  challengeBanner,
  getActiveChallenge,
  getChallengeAttempts,
  getChallengeProgress,
  getChessComUsername,
  getLatestChallengeAttempt,
  getLichessUsername,
  formatTime,
  type ChallengeAttempt,
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
  const latestPassedAttempt = attempts.find((attempt) => attempt.status === "passed") ?? (latestAttempt?.status === "passed" ? latestAttempt : null);
  const latestAttemptSummary = buildAttemptSummary(latestAttempt);
  const latestLichessAttempt = getLatestProviderAttempt(attempts, "lichess");
  const latestChessComAttempt = getLatestProviderAttempt(attempts, "chess.com");
  const isSignedIn = Boolean(userId);
  const isActive = activeChallenge?.id === challenge.id;
  const isCompleted = progress.completedChallengeIds.includes(challenge.id);
  const unfinishedActiveChallenge =
    activeChallenge?.id && activeChallenge.id !== challenge.id && !progress.completedChallengeIds.includes(activeChallenge.id)
      ? getChallengeById(activeChallenge.id)
      : null;

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={isSignedIn} active="challenges" />

      <div className="content-wrap quest-detail-wrap">
        <Link href="/challenges" className="button secondary back-to-hub">← Back to Quest Hub</Link>

        <section className={`hero-card detail-hero quest-detail-hero ${isActive ? "active-quest-card" : ""} ${isCompleted ? "completed-quest-card" : ""}`}>
          {isActive ? <span className="active-quest-stamp detail-state-stamp" aria-label="Active quest" /> : null}
          {isCompleted && !isActive ? <span className="completed-quest-stamp detail-state-stamp" aria-label="Completed quest" /> : null}
          <div className="quest-detail-meta card-meta quest-card-meta">
            <strong className="quest-points">+{challenge.reward} pts</strong>
            <span className={`badge difficulty-badge ${getDifficultyTone(challenge.difficulty)}`}>{challenge.difficulty}</span>
          </div>
          <div className="detail-hero-grid quest-detail-hero-grid">
            <div className="quest-detail-copy">
              <h1>{challenge.title}</h1>
              <p className="hero-copy">{challenge.objective}</p>
              <p className="quest-detail-flavor">{challenge.openingHint}</p>
              <p>{challenge.flavor}</p>
            </div>
            <ChallengeBadge challenge={challenge} earned={isCompleted} size="hero" presentation="art" />
          </div>
          <div className="button-row hero-actions quest-detail-actions">
            {isSignedIn ? (
              isActive ? null : (
                <StartQuestControls challenge={challenge} activeChallenge={unfinishedActiveChallenge} />
              )
            ) : (
              <Link href="/connect" className="button primary">Connect to start</Link>
            )}
            <Link href={`/dare/${challenge.id}`} className="button secondary">Share this Quest</Link>
            {isCompleted ? <Link href="/proof-log" className="button secondary">Proof log</Link> : null}
            {isSignedIn && isActive ? <DeactivateQuestControl challenge={challenge} /> : null}
          </div>
        </section>

        {isSignedIn && isCompleted ? (
          <section className="mission-card quest-detail-section" aria-label="Completed quest board proof">
            <div className="section-head">
              <div>
                <span className="eyebrow">Completed proof</span>
                <h2>Make the final position shareable.</h2>
              </div>
            </div>
            <ProofPositionBoard attempt={latestPassedAttempt} />
          </section>
        ) : null}

        {isSignedIn && isActive ? (
          <section className="mission-card quest-status-panel" aria-label="Active quest status">
            <div className="section-head">
              <div>
                <span className="eyebrow">Quest status</span>
                <h2>Latest-game checker</h2>
                <p>{challengeBanner(activeChallenge)}</p>
              </div>
            </div>
            <div className="quest-status-grid">
              <ProviderStatusCard provider="Lichess" username={lichessUsername} latestAttempt={latestLichessAttempt} />
              <ProviderStatusCard provider="Chess.com" username={chessComUsername} latestAttempt={latestChessComAttempt} />
              <Fact label="Total checks" value={`${attempts.length}`} />
              <Fact label="Latest receipt" value={latestAttempt ? formatTime(latestAttempt.checkedAt) : "not checked yet"} />
            </div>
            <article className="note-card latest-check quest-status-receipt">
              <span className="eyebrow">Latest receipt</span>
              <h3>{latestAttemptSummary.headline}</h3>
              <p>{latestAttemptSummary.detail}</p>
              <small>{latestAttemptSummary.meta}</small>
            </article>
            <form action={checkActiveChallenge} className="quest-status-refresh">
              <button type="submit" className="button primary">Refresh</button>
            </form>
          </section>
        ) : null}

        <section className="mission-card quest-detail-section">
          <span className="eyebrow">Rules</span>
          <h2>Funny, but rule-clear.</h2>
          <p>{challenge.instruction}</p>
          <ul className="rules-list">
            {challenge.rules.map((rule) => <li key={rule}>{rule}</li>)}
          </ul>
          <div className="quest-run-flow">
            <span className="eyebrow">How to run it</span>
            <div className="checker-flow quest-detail-flow">
              <Fact label="1 · Start" value="Make this your one active quest so the checker knows which weird rule to judge." />
              <Fact label="2 · Play" value="Play a real public Lichess or Chess.com game and try to satisfy the rule while winning." />
              <Fact label="3 · Check" value="Activation runs an immediate latest-game check; after your next game, refresh to read the next receipt." />
            </div>
          </div>
        </section>

        <section className="mission-card quest-detail-section" aria-label="Friend quest handoff">
          <div className="section-head">
            <div>
              <span className="eyebrow">Friend dare</span>
              <h2>Send exactly this bad idea.</h2>
            </div>
          </div>
          <p>
            Turn this rule page into a direct dare: copy a friend-ready invite with the quest, objective, badge, and proof link already attached.
          </p>
          <ChallengeInviteActions
            challengeTitle={challenge.title}
            challengeObjective={challenge.objective}
            challengePath={`/dare/${challenge.id}`}
            reward={challenge.reward}
            badgeName={challenge.badgeIdentity.name}
          />
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

function ProviderStatusCard({
  provider,
  username,
  latestAttempt,
}: {
  provider: "Lichess" | "Chess.com";
  username: string;
  latestAttempt: ChallengeAttempt | null;
}) {
  return (
    <div className="fact provider-status-card">
      <span>{provider}</span>
      <strong>{username || "not connected"}</strong>
      <small>{latestAttempt ? `Last checked ${formatTime(latestAttempt.checkedAt)}` : "No check recorded yet"}</small>
    </div>
  );
}

function getLatestProviderAttempt(attempts: ChallengeAttempt[], provider: "lichess" | "chess.com") {
  return attempts.find((attempt) => getAttemptProvider(attempt) === provider) ?? null;
}

function getAttemptProvider(attempt: ChallengeAttempt): "lichess" | "chess.com" | "unknown" {
  if (attempt.provider === "lichess" || attempt.provider === "chess.com") {
    return attempt.provider;
  }

  const gameId = attempt.gameId ?? "";

  if (/chess\.com/i.test(gameId)) {
    return "chess.com";
  }

  if (gameId) {
    return "lichess";
  }

  return "unknown";
}

function getDifficultyTone(difficulty: Challenge["difficulty"]) {
  if (difficulty === "Easy") return "green";
  if (difficulty === "Medium") return "gold";
  if (difficulty === "Hard") return "orange";
  if (difficulty === "Absurd") return "absurd";
  return "danger";
}
