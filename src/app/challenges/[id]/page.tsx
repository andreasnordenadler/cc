import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import MobileAppWebShell, { MiniChessBoard } from "@/components/mobile-app-web-shell";
import { MobileWebRelativeTime } from "@/components/mobile-web-relative-time";
import { CHALLENGES, getChallengeById } from "@/lib/challenges";
import { getCommunityLikeSummaries } from "@/lib/community-likes";
import { getChallengeGlowPath } from "@/lib/mobile-web-trophies";
import {
  buildAttemptSummary,
  getActiveChallenge,
  getChallengeProgress,
  getChessComUsername,
  getLatestChallengeAttempt,
  getLichessUsername,
  getPreferredRunnerName,
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

  return {
    title: `${challenge.title} — Side Quest Chess`,
    description: challenge.objective,
  };
}

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  noStore();
  const { id } = await params;
  const challenge = getChallengeById(id);

  if (!challenge) {
    notFound();
  }

  const user = await currentUser();
  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const displayName = user
    ? getPreferredRunnerName(metadata, {
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        emailAddress: user.primaryEmailAddress?.emailAddress,
      }) || "Side Quest Chess"
    : null;
  const activeChallenge = getActiveChallenge(metadata);
  const activeAttempt = getLatestChallengeAttempt(metadata, challenge.id);
  const activeAttemptSummary = buildAttemptSummary(activeAttempt);
  const progress = getChallengeProgress(metadata);
  const isActiveChallenge = Boolean(user && activeChallenge?.id === challenge.id);
  const activePassed = Boolean(
    progress.completedChallengeIds.includes(challenge.id)
      || activeAttempt?.status === "passed"
      || activeAttemptSummary.headline.toLowerCase().includes("passed")
  );
  const activeFailed = Boolean(activeAttempt && !activePassed && activeAttempt.status && activeAttempt.status !== "pending");
  const activeFen = activeFailed
    ? activeAttempt?.failureDiagnostic?.fenAtBreak ?? activeAttempt?.finalPositionFen
    : activeAttempt?.finalPositionFen;
  const activeUci = activeFailed
    ? activeAttempt?.failureDiagnostic?.uci ?? activeAttempt?.lastMoveUci
    : activeAttempt?.lastMoveUci;
  const badgePath = toMobileAssetPath(challenge.badgeIdentity.image) ?? "/mobile-source/badges/v6/proof-loop-test-badge.png";
  const glowPath = getChallengeGlowPath(challenge.id);
  const conditionLines = challenge.conditions?.length
    ? challenge.conditions
    : challenge.rules.length
      ? challenge.rules
      : [challenge.instruction, challenge.proofCallout].filter(Boolean);
  const completed = progress.completedChallengeIds.includes(challenge.id);
  const likeSummary = user
    ? (await getCommunityLikeSummaries(await clerkClient(), user.id)).get("solo", challenge.id)
    : { count: 0, likedByViewer: false };

  return (
    <MobileAppWebShell
      activeTab="sideQuests"
      signedIn={Boolean(user)}
      displayName={displayName}
      lichessUsername={getLichessUsername(metadata)}
      chessComUsername={getChessComUsername(metadata)}
    >
      <div className={isActiveChallenge ? "sqc-stack sqc-active-solo-detail-screen" : "sqc-stack sqc-official-solo-detail-screen"}>
        {isActiveChallenge ? (
          <section className="sqc-active-detail-hero">
            <span className="sqc-detail-coat-frame" aria-hidden="true">
              {glowPath ? <Image className="sqc-detail-coat-glow" alt="" src={glowPath} width={152} height={164} priority /> : null}
              <Image className="sqc-detail-coat-image" alt="" src={badgePath} width={108} height={118} priority />
            </span>
            <span className="sqc-pill">{activePassed ? "Completed Solo Side Quest" : "Active Solo Side Quest"}</span>
            <h1>{challenge.title}</h1>
            <p>{challenge.objective}</p>
          </section>
        ) : (
          <section className="sqc-native-card sqc-official-quest-card" aria-label={`${challenge.title} details`}>
            <div className="sqc-official-quest-header">
              <div className="sqc-official-quest-copy">
                <div className="sqc-official-title-row">
                  <h1>{challenge.title}</h1>
                  <span className={likeSummary.likedByViewer ? "sqc-row-like liked" : "sqc-row-like"} aria-label={`${likeSummary.likedByViewer ? "Liked" : "Like"} ${challenge.title}. ${likeSummary.count} like${likeSummary.count === 1 ? "" : "s"}.`}>
                    <span aria-hidden="true" />
                    <strong>{likeSummary.count}</strong>
                  </span>
                </div>
                <div className="sqc-quest-meta-row">
                  <span className="sqc-coat-pill"><span aria-hidden="true">★</span> Coat</span>
                  <span className={`sqc-difficulty-pill ${challenge.difficulty.toLowerCase()}`}>{challenge.difficulty}</span>
                </div>
                <p>{challenge.objective}</p>
              </div>
              <span className="sqc-official-coat-frame" aria-hidden="true">
                {glowPath ? <Image className="sqc-official-coat-glow" alt="" src={glowPath} width={132} height={144} priority /> : null}
                <Image className="sqc-official-coat-image" alt="" src={badgePath} width={92} height={102} priority />
              </span>
            </div>
          </section>
        )}

        {isActiveChallenge ? (
          <section className="sqc-native-card sqc-detail-panel-strong">
            <span className="sqc-card-eyebrow">Current Side Quest</span>
            <h2>{activePassed ? "Completed - proof accepted" : "Do this next"}</h2>
            <div className="sqc-proof-step-list">
              <ProofStep number="1" text="Play a new public game on your connected chess account." />
              <ProofStep number="2" text="Complete your Side Quest during that game." />
              <ProofStep number="3" text="Come back here and tap Check my latest game." />
            </div>
            <div className="sqc-action-pair one-or-two sqc-active-detail-actions">
              <Link href="/account" className="sqc-secondary-action">Start this Side Quest</Link>
              <Link href="/account" className="sqc-primary-action">Check my latest game</Link>
            </div>
          </section>
        ) : null}

        {isActiveChallenge ? (
          <section className="sqc-active-proof-summary">
            <MiniChessBoard
              fen={activeFen}
              highlightUci={activeUci}
              orientation={activeAttempt?.playerColor ?? activeAttempt?.failureDiagnostic?.playerColor ?? "white"}
            />
            <div className="sqc-active-detail-copy">
              <p><strong>Goal:</strong> {challenge.objective}</p>
              <p><strong>Picked:</strong> <MobileWebRelativeTime value={activeChallenge?.startedAt} fallback="not recorded" /></p>
              <p><strong>Latest check:</strong> <MobileWebRelativeTime value={activeAttempt?.checkedAt ?? activeChallenge?.verifiedAt} fallback="not yet" /></p>
              <p><strong>Status:</strong> <span className={activePassed ? "sqc-good" : "sqc-danger"}>{activePassed ? "Completed" : "Not Completed"}</span></p>
              {activeAttempt ? null : <p className="sqc-active-summary">Starting position shown until your next public game is available. Play on Lichess or Chess.com, then come back and refresh proof.</p>}
            </div>
          </section>
        ) : (
          <>
            <section className="sqc-quest-flavor-card">
              <p>{challenge.flavor}</p>
            </section>

            <section className="sqc-native-card sqc-quest-instruction-card">
              <span className="sqc-card-eyebrow">Conditions</span>
              <h2>Complete every condition in one eligible public game.</h2>
              <div className="sqc-condition-list">
                {challenge.conditions.map((condition, index) => (
                  <div className="sqc-condition-compact-row" key={condition}>
                    <span aria-hidden="true">{index + 1}</span>
                    <div>
                      <strong>Condition {index + 1}</strong>
                      <p>{condition}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="sqc-opening-hint">{challenge.openingHint}</p>
            </section>

            <Link href={`/challenges/${challenge.id}`} className="sqc-secondary-action full sqc-share-action">Share public link</Link>

            {completed ? null : (
              <section className="sqc-native-card sqc-proof-action-card">
                <span className="sqc-card-eyebrow">{user ? "Pick this Side Quest" : "Sign in to start this Side Quest"}</span>
                <h2>{user ? `${challenge.title} is ready for the royal docket.` : "Sign in to save quest progress."}</h2>
                <p>{user ? "Choose this rule so SQC knows what to judge after your next public game." : "Browse the rules here. Sign in when you want SQC to save this as your active Solo Side Quest and track proof."}</p>
                <div className="sqc-action-pair one-or-two">
                  <Link href="/side-quests" className="sqc-secondary-action">Back to list</Link>
                  <Link href={user ? "/account" : `/sign-in?redirect_url=/challenges/${encodeURIComponent(challenge.id)}`} className="sqc-primary-action">
                    {user ? "Start this Side Quest" : "Sign in"}
                  </Link>
                </div>
              </section>
            )}
          </>
        )}

        {isActiveChallenge ? (
          <section className="sqc-native-card">
            <span className="sqc-card-eyebrow">How to complete it</span>
            <h2>Conditions</h2>
            <p>{conditionLines.length === 1 ? "Complete this condition in one eligible public game." : "Complete every condition in one eligible public game."}</p>
            <div className="sqc-condition-list">
              {conditionLines.map((condition, index) => (
                <div className="sqc-condition-compact-row" key={condition}>
                  <span aria-hidden="true">{index + 1}</span>
                  <div>
                    <strong>Condition {index + 1}</strong>
                    <p>{condition}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </MobileAppWebShell>
  );
}

function ProofStep({ number, text }: { number: string; text: string }) {
  return (
    <div className="sqc-option-card sqc-proof-step-row">
      <span aria-hidden="true">{number}</span>
      <strong>{text}</strong>
    </div>
  );
}

function toMobileAssetPath(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("/mobile-source/")) return path;
  if (path.startsWith("/badges/") || path.startsWith("/stamps/")) return `/mobile-source${path}`;
  return path;
}
