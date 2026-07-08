import MobileAppWebShell from "@/components/mobile-app-web-shell";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { CHALLENGES } from "@/lib/challenges";
import { listPublicGroupQuests, listUserRelatedGroupQuests, rankGroupQuestParticipants } from "@/lib/groupquests";
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
    ? await getHomeTrophyRows(user.id, progress.completedChallengeIds)
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

async function getHomeTrophyRows(userId: string, completedChallengeIds: string[]) {
  const client = await clerkClient();
  const [relatedGroupQuests, publicGroupQuests] = await Promise.all([
    listUserRelatedGroupQuests(client, userId),
    listPublicGroupQuests(client),
  ]);
  const dedupedGroupQuests = new Map([...relatedGroupQuests, ...publicGroupQuests].map((quest) => [quest.id, quest]));
  const multiplayerRows = [...dedupedGroupQuests.values()]
    .filter((quest) => deriveGroupQuestStatus(quest.startAt, quest.endAt) === "Finished")
    .map((quest) => {
      const ranked = rankGroupQuestParticipants(quest);
      const index = ranked.findIndex((participant) => participant.userId === userId);
      const participant = index >= 0 ? ranked[index] : null;
      if (!participant || index > 2 || (participant.score ?? 0) <= 0) return null;
      const placement = index === 0 ? "Gold" : index === 1 ? "Silver" : "Bronze";

      return {
        id: `multiplayer-${quest.id}-${placement.toLowerCase()}`,
        title: quest.name,
        meta: `Multiplayer placement · ${index === 0 ? "1st" : index === 1 ? "2nd" : "3rd"} place`,
        href: `/groupquests/${quest.id}?accepted=1`,
        image: "/mobile-source/sqc-coat-of-arms.png",
        statusImage: `/mobile-source/stamps/sqc-${placement.toLowerCase()}-seal.png`,
      };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row));

  const completedSet = new Set(completedChallengeIds);
  const soloRows = CHALLENGES
    .filter((challenge) => completedSet.has(challenge.id))
    .map((challenge) => ({
      id: `solo-${challenge.id}`,
      title: challenge.title,
      meta: `Unlocked ${challenge.badgeIdentity.name}`,
      href: `/challenges/${challenge.id}`,
      image: toMobileAssetPath(challenge.badgeIdentity.image) ?? "/mobile-source/sqc-coat-of-arms.png",
      glow: getChallengeGlowPath(challenge.id),
      statusImage: "/mobile-source/stamps/quest-complete-red-wax-sqc-v15.png",
    }));

  return [...multiplayerRows, ...soloRows].slice(0, 5);
}

function deriveGroupQuestStatus(startAt: string, endAt: string) {
  const now = Date.now();
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();
  if (Number.isFinite(end) && now > end) return "Finished";
  if (Number.isFinite(start) && now < start) return "Scheduled";
  return "Active";
}

function toMobileAssetPath(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("/mobile-source/")) return path;
  if (path.startsWith("/badges/")) return `/mobile-source${path}`;
  if (path.startsWith("/stamps/")) return `/mobile-source${path}`;
  return path;
}

function getChallengeGlowPath(challengeId: string) {
  const known = new Set([
    "bishop-field-trip",
    "early-king-walk",
    "finish-any-game",
    "knightmare-mode",
    "knights-before-coffee",
    "no-castle-club",
    "pawn-only-picnic",
    "queen-never-heard-of-her",
    "the-blunder-gambit",
  ]);
  return known.has(challengeId) ? `/mobile-source/badges/glow/${challengeId}-glow.png` : null;
}
