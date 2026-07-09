import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import MobileAppWebShell, { MiniChessBoard } from "@/components/mobile-app-web-shell";
import { MobileWebRelativeTime } from "@/components/mobile-web-relative-time";
import { CHALLENGES, getChallengeById } from "@/lib/challenges";
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

  return (
    <MobileAppWebShell
      activeTab="sideQuests"
      signedIn={Boolean(user)}
      displayName={displayName}
      lichessUsername={getLichessUsername(metadata)}
      chessComUsername={getChessComUsername(metadata)}
    >
      <div className={isActiveChallenge ? "sqc-stack sqc-active-solo-detail-screen" : "sqc-stack"}>
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
          <section className="sqc-multiplayer-detail-hero">
            <span className="sqc-section-mark trophy" aria-hidden="true">
              <Image className="sqc-mark-image" alt="" src={badgePath} width={112} height={112} priority />
            </span>
            <span className="sqc-multiplayer-kicker">Solo Side Quests</span>
            <h1>{challenge.title}</h1>
            <p>{challenge.objective}</p>
          </section>
        )}

        <section className={isActiveChallenge ? "sqc-native-card sqc-detail-panel-strong" : "sqc-native-card"}>
          <span className="sqc-card-eyebrow">{isActiveChallenge ? "Current Side Quest" : "Proof"}</span>
          <h2>{isActiveChallenge ? (activePassed ? "Completed - proof accepted" : "Do this next") : "No qualifying game yet"}</h2>
          {isActiveChallenge ? null : <p>Next step: play a new public game on your connected chess account, then tap Check my latest game again.</p>}
          <div className={isActiveChallenge ? "sqc-proof-step-list" : "sqc-option-grid"}>
            <ProofStep number="1" text="Play a new public game on your connected chess account." />
            <ProofStep number="2" text="Complete your Side Quest during that game." />
            <ProofStep number="3" text="Come back here and tap Check my latest game." />
          </div>
          <div className="sqc-action-pair one-or-two sqc-active-detail-actions">
            <Link href="/account" className="sqc-secondary-action">Start this Side Quest</Link>
            <Link href="/account" className="sqc-primary-action">Check my latest game</Link>
          </div>
        </section>

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
        ) : null}

        <section className="sqc-native-card">
          <span className="sqc-card-eyebrow">How to complete it</span>
          <h2>{isActiveChallenge ? "Conditions" : "What must happen?"}</h2>
          {isActiveChallenge ? <p>{conditionLines.length === 1 ? "Complete this condition in one eligible public game." : "Complete every condition in one eligible public game."}</p> : <p>{challenge.instruction ?? challenge.proofCallout ?? challenge.objective}</p>}
          <div className={isActiveChallenge ? "sqc-condition-list" : "sqc-option-grid"}>
            {isActiveChallenge ? (
              conditionLines.map((condition, index) => (
                <div className="sqc-condition-compact-row" key={condition}>
                  <span aria-hidden="true">{index + 1}</span>
                  <div>
                    <strong>Condition {index + 1}</strong>
                    <p>{condition}</p>
                  </div>
                </div>
              ))
            ) : (
              challenge.conditions.map((condition) => (
                <div className="sqc-option-card" key={condition}>
                  <span aria-hidden="true" />
                  <strong>{condition}</strong>
                </div>
              ))
            )}
          </div>
        </section>
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
