import MobileAppWebShell from "@/components/mobile-app-web-shell";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { CHALLENGES } from "@/lib/challenges";
import { getMobileWebTheme } from "@/lib/mobile-web-theme";
import { getChallengeGlowPath } from "@/lib/mobile-web-trophies";
import { buildActiveMultiplayerHomeRows, loadHomeTrophyRows } from "@/lib/mobile-web-home";
import { listUserRelatedGroupQuests } from "@/lib/groupquests";
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
  const client = user ? await clerkClient() : null;
  const [trophyRows, relatedGroupQuests] = user && client
    ? await Promise.all([
        loadHomeTrophyRows(client, user.id, progress.completedChallengeIds),
        listUserRelatedGroupQuests(client, user.id),
      ])
    : [[], []];
  const activeMultiplayerRows = user ? buildActiveMultiplayerHomeRows(relatedGroupQuests, user.id) : [];

  return (
    <MobileAppWebShell
      activeTab="home"
      signedIn={Boolean(user)}
      displayName={displayName}
      profileImageUrl={user?.imageUrl ?? null}
      lichessUsername={getLichessUsername(metadata)}
      chessComUsername={getChessComUsername(metadata)}
      activeSolo={activeChallengeRecord ? {
        id: activeChallengeRecord.id,
        href: `/challenges/${activeChallengeRecord.id}`,
        title: activeChallengeRecord.title,
        objective: activeChallengeRecord.objective,
        instruction: activeChallengeRecord.instruction,
        badgeImage: activeChallengeRecord.badgeIdentity.image ?? null,
        glowImage: getChallengeGlowPath(activeChallengeRecord.id),
        theme: getMobileWebTheme(activeChallengeRecord.badgeIdentity.colors),
        pickedAt: activeChallenge?.startedAt ?? null,
        verifiedAt: activeChallenge?.verifiedAt ?? null,
        completed: progress.completedChallengeIds.includes(activeChallengeRecord.id),
        latestAttempt: activeChallengeAttempt ? {
          status: activeChallengeAttempt.status ?? null,
          checkedAt: activeChallengeAttempt.checkedAt ?? null,
          finalPositionFen: activeChallengeAttempt.finalPositionFen ?? null,
          lastMoveUci: activeChallengeAttempt.lastMoveUci ?? null,
          lastMoveSan: activeChallengeAttempt.lastMoveSan ?? null,
          playerColor: activeChallengeAttempt.failureDiagnostic?.playerColor ?? activeChallengeAttempt.playerColor ?? null,
          failureFen: activeChallengeAttempt.failureDiagnostic?.fenAtBreak ?? null,
          failureUci: activeChallengeAttempt.failureDiagnostic?.uci ?? null,
          summary: activeChallengeAttempt.summary ?? activeChallengeSummary.detail,
          headline: activeChallengeSummary.headline,
        } : null,
      } : null}
      activeMultiplayerRows={activeMultiplayerRows}
      trophyRows={trophyRows}
      completedSoloCount={progress.totalCompletedChallenges}
      proofReceiptCount={proofReceiptCount}
    />
  );
}
