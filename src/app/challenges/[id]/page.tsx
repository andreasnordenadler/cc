import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import ChallengeBadge from "@/components/challenge-badge";
import CommunityLikeButton from "@/components/community-like-button";
import DeactivateQuestControl from "@/components/deactivate-quest-control";
import ProofPositionBoard from "@/components/proof-position-board";
import ProofTime from "@/components/proof-time";
import ResetQuestControl from "@/components/reset-quest-control";
import ShareProofActions from "@/components/share-proof-actions";
import SiteNav from "@/components/site-nav";
import StartQuestControls from "@/components/start-quest-controls";
import { checkActiveChallenge, submitChallengeAttempt } from "@/app/actions";
import { CHALLENGES, getChallengeById, type Challenge } from "@/lib/challenges";
import { getCommunityLikeSummaries } from "@/lib/community-likes";
import { buildPublicProofPath, publicProofImagePath } from "@/lib/proof-share";
import {
  buildAttemptSummary,
  challengeBanner,
  getActiveChallenge,
  getChallengeAttempts,
  getChallengeProgress,
  getChessComUsername,
  getLatestChallengeAttempt,
  getLichessUsername,
  isSyntheticLatestGameReceipt,
  sanitizeAttemptSummary,
  shouldPreselectDefaultStarterQuest,
  type ChallengeAttempt,
  type UserMetadataRecord,
  withDefaultStarterQuest,
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
  let metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  if (user && shouldPreselectDefaultStarterQuest(metadata)) {
    metadata = withDefaultStarterQuest(metadata);
    const client = await clerkClient();
    await client.users.updateUserMetadata(user.id, { publicMetadata: metadata });
  }
  const client = await clerkClient();
  const likeSummary = (await getCommunityLikeSummaries(client, userId)).get("solo", challenge.id);
  const lichessUsername = getLichessUsername(metadata);
  const chessComUsername = getChessComUsername(metadata);
  const activeChallenge = getActiveChallenge(metadata);
  const progress = getChallengeProgress(metadata);
  const attempts = getChallengeAttempts(metadata, challenge.id).slice().reverse();
  const latestAttempt = getLatestChallengeAttempt(metadata, challenge.id);
  const latestPassedAttempt = attempts.find((attempt) => attempt.status === "passed") ?? (latestAttempt?.status === "passed" ? latestAttempt : null);
  const isActiveQuestForDate = activeChallenge?.id === challenge.id;
  const completedDate = latestPassedAttempt?.completedGameAt ?? latestPassedAttempt?.checkedAt ?? (isActiveQuestForDate ? activeChallenge?.verifiedAt : undefined);
  const completedDateLabel = completedDate ? "Completion time saved" : "Completion date pending next proof check";
  const latestLichessAttempt = getLatestProviderAttempt(attempts, "lichess");
  const latestChessComAttempt = getLatestProviderAttempt(attempts, "chess.com");
  const isSignedIn = Boolean(userId);
  const isActive = activeChallenge?.id === challenge.id;
  const isVerifiedActiveQuest = isActive && activeChallenge?.status === "verified";
  const isCompleted = progress.completedChallengeIds.includes(challenge.id) || Boolean(latestPassedAttempt) || isVerifiedActiveQuest;
  const displayAttempt = buildCurrentVerifierAttempt(latestAttempt, latestPassedAttempt, activeChallenge, challenge, isCompleted);
  const latestAttemptSummary = buildAttemptSummary(displayAttempt);
  const hasChessIdentity = [lichessUsername, chessComUsername].some(Boolean);
  const publicProofPath = isCompleted
    ? await buildPublicProofPath({
        attempt: latestPassedAttempt,
        challenge,
        runnerName: user?.firstName ?? user?.username ?? undefined,
      })
    : null;
  const unfinishedActiveChallenge =
    activeChallenge?.id && activeChallenge.id !== challenge.id && !progress.completedChallengeIds.includes(activeChallenge.id)
      ? getChallengeById(activeChallenge.id)
      : null;

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={isSignedIn} active="challenges" />

      <div className="content-wrap quest-detail-wrap">
        <Link href="/challenges" className="button secondary back-to-hub">← Back to Side Quest Hub</Link>

        <section className={`hero-card detail-hero quest-detail-hero ${isActive ? "active-quest-card" : ""} ${isCompleted ? "completed-quest-card" : ""}`}>
          {isActive ? <span className="active-quest-stamp detail-state-stamp" aria-label="Active quest" /> : null}
          {isCompleted ? (
            <div className="completed-quest-award" aria-label={`Quest completed. ${completedDateLabel}.`}>
              <span className="completed-quest-award-seal" aria-hidden="true" />
              <small>{completedDate ? <>Quest completed <ProofTime value={completedDate} /></> : completedDateLabel}</small>
            </div>
          ) : null}
          <div className="quest-detail-meta card-meta quest-card-meta">
            <strong className="quest-points">+{challenge.reward} pts</strong>
            <span className={`badge difficulty-badge ${getDifficultyTone(challenge.difficulty)}`}>{challenge.difficulty}</span>
          </div>
          <div className="detail-hero-grid quest-detail-hero-grid">
            <div className="quest-detail-copy">
              <div className="side-quest-title-with-like detail-title-with-like">
                <h1>{challenge.title}</h1>
                <CommunityLikeButton targetType="solo" targetId={challenge.id} count={likeSummary.count} likedByViewer={likeSummary.likedByViewer} signedIn={isSignedIn} returnTo={`/challenges/${challenge.id}`} label={challenge.title} />
              </div>
              <p className="hero-copy">{challenge.objective}</p>
              <p className="quest-detail-flavor">{challenge.openingHint}</p>
              <p>{challenge.flavor}</p>
            </div>
            <ChallengeBadge challenge={challenge} earned={isCompleted} size="hero" presentation="art" />
          </div>
          {!isCompleted ? (
            <div className="quest-detail-next-step-panel" aria-label="Next step for this Side Quest">
              <div className="quest-detail-next-step-copy">
                <span className="eyebrow">Next step</span>
                <h2>
                  {!isSignedIn
                    ? "Save this run to your SQC account."
                    : !hasChessIdentity
                      ? "Connect a chess username first."
                      : isActive
                        ? "This is your active Solo run."
                        : "Start when you are ready for proof."}
                </h2>
                <p>
                  {!isSignedIn
                    ? "Sign in to make it your active Solo Side Quest, then SQC can keep receipts when the verifier finds a matching game."
                    : !hasChessIdentity
                      ? "SQC only needs your public Lichess or Chess.com username so the checker knows which games belong to you."
                      : isActive
                        ? "Play a public game on your connected account, then ask SQC to judge the latest result or jump to the proof checker below."
                        : "Starting sets this as your one active Solo Side Quest. Existing receipts stay saved if you switch later."}
                </p>
              </div>
              <div className="button-row hero-actions quest-detail-actions">
                {!isSignedIn ? (
                  <Link href="/sign-in" className="button primary">Sign in to start this side quest</Link>
                ) : !hasChessIdentity ? (
                  <Link href="/connect" className="button primary">Add username to start</Link>
                ) : isActive ? (
                  <a href="#latest-game-checker" className="button primary">Check latest game</a>
                ) : (
                  <StartQuestControls challenge={challenge} activeChallenge={unfinishedActiveChallenge} label="Start this side quest" />
                )}
                {isSignedIn && isActive ? <DeactivateQuestControl challenge={challenge} /> : null}
              </div>
              <div className="quest-detail-next-step-facts" aria-label="Run setup summary">
                <Fact label="Proof source" value="Lichess or Chess.com public games" />
                <Fact label="Verifier" value="Latest game, or a specific game after starting" />
                <Fact label="Reward" value={`+${challenge.reward} points and coat unlock`} />
              </div>
            </div>
          ) : null}
        </section>

        <section className="mission-card quest-detail-section proof-details-section" id="share-official-side-quest" aria-label="Share official Side Quest">
          <span className="eyebrow">Share link</span>
          <h2>Send this public Side Quest.</h2>
          <p className="proof-details-line">Copy the canonical quest link or share it through the same SQC controls used for public receipts.</p>
          <ShareProofActions
            copy={buildOfficialQuestShareCopy(challenge)}
            challengeTitle={challenge.title}
            sharePath={`/challenges/${challenge.id}`}
            shareLabel="Copy public quest link"
            copiedCopy="Public Side Quest link copied."
            socialCopy={buildOfficialQuestShareCopy(challenge)}
            socialTitle={`Try ${challenge.title} on Side Quest Chess`}
            shareAriaLabel="Share official Side Quest on social media"
          />
        </section>

        {isSignedIn && !hasChessIdentity && !isCompleted ? (
          <section className="mission-card quest-detail-section">
            <span className="eyebrow">Username required</span>
            <h2>Add one public chess username before starting.</h2>
            <p>SQC needs a Lichess or Chess.com username so it knows which public games to check for this quest. No chess-site password needed.</p>
            <Link href="/connect" className="button primary">Add chess username</Link>
          </section>
        ) : null}

        {isSignedIn && isCompleted ? (
          <section className="mission-card quest-detail-section" aria-label="Completed quest victory proof">
            <div className="section-head">
              <div>
                <span className="eyebrow">Completed proof</span>
                <h2>Victory proof is ready.</h2>
              </div>
            </div>
            <ProofPositionBoard challenge={challenge} attempt={latestPassedAttempt} />
          </section>
        ) : null}

        {isSignedIn && isCompleted ? (
          <section className="mission-card quest-detail-section proof-details-section" aria-label="Completed quest proof details">
            <span className="eyebrow">Proof details</span>
            <h2>Saved and ready to share.</h2>
            <p className="proof-details-line">
              {challenge.title} completed · <ProofTime value={completedDate} /> · <ProofReceiptLink attempt={latestPassedAttempt} />
            </p>
            <ShareProofActions
              copy={buildCompletedQuestShareCopy(challenge, latestPassedAttempt)}
              challengeTitle={challenge.title}
              sharePath={publicProofPath ?? `/challenges/${challenge.id}`}
              imagePath={publicProofPath ? publicProofImagePath(publicProofPath.split("/").at(-1) ?? "") : undefined}
              shareLabel="Share proof"
            />
            <div className="quest-reset-row">
              <ResetQuestControl challenge={challenge} />
            </div>
          </section>
        ) : null}

        {isSignedIn && isActive && !isCompleted ? (
          <section id="latest-game-checker" className="mission-card quest-status-panel" aria-label={isCompleted ? "Completed quest status" : "Active quest status"}>
            <div className="section-head">
              <div>
                <span className="eyebrow">{isCompleted ? "Quest completed" : "Quest status"}</span>
                <h2>{isCompleted ? "Your proof is ready." : "Latest-game checker"}</h2>
                <p>
                  {isCompleted
                    ? `${challenge.badgeIdentity.name} is unlocked. The verifier has accepted this quest, so the next best move is to view or share the victory proof.`
                    : challengeBanner(activeChallenge)}
                </p>
              </div>
              {isCompleted ? <span className="badge green">completed</span> : null}
            </div>
            <div className="quest-status-grid">
              <ProviderStatusCard provider="Lichess" username={lichessUsername} latestAttempt={latestLichessAttempt} />
              <ProviderStatusCard provider="Chess.com" username={chessComUsername} latestAttempt={latestChessComAttempt} />
              <Fact label="Total checks" value={`${attempts.length}`} />
              <Fact label="Latest receipt" value={displayAttempt ? <ProofTime value={displayAttempt.checkedAt} /> : "not checked yet"} />
            </div>
            <article className="note-card latest-check quest-status-receipt">
              <span className="eyebrow">{isCompleted ? "Winning receipt" : "Latest receipt"}</span>
              <h3>{latestAttemptSummary.headline}</h3>
              <p>{latestAttemptSummary.detail}</p>
              <small>
                {displayAttempt ? <ReceiptMeta attempt={displayAttempt} /> : latestAttemptSummary.meta}
              </small>
            </article>
            <ProofPositionBoard challenge={challenge} attempt={displayAttempt} variant="receipt" />
            {isCompleted ? null : (
              <div className="proof-check-actions" aria-label="Proof check choices">
                <article className="proof-check-card proof-check-card-primary">
                  <span className="eyebrow">Fastest check</span>
                  <h3>Judge my latest public game.</h3>
                  <p>SQC will look at your newest Lichess or Chess.com game, then write the receipt here with the board position when proof is available.</p>
                  <form action={checkActiveChallenge}>
                    <button type="submit" className="button primary">Check latest game</button>
                  </form>
                </article>
                <form action={submitChallengeAttempt} className="profile-form quest-submitted-proof-form proof-check-card" aria-label="Submit a specific game for proof">
                  <input type="hidden" name="challengeId" value={challenge.id} />
                  <span className="eyebrow">Specific game</span>
                  <h3>Judge a game link or ID.</h3>
                  <label>
                    Lichess ID or Chess.com game URL
                    <input name="gameId" placeholder="Example: abc123 or chess.com/game/live/…" required />
                  </label>
                  <p className="microcopy">Use this when you already know the exact public game that should count. It follows the same SQC verifier path as the latest-game check.</p>
                  <button type="submit" className="button secondary">Check this game</button>
                </form>
              </div>
            )}
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


      </div>
    </main>
  );
}

function Fact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="fact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ReceiptMeta({ attempt }: { attempt: ChallengeAttempt }) {
  const isSyntheticStatus = isSyntheticLatestGameReceipt(attempt);
  const playedAt = isSyntheticStatus ? undefined : attempt.startedGameAt ?? attempt.completedGameAt;

  return (
    <>
      <ProofReceiptLink attempt={attempt} />
      {playedAt ? <> • Game played <ProofTime value={playedAt} /></> : null}
      <> • Receipt updated <ProofTime value={attempt.checkedAt} /></>
    </>
  );
}

function ProofReceiptLink({ attempt }: { attempt: ChallengeAttempt | null }) {
  if (!attempt?.gameId) {
    return <>Saved proof receipt</>;
  }

  if (isSyntheticLatestGameReceipt(attempt)) {
    return <>No post-start game found yet</>;
  }

  const provider = getAttemptProvider(attempt);
  const providerLabel = provider === "lichess" ? "Lichess" : provider === "chess.com" ? "Chess.com" : "Verified";
  const gameUrl = buildGameUrl(attempt);

  if (!gameUrl) {
    return <>{providerLabel} game {attempt.gameId}</>;
  }

  return (
    <a href={gameUrl} target="_blank" rel="noreferrer">
      {providerLabel} game {attempt.gameId}
    </a>
  );
}

function buildGameUrl(attempt: ChallengeAttempt) {
  const gameId = attempt.gameId?.trim();

  if (!gameId) return null;
  if (/^https?:\/\//i.test(gameId)) return gameId;

  const provider = getAttemptProvider(attempt);
  if (provider === "lichess") return `https://lichess.org/${gameId}`;
  if (provider === "chess.com") return `https://www.chess.com/game/live/${gameId}`;

  return null;
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
      <small>{latestAttempt ? <>Last checked <ProofTime value={latestAttempt.checkedAt} /></> : "No check recorded yet"}</small>
    </div>
  );
}

function getLatestProviderAttempt(attempts: ChallengeAttempt[], provider: "lichess" | "chess.com") {
  return attempts.find((attempt) => getAttemptProvider(attempt) === provider) ?? null;
}

function buildCurrentVerifierAttempt(
  latestAttempt: ChallengeAttempt | null,
  latestPassedAttempt: ChallengeAttempt | null,
  activeChallenge: ReturnType<typeof getActiveChallenge>,
  challenge: Challenge,
  isCompleted: boolean,
): ChallengeAttempt | null {
  if (latestPassedAttempt) {
    return latestPassedAttempt;
  }

  if (!latestAttempt) {
    return null;
  }

  const isActiveCurrentQuest = activeChallenge?.id === challenge.id;
  const isPreTimestampReceipt = isActiveCurrentQuest && !isCompleted && latestAttempt.status !== "passed" && !latestAttempt.startedGameAt;

  if (!isPreTimestampReceipt) {
    return latestAttempt;
  }

  return {
    ...latestAttempt,
    status: "pending",
    summary: "No new eligible games were found since this quest was started. Play a new public game after starting the quest, then check again.",
  };
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

function buildOfficialQuestShareCopy(challenge: Challenge) {
  return `Try “${challenge.title}” on Side Quest Chess. ${challenge.objective}`;
}

function buildCompletedQuestShareCopy(challenge: Challenge, attempt: ChallengeAttempt | null) {
  const summary = sanitizeAttemptSummary(attempt?.summary);

  return `I completed “${challenge.title}” on Side Quest Chess. ${challenge.badgeIdentity.name} unlocked. +${challenge.reward} points. ${summary}`;
}
