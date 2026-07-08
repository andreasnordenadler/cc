import MobileAppWebShell from "@/components/mobile-app-web-shell";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { CHALLENGES } from "@/lib/challenges";
import { getChallengeGlowPath, getMobileWebTrophyRows } from "@/lib/mobile-web-trophies";
import {
  buildAttemptSummary,
  getActiveChallenge,
  getChallengeAttempts,
  getChallengeProgress,
  getChessComUsername,
  getLatestChallengeAttempt,
  getLichessUsername,
  getPreferredRunnerName,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

export default async function Home() {
  noStore();
  const user = await currentUser();
  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const activeChallenge = getActiveChallenge(metadata);
  const activeChallengeRecord = activeChallenge
    ? CHALLENGES.find((challenge) => challenge.id === activeChallenge.id) ?? null
    : null;
  const activeChallengeAttempt = activeChallenge?.id ? getLatestChallengeAttempt(metadata, activeChallenge.id) : null;
  const activeChallengeSummary = buildAttemptSummary(activeChallengeAttempt);
  const progress = getChallengeProgress(metadata);
  const proofReceiptCount = getChallengeAttempts(metadata).length;
  const displayName = user
    ? getPreferredRunnerName(metadata, {
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        emailAddress: user.primaryEmailAddress?.emailAddress,
      }) || "Side Quest Chess"
    : null;
  const trophyRows = user
    ? await getMobileWebTrophyRows(await clerkClient(), user.id, progress.completedChallengeIds, 5)
    : [];

  return (
    <MobileAppWebShell
      activeTab="home"
      signedIn={Boolean(user)}
      displayName={displayName}
      profileImageUrl={user?.imageUrl ?? null}
      lichessUsername={getLichessUsername(metadata)}
      chessComUsername={getChessComUsername(metadata)}
      activeSolo={activeChallengeRecord ? {
        title: activeChallengeRecord.title,
        objective: activeChallengeRecord.objective,
        instruction: activeChallengeRecord.instruction,
        badgeImage: activeChallengeRecord.badgeIdentity.image ?? null,
        glowImage: getChallengeGlowPath(activeChallengeRecord.id),
        pickedAt: activeChallenge?.startedAt ?? null,
        verifiedAt: activeChallenge?.verifiedAt ?? null,
        completed: progress.completedChallengeIds.includes(activeChallengeRecord.id),
        latestAttempt: activeChallengeAttempt ? {
          status: activeChallengeAttempt.status ?? null,
          checkedAt: activeChallengeAttempt.checkedAt ?? null,
          finalPositionFen: activeChallengeAttempt.finalPositionFen ?? null,
          lastMoveUci: activeChallengeAttempt.lastMoveUci ?? null,
          lastMoveSan: activeChallengeAttempt.lastMoveSan ?? null,
          playerColor: activeChallengeAttempt.playerColor ?? activeChallengeAttempt.failureDiagnostic?.playerColor ?? null,
          failureFen: activeChallengeAttempt.failureDiagnostic?.fenAtBreak ?? null,
          failureUci: activeChallengeAttempt.failureDiagnostic?.uci ?? null,
          summary: activeChallengeAttempt.summary ?? activeChallengeSummary.detail,
          headline: activeChallengeSummary.headline,
        } : null,
      } : null}
      trophyRows={trophyRows}
      completedSoloCount={progress.totalCompletedChallenges}
      proofReceiptCount={proofReceiptCount}
    />
  );
}
