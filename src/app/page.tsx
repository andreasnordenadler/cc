import MobileAppWebShell from "@/components/mobile-app-web-shell";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { CHALLENGES } from "@/lib/challenges";
import { listPublicCommunitySideQuests } from "@/lib/community-side-quests";
import { getCustomSideQuests } from "@/lib/custom-side-quests";
import { getMobileWebTheme } from "@/lib/mobile-web-theme";
import { getChallengeGlowPath, loadOptionalCommunityTrophyQuests } from "@/lib/mobile-web-trophies";
import { buildActiveMultiplayerHomeRows, buildHomeActiveSoloProofPath, getCompletedSoloQuestIds, getLatestPassedSoloChallengeAttempt, getLatestSoloChallengeAttempt, hasCompletedSoloProof, loadHomeTrophyRows, resolveHomeActiveSoloQuest } from "@/lib/mobile-web-home";
import { listUserRelatedGroupQuests } from "@/lib/groupquests";
import {
  buildAttemptSummary,
  getActiveChallenge,
  getChallengeAttempts,
  getChallengeProgress,
  getChessComUsername,
  getLichessUsername,
  getPreferredRunnerName,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

export default async function Home() {
  noStore();
  const user = await currentUser();
  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const privateMetadata = user?.privateMetadata && typeof user.privateMetadata === "object"
    ? (user.privateMetadata as UserMetadataRecord)
    : {};
  const activeChallenge = getActiveChallenge(metadata);
  const activeOfficialChallenge = activeChallenge
    ? CHALLENGES.find((challenge) => challenge.id === activeChallenge.id) ?? null
    : null;
  const privateCustomSideQuests = getCustomSideQuests(privateMetadata);
  const customSideQuests = privateCustomSideQuests.length ? privateCustomSideQuests : getCustomSideQuests(metadata);
  const client = user ? await clerkClient() : null;
  const needsCommunityActiveQuest = Boolean(
    activeChallenge?.id
      && !activeOfficialChallenge
      && !customSideQuests.some((quest) => quest.id === activeChallenge.id),
  );
  const communitySideQuests = user && client && needsCommunityActiveQuest
    ? await loadOptionalCommunityTrophyQuests(() => listPublicCommunitySideQuests(client, {
        limit: null,
        viewerUserId: user.id,
        maxPages: 10,
      }))
    : [];
  const activeSoloQuest = resolveHomeActiveSoloQuest(activeChallenge?.id, customSideQuests, communitySideQuests, activeChallenge?.customQuestSnapshot);
  const progress = getChallengeProgress(metadata);
  const challengeAttempts = getChallengeAttempts(metadata);
  const completedSoloIds = getCompletedSoloQuestIds(progress.completedChallengeIds, challengeAttempts);
  const activeChallengeAttempt = activeChallenge?.id ? getLatestSoloChallengeAttempt(challengeAttempts, activeChallenge.id) : null;
  const activeChallengeSummary = buildAttemptSummary(activeChallengeAttempt);
  const activeChallengeCompleted = Boolean(activeSoloQuest && hasCompletedSoloProof(activeSoloQuest.id, completedSoloIds, challengeAttempts));
  const activeChallengePassedAttempt = activeChallenge?.id ? getLatestPassedSoloChallengeAttempt(challengeAttempts, activeChallenge.id) : null;
  const activeCustomQuest = activeChallenge?.id && !activeOfficialChallenge
    ? customSideQuests.find((quest) => quest.id === activeChallenge.id)
      ?? communitySideQuests.find((quest) => quest.id === activeChallenge.id)
      ?? null
    : null;
  const proofReceiptCount = challengeAttempts.length;
  const displayName = user
    ? getPreferredRunnerName(metadata, {
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        emailAddress: user.primaryEmailAddress?.emailAddress,
      }) || "Side Quest Chess"
    : null;
  const activeChallengeProofPath = await buildHomeActiveSoloProofPath({
    completed: activeChallengeCompleted,
    officialChallenge: activeOfficialChallenge,
    customQuest: activeCustomQuest,
    attempt: activeChallengePassedAttempt,
    runnerName: displayName ?? undefined,
  });
  const [trophyRows, relatedGroupQuests] = user && client
    ? await Promise.all([
        loadHomeTrophyRows(client, user.id, completedSoloIds),
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
      activeSolo={activeSoloQuest ? {
        id: activeSoloQuest.id,
        source: activeSoloQuest.source,
        href: activeSoloQuest.href,
        title: activeSoloQuest.title,
        objective: activeSoloQuest.objective,
        instruction: activeSoloQuest.instruction,
        badgeImage: activeSoloQuest.badgeImage,
        glowImage: activeSoloQuest.source === "official" ? getChallengeGlowPath(activeSoloQuest.id) : null,
        theme: getMobileWebTheme(activeSoloQuest.badgeColors),
        pickedAt: activeChallenge?.startedAt ?? null,
        verifiedAt: activeChallenge?.verifiedAt ?? null,
        completed: activeChallengeCompleted,
        proofHref: activeChallengeProofPath,
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
      completedSoloCount={completedSoloIds.length}
      proofReceiptCount={proofReceiptCount}
    />
  );
}
