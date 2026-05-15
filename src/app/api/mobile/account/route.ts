import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { CHALLENGES } from "@/lib/challenges";
import {
  buildAttemptSummary,
  challengeBanner,
  getActiveChallenge,
  getChallengeAttempts,
  getChallengeProgress,
  getChessComUsername,
  getLichessUsername,
  getRunnerBio,
  getRunnerDisplayName,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

export async function GET(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      {
        apiVersion: 1,
        authenticated: false,
        signInUrl: new URL("/sign-in", request.url).toString(),
        message: "Sign in to load your Side Quest Chess account state.",
      },
      { status: 401 },
    );
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const baseUrl = new URL(request.url).origin;
  const metadata = user.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const progress = getChallengeProgress(metadata);
  const activeChallenge = getActiveChallenge(metadata);
  const activeChallengeRecord = activeChallenge?.id
    ? CHALLENGES.find((challenge) => challenge.id === activeChallenge.id) ?? null
    : null;
  const completedSet = new Set(progress.completedChallengeIds);
  const completedChallenges = CHALLENGES.filter((challenge) => completedSet.has(challenge.id));
  const attempts = getChallengeAttempts(metadata);
  const rawLatestAttempt = getLatestAttemptForChallenge(metadata, activeChallenge?.id) ?? attempts.at(-1) ?? null;
  const latestPassedAttempt = activeChallenge?.id ? getLatestPassedAttempt(metadata, activeChallenge.id) : null;
  const latestAttempt = normalizeCurrentVerifierAttempt(rawLatestAttempt, latestPassedAttempt, activeChallenge?.id);
  const latestAttemptSummary = buildAttemptSummary(latestAttempt);

  return NextResponse.json({
    apiVersion: 1,
    authenticated: true,
    generatedAt: new Date().toISOString(),
    profile: {
      displayName: getRunnerDisplayName(metadata) || user.username || user.firstName || "SQC player",
      bio: getRunnerBio(metadata),
      imageUrl: user.imageUrl || null,
    },
    chessAccounts: {
      lichessUsername: getLichessUsername(metadata) || null,
      chessComUsername: getChessComUsername(metadata) || null,
      hasAny: Boolean(getLichessUsername(metadata) || getChessComUsername(metadata)),
    },
    progress: {
      completedChallengeIds: progress.completedChallengeIds,
      totalCompletedChallenges: progress.totalCompletedChallenges,
      totalRewardPoints: progress.totalRewardPoints,
      proofReceiptCount: attempts.length,
    },
    activeQuest: activeChallenge && activeChallengeRecord
      ? {
          id: activeChallengeRecord.id,
          title: activeChallengeRecord.title,
          status: activeChallenge.status ?? "accepted",
          startedAt: activeChallenge.startedAt ?? null,
          verifiedAt: activeChallenge.verifiedAt ?? null,
          completed: completedSet.has(activeChallengeRecord.id),
          banner: challengeBanner(activeChallenge),
          href: new URL(`/challenges/${activeChallengeRecord.id}`, baseUrl).toString(),
          badgeImageUrl: activeChallengeRecord.badgeIdentity.image
            ? new URL(activeChallengeRecord.badgeIdentity.image, baseUrl).toString()
            : null,
        }
      : null,
    completedQuests: completedChallenges.map((challenge) => {
      const latestPassed = getLatestPassedAttempt(metadata, challenge.id);

      return {
        id: challenge.id,
        title: challenge.title,
        reward: challenge.reward,
        badgeName: challenge.badgeIdentity.name,
        completedAt: latestPassed?.completedGameAt ?? latestPassed?.checkedAt ?? null,
        href: new URL(`/challenges/${challenge.id}`, baseUrl).toString(),
        badgeImageUrl: challenge.badgeIdentity.image ? new URL(challenge.badgeIdentity.image, baseUrl).toString() : null,
      };
    }),
    latestReceipt: latestAttempt
      ? {
          id: latestAttempt.id ?? null,
          challengeId: latestAttempt.challengeId ?? null,
          provider: latestAttempt.provider ?? null,
          status: latestAttempt.status ?? null,
          gameId: latestAttempt.gameId ?? null,
          checkedAt: latestAttempt.checkedAt ?? null,
          startedGameAt: latestAttempt.startedGameAt ?? null,
          completedGameAt: latestAttempt.completedGameAt ?? null,
          headline: latestAttemptSummary.headline,
          detail: latestAttemptSummary.detail,
          meta: latestAttemptSummary.meta,
        }
      : null,
  });
}

function getLatestAttemptForChallenge(metadata: UserMetadataRecord, challengeId?: string) {
  if (!challengeId) return null;
  return getChallengeAttempts(metadata, challengeId).at(-1) ?? null;
}

function normalizeCurrentVerifierAttempt(
  latestAttempt: ReturnType<typeof getLatestAttemptForChallenge>,
  latestPassedAttempt: ReturnType<typeof getLatestPassedAttempt>,
  activeChallengeId?: string,
) {
  if (latestPassedAttempt) {
    return latestPassedAttempt;
  }

  if (!latestAttempt) {
    return null;
  }

  if (activeChallengeId && latestAttempt.challengeId === activeChallengeId && latestAttempt.status !== "passed" && !latestAttempt.startedGameAt) {
    return {
      ...latestAttempt,
      status: "pending",
      summary: "No new eligible games were found since this quest was started. Play a new public game after starting the quest, then check again.",
    };
  }

  return latestAttempt;
}

function getLatestPassedAttempt(metadata: UserMetadataRecord, challengeId: string) {
  return getChallengeAttempts(metadata, challengeId)
    .filter((attempt) => attempt.status === "passed")
    .at(-1) ?? null;
}
