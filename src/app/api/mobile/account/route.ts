import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getMobileRequestUserId } from "@/lib/mobile-auth";
import { CHALLENGES } from "@/lib/challenges";
import { getSupportMessages } from "@/lib/analytics";
import { buildPublicProofPath } from "@/lib/proof-share";
import { listPublicGroupQuests, listUserRelatedGroupQuests, type ServerGroupQuest } from "@/lib/groupquests";
import { getCustomSideQuests } from "@/lib/custom-side-quests";
import {
  buildAttemptSummary,
  challengeBanner,
  getActiveChallenge,
  getChallengeAttempts,
  getChallengeProgress,
  getChessComUsername,
  getLichessUsername,
  getPreferredRunnerName,
  getRunnerBio,
  shouldPreselectDefaultStarterQuest,
  type ChallengeAttempt,
  type UserMetadataRecord,
  withDefaultStarterQuest,
} from "@/lib/user-metadata";

export async function GET(request: Request) {
  const userId = await getMobileRequestUserId(request);

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
  const userResult = await getMobileAccountUser(client, userId);
  if (!userResult.ok) return userResult.response;
  const user = userResult.user;
  const baseUrl = new URL(request.url).origin;
  let metadata = user.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  if (shouldPreselectDefaultStarterQuest(metadata)) {
    metadata = withDefaultStarterQuest(metadata);
    await client.users.updateUserMetadata(userId, { publicMetadata: metadata });
  }
  const privateMetadata = user.privateMetadata && typeof user.privateMetadata === "object" ? (user.privateMetadata as UserMetadataRecord) : {};
  const progress = getChallengeProgress(metadata);
  const privateCustomSideQuests = getCustomSideQuests(privateMetadata);
  const customSideQuests = privateCustomSideQuests.length ? privateCustomSideQuests : getCustomSideQuests(metadata);
  const customQuestMap = new Map(customSideQuests.map((quest) => [quest.id, quest]));
  const activeChallenge = getActiveChallenge(metadata);
  const activeOfficialChallengeRecord = activeChallenge?.id
    ? CHALLENGES.find((challenge) => challenge.id === activeChallenge.id) ?? null
    : null;
  const activeCustomQuestRecord = activeChallenge?.id ? customQuestMap.get(activeChallenge.id) ?? null : null;
  const activeChallengeRecord = activeOfficialChallengeRecord ?? activeCustomQuestRecord;
  const completedSet = new Set(progress.completedChallengeIds);
  const completedChallenges = CHALLENGES.filter((challenge) => completedSet.has(challenge.id));
  const completedCustomQuests = customSideQuests.filter((quest) => completedSet.has(quest.id));
  const attempts = getChallengeAttempts(metadata);
  const rawLatestAttempt = getLatestAttemptForChallenge(metadata, activeChallenge?.id) ?? attempts.at(-1) ?? null;
  const latestPassedAttempt = activeChallenge?.id ? getLatestPassedAttempt(metadata, activeChallenge.id, activeChallenge.startedAt) : null;
  const latestAttempt = normalizeCurrentVerifierAttempt(rawLatestAttempt, latestPassedAttempt, activeChallenge?.id, activeChallenge?.startedAt);
  const latestAttemptSummary = buildAttemptSummary(latestAttempt);
  const latestChallengeRecord = latestAttempt?.challengeId
    ? CHALLENGES.find((challenge) => challenge.id === latestAttempt.challengeId) ?? null
    : null;
  const latestProofPath = latestAttempt && latestAttempt.status === "passed" && latestChallengeRecord
    ? await buildPublicProofPath({
        attempt: latestAttempt,
        challenge: latestChallengeRecord,
        runnerName: getPreferredRunnerName(metadata, {
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          emailAddress: user.primaryEmailAddress?.emailAddress,
        }),
      })
    : null;
  const runnerName = getPreferredRunnerName(metadata, {
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    emailAddress: user.primaryEmailAddress?.emailAddress,
  });
  const completedQuestPayloads = await Promise.all(completedChallenges.map(async (challenge) => {
    const latestPassed = getLatestPassedAttempt(metadata, challenge.id);
    const proofPath = latestPassed
      ? await buildPublicProofPath({ attempt: latestPassed, challenge, runnerName })
      : null;

    return {
      id: challenge.id,
      title: challenge.title,
      reward: challenge.reward,
      badgeName: challenge.badgeIdentity.name,
      completedAt: latestPassed?.completedGameAt ?? latestPassed?.checkedAt ?? null,
      href: new URL(`/challenges/${challenge.id}`, baseUrl).toString(),
      proofHref: proofPath ? new URL(proofPath, baseUrl).toString() : null,
      badgeImageUrl: challenge.badgeIdentity.image ? new URL(challenge.badgeIdentity.image, baseUrl).toString() : null,
      gameId: latestPassed?.gameId ?? null,
      provider: latestPassed?.provider ?? null,
      finalPositionFen: latestPassed?.finalPositionFen ?? null,
      lastMoveUci: latestPassed?.lastMoveUci ?? null,
      lastMoveSan: latestPassed?.lastMoveSan ?? null,
      playerColor: latestPassed?.playerColor ?? latestPassed?.failureDiagnostic?.playerColor ?? null,
    };
  }));
  completedQuestPayloads.push(...completedCustomQuests.map((quest) => {
    const latestPassed = getLatestPassedAttempt(metadata, quest.id);
    return {
      id: quest.id,
      title: quest.title,
      reward: 100,
      badgeName: "Custom Side Quest",
      completedAt: latestPassed?.completedGameAt ?? latestPassed?.checkedAt ?? null,
      href: new URL(`/challenges`, baseUrl).toString(),
      proofHref: null,
      badgeImageUrl: new URL("/badges/custom/clean/custom-coat-knight-gold.png", baseUrl).toString(),
      gameId: latestPassed?.gameId ?? null,
      provider: latestPassed?.provider ?? null,
      finalPositionFen: latestPassed?.finalPositionFen ?? null,
      lastMoveUci: latestPassed?.lastMoveUci ?? null,
      lastMoveSan: latestPassed?.lastMoveSan ?? null,
      playerColor: latestPassed?.playerColor ?? latestPassed?.failureDiagnostic?.playerColor ?? null,
    };
  }));
  const { relatedGroupQuests, publicGroupQuests } = await getMobileAccountGroupQuests(client, userId);
  const communitySideQuests = await listPublicCommunitySideQuests(client, userId, dedupeGroupQuests([...relatedGroupQuests, ...publicGroupQuests]));
  const activeCommunityCustomQuestRecord = activeChallenge?.id ? communitySideQuests.find((quest) => quest.id === activeChallenge.id) ?? null : null;
  const mobileActiveChallengeRecord = activeChallengeRecord ?? activeCommunityCustomQuestRecord;
  const completedCommunityQuests = communitySideQuests.filter((quest) => completedSet.has(quest.id) && !customQuestMap.has(quest.id));
  completedQuestPayloads.push(...completedCommunityQuests.map((quest) => {
    const latestPassed = getLatestPassedAttempt(metadata, quest.id);
    return {
      id: quest.id,
      title: quest.title,
      reward: 100,
      badgeName: "Community Side Quest",
      completedAt: latestPassed?.completedGameAt ?? latestPassed?.checkedAt ?? null,
      href: new URL(`/challenges`, baseUrl).toString(),
      proofHref: null,
      badgeImageUrl: quest.badgeImageUrl ? new URL(quest.badgeImageUrl, baseUrl).toString() : new URL("/badges/custom/clean/custom-coat-knight-gold.png", baseUrl).toString(),
      gameId: latestPassed?.gameId ?? null,
      provider: latestPassed?.provider ?? null,
      finalPositionFen: latestPassed?.finalPositionFen ?? null,
      lastMoveUci: latestPassed?.lastMoveUci ?? null,
      lastMoveSan: latestPassed?.lastMoveSan ?? null,
      playerColor: latestPassed?.playerColor ?? latestPassed?.failureDiagnostic?.playerColor ?? null,
    };
  }));
  const isOfficialGroupQuest = (quest: { id: string; official?: boolean | null }) => quest.official === true || quest.id.startsWith("official-");
  const officialGroupQuestIds = new Set(publicGroupQuests.filter(isOfficialGroupQuest).map((quest) => quest.id));
  const relatedUserGroupQuestPayloads = relatedGroupQuests
    .filter((quest) => !officialGroupQuestIds.has(quest.id) && !isOfficialGroupQuest(quest))
    .filter((quest) => quest.participants.some((participant) => participant.userId === userId))
    .map((quest) => {
      const isHost = quest.hostUserId === userId;
      const status = deriveGroupQuestStatus(quest.startAt, quest.endAt);
      const participant = quest.participants.find((entry) => entry.userId === userId);
      return {
        id: quest.id,
        title: quest.name,
        status,
        copy: [formatPlayersLabel(quest.participants.length), status === "Finished" ? "Final" : formatTimeLeftLabel(quest.endAt), getParticipantPositionLabel(quest, userId)].filter(Boolean).join(" · "),
        href: new URL(`/groupquests/${quest.id}${isHost ? "" : "?accepted=1"}`, baseUrl).toString(),
        playersLabel: formatPlayersLabel(quest.participants.length),
        timeLeftLabel: status === "Finished" ? "Final" : formatTimeLeftLabel(quest.endAt),
        positionLabel: getParticipantPositionLabel(quest, userId),
        joinState: "Joined" as const,
        pointsLabel: formatPointsLabel(participant?.score ?? 0),
        verifiedLabel: formatVerifiedLabel(participant?.completedQuestIds?.length ?? 0, quest.questIds.length),
        official: false,
        private: quest.inviteMode === "private-key",
        isOwner: isHost,
        hostName: quest.hostName,
        inviteMode: quest.inviteMode,
        inviteKey: isHost && quest.inviteMode === "private-key" ? quest.inviteKey ?? null : null,
        inviteCopy: quest.inviteCopy,
        providerMode: quest.providerMode,
        providerLabel: quest.providerLabel,
        startAt: quest.startAt,
        endAt: quest.endAt,
        rules: quest.rules,
        questIds: quest.questIds,
        questTitles: quest.questIds.map((questId) => getGroupQuestChallengeTitle(quest, questId)),
        customQuestSummaries: buildCustomQuestSummaries(quest),
        completedQuestTitles: (participant?.completedQuestIds ?? []).map((questId) => getGroupQuestChallengeTitle(quest, questId)),
        ruleRows: buildRuleRows(quest),
        leaderboardRows: buildLeaderboardRows(quest, userId),
      };
    });
  const activeGroupQuests = relatedUserGroupQuestPayloads.filter((quest) => quest.status !== "Finished");
  const closedGroupQuests = relatedUserGroupQuestPayloads.filter((quest) => quest.status === "Finished").slice(0, 12);
  const officialGroupQuestPayloads = publicGroupQuests
    .filter(isOfficialGroupQuest)
    .map((quest) => {
      const joined = quest.participants.some((participant) => participant.userId === userId);
      const participant = quest.participants.find((entry) => entry.userId === userId);
      const positionLabel = joined ? getParticipantPositionLabel(quest, userId) : null;
      const status = deriveGroupQuestStatus(quest.startAt, quest.endAt);
      return {
        id: quest.id,
        title: quest.name,
        status,
        copy: [formatPlayersLabel(quest.participants.length), status === "Finished" ? "Final" : formatTimeLeftLabel(quest.endAt), positionLabel].filter(Boolean).join(" · "),
        href: new URL(`/groupquests/${quest.id}${joined ? "?accepted=1" : ""}`, baseUrl).toString(),
        playersLabel: formatPlayersLabel(quest.participants.length),
        timeLeftLabel: status === "Finished" ? "Final" : formatTimeLeftLabel(quest.endAt),
        positionLabel: positionLabel ?? undefined,
        joinState: joined ? "Joined" as const : "Join" as const,
        pointsLabel: formatPointsLabel(participant?.score ?? 0),
        verifiedLabel: formatVerifiedLabel(participant?.completedQuestIds?.length ?? 0, quest.questIds.length),
        official: true,
        isOwner: quest.hostUserId === userId,
        hostName: quest.hostName,
        inviteMode: quest.inviteMode,
        inviteCopy: quest.inviteCopy,
        providerMode: quest.providerMode,
        providerLabel: quest.providerLabel,
        startAt: quest.startAt,
        endAt: quest.endAt,
        rules: quest.rules,
        questIds: quest.questIds,
        questTitles: quest.questIds.map((questId) => getGroupQuestChallengeTitle(quest, questId)),
        customQuestSummaries: buildCustomQuestSummaries(quest),
        completedQuestTitles: (participant?.completedQuestIds ?? []).map((questId) => getGroupQuestChallengeTitle(quest, questId)),
        ruleRows: buildRuleRows(quest),
        leaderboardRows: buildLeaderboardRows(quest, userId),
      };
    });
  const officialPublicGroupQuests = officialGroupQuestPayloads
    .filter((quest) => quest.status !== "Finished")
    .slice(0, 3);
  const previousOfficialGroupQuests = officialGroupQuestPayloads
    .filter((quest) => quest.status === "Finished")
    .slice(0, 3);
  const officialGroupQuestWeeks = buildOfficialGroupQuestWeeks(officialGroupQuestPayloads);
  const publicUserGroupQuestPayloads = publicGroupQuests
    .filter((quest) => !isOfficialGroupQuest(quest))
    .map((quest) => {
      const joined = quest.participants.some((participant) => participant.userId === userId);
      const participant = quest.participants.find((entry) => entry.userId === userId);
      const positionLabel = joined ? getParticipantPositionLabel(quest, userId) : null;
      return {
        id: quest.id,
        title: quest.name,
        status: deriveGroupQuestStatus(quest.startAt, quest.endAt),
        copy: [formatPlayersLabel(quest.participants.length), deriveGroupQuestStatus(quest.startAt, quest.endAt) === "Finished" ? "Final" : formatTimeLeftLabel(quest.endAt), positionLabel].filter(Boolean).join(" · "),
        href: new URL(`/groupquests/${quest.id}${joined ? "?accepted=1" : ""}`, baseUrl).toString(),
        playersLabel: formatPlayersLabel(quest.participants.length),
        timeLeftLabel: deriveGroupQuestStatus(quest.startAt, quest.endAt) === "Finished" ? "Final" : formatTimeLeftLabel(quest.endAt),
        positionLabel: positionLabel ?? undefined,
        joinState: joined ? "Joined" as const : "Join" as const,
        pointsLabel: formatPointsLabel(participant?.score ?? 0),
        verifiedLabel: formatVerifiedLabel(participant?.completedQuestIds?.length ?? 0, quest.questIds.length),
        official: false,
        private: quest.inviteMode === "private-key",
        isOwner: quest.hostUserId === userId,
        hostName: quest.hostName,
        inviteMode: quest.inviteMode,
        inviteKey: quest.hostUserId === userId && quest.inviteMode === "private-key" ? quest.inviteKey ?? null : null,
        inviteCopy: quest.inviteCopy,
        providerMode: quest.providerMode,
        providerLabel: quest.providerLabel,
        startAt: quest.startAt,
        endAt: quest.endAt,
        rules: quest.rules,
        questIds: quest.questIds,
        questTitles: quest.questIds.map((questId) => getGroupQuestChallengeTitle(quest, questId)),
        customQuestSummaries: buildCustomQuestSummaries(quest),
        completedQuestTitles: (participant?.completedQuestIds ?? []).map((questId) => getGroupQuestChallengeTitle(quest, questId)),
        ruleRows: buildRuleRows(quest),
        leaderboardRows: buildLeaderboardRows(quest, userId),
      };
    });
  const publicUserGroupQuests = publicUserGroupQuestPayloads.filter((quest) => quest.status !== "Finished");
  const closedPublicUserGroupQuests = publicUserGroupQuestPayloads.filter((quest) => quest.status === "Finished").slice(0, 12);
  const multiplayerTrophies = buildMobileMultiplayerTrophies({
    groupQuests: dedupeGroupQuests([...relatedGroupQuests, ...publicGroupQuests]),
    userId,
    baseUrl,
  });
  const customSideQuestsWithStats = customSideQuests.map((quest) => ({
    ...quest,
    stats: buildCustomQuestStats({
      questId: quest.id,
      attempts,
      completedSet,
      activeChallengeId: activeChallenge?.id ?? null,
      groupQuests: dedupeGroupQuests([...relatedGroupQuests, ...publicGroupQuests]),
    }),
  }));

  return NextResponse.json({
    apiVersion: 1,
    authenticated: true,
    generatedAt: new Date().toISOString(),
    profile: {
      displayName: runnerName || "SQC player",
      bio: getRunnerBio(metadata),
      imageUrl: user.imageUrl || null,
      email: user.primaryEmailAddress?.emailAddress ?? null,
      lastSignInAt: user.lastSignInAt ? new Date(user.lastSignInAt).toISOString() : null,
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
    customSideQuests: customSideQuestsWithStats,
    communitySideQuests,
    activeQuest: activeChallenge && mobileActiveChallengeRecord
      ? {
          id: mobileActiveChallengeRecord.id,
          title: mobileActiveChallengeRecord.title,
          status: activeChallenge.status ?? "accepted",
          startedAt: activeChallenge.startedAt ?? null,
          verifiedAt: activeChallenge.verifiedAt ?? null,
          completed: completedSet.has(mobileActiveChallengeRecord.id),
          banner: challengeBanner(activeChallenge),
          href: mobileActiveChallengeRecord.id.startsWith("custom-") ? new URL(`/challenges`, baseUrl).toString() : new URL(`/challenges/${mobileActiveChallengeRecord.id}`, baseUrl).toString(),
          proofHref: latestProofPath && latestAttempt?.challengeId === mobileActiveChallengeRecord.id ? new URL(latestProofPath, baseUrl).toString() : null,
          badgeImageUrl: "badgeImageUrl" in mobileActiveChallengeRecord && mobileActiveChallengeRecord.badgeImageUrl
            ? new URL(mobileActiveChallengeRecord.badgeImageUrl, baseUrl).toString()
            : "badgeIdentity" in mobileActiveChallengeRecord && mobileActiveChallengeRecord.badgeIdentity.image
              ? new URL(mobileActiveChallengeRecord.badgeIdentity.image, baseUrl).toString()
              : null,
        }
      : null,
    activeGroupQuests,
    closedGroupQuests,
    publicUserGroupQuests,
    closedPublicUserGroupQuests,
    officialPublicGroupQuests,
    previousOfficialGroupQuests,
    officialGroupQuestWeeks,
    multiplayerTrophies,
    completedQuests: completedQuestPayloads,
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
          proofHref: latestProofPath ? new URL(latestProofPath, baseUrl).toString() : null,
          proofImageUrl: latestProofPath ? new URL(`/api/og${latestProofPath}`, baseUrl).toString() : null,
          finalPositionFen: latestAttempt.finalPositionFen ?? null,
          lastMoveUci: latestAttempt.lastMoveUci ?? null,
          lastMoveSan: latestAttempt.lastMoveSan ?? null,
          playerColor: latestAttempt.playerColor ?? latestAttempt.failureDiagnostic?.playerColor ?? null,
          failureDiagnostic: latestAttempt.failureDiagnostic ?? null,
      }
      : null,
    supportMessages: getSupportMessages(user.privateMetadata).map((message) => ({
      id: message.id,
      at: message.at,
      message: message.message,
      source: message.source ?? "mobile",
    })),
  });
}

async function getMobileAccountUser(
  client: Awaited<ReturnType<typeof clerkClient>>,
  userId: string,
) {
  try {
    const user = await client.users.getUser(userId);
    return { ok: true as const, user };
  } catch (error) {
    const retryAfter = getRetryAfterSeconds(error);
    console.warn("mobile account user fetch unavailable", { retryAfter, reason: getClerkErrorReason(error) });
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          apiVersion: 1,
          authenticated: true,
          temporarilyUnavailable: true,
          message: "SQC could not refresh your account for a moment. Try again shortly.",
        },
        { status: 503, headers: retryAfter ? { "Retry-After": String(retryAfter) } : undefined },
      ),
    };
  }
}

async function listPublicCommunitySideQuests(
  client: Awaited<ReturnType<typeof clerkClient>>,
  currentUserId: string,
  groupQuests: ServerGroupQuest[],
) {
  try {
    const users = await client.users.getUserList({ limit: 100, orderBy: "-created_at" });
    const publicQuestRecords = users.data.flatMap((user) => {
      const privateMetadata = user.privateMetadata && typeof user.privateMetadata === "object" ? (user.privateMetadata as UserMetadataRecord) : {};
      const publicMetadata = user.publicMetadata && typeof user.publicMetadata === "object" ? (user.publicMetadata as UserMetadataRecord) : {};
      const quests = getCustomSideQuests(privateMetadata).length ? getCustomSideQuests(privateMetadata) : getCustomSideQuests(publicMetadata);
      const creatorName = getPreferredRunnerName(publicMetadata, {
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        emailAddress: user.primaryEmailAddress?.emailAddress,
      });
      return quests
        .filter((quest) => quest.lifecycle === "published" && quest.visibility === "public")
        .map((quest) => ({ quest, userId: user.id, creatorName: creatorName || "SQC player" }));
    });

    const seen = new Set<string>();
    return publicQuestRecords
      .filter(({ quest }) => {
        if (seen.has(quest.id)) return false;
        seen.add(quest.id);
        return true;
      })
      .map(({ quest, userId: ownerUserId, creatorName }) => {
        const allAttempts = users.data.flatMap((user) => {
          const metadata = user.publicMetadata && typeof user.publicMetadata === "object" ? (user.publicMetadata as UserMetadataRecord) : {};
          return getChallengeAttempts(metadata, quest.id);
        });
        const completions = users.data.filter((user) => {
          const metadata = user.publicMetadata && typeof user.publicMetadata === "object" ? (user.publicMetadata as UserMetadataRecord) : {};
          return new Set(getChallengeProgress(metadata).completedChallengeIds).has(quest.id);
        }).length;
        const activeSelections = users.data.filter((user) => {
          const metadata = user.publicMetadata && typeof user.publicMetadata === "object" ? (user.publicMetadata as UserMetadataRecord) : {};
          return getActiveChallenge(metadata)?.id === quest.id;
        }).length;
        const lineups = groupQuests.filter((groupQuest) => groupQuest.questIds.includes(quest.id));
        return {
          ...quest,
          creatorName,
          ownedByYou: ownerUserId === currentUserId,
          stats: {
            soloAttempts: allAttempts.length,
            soloSelections: activeSelections,
            soloCompletions: completions,
            multiplayerLineups: lineups.length,
            multiplayerAttempts: lineups.reduce((total, groupQuest) => total + groupQuest.participants.length, 0),
            multiplayerFulfillments: lineups.reduce((total, groupQuest) => total + groupQuest.participants.filter((participant) => participant.completedQuestIds?.includes(quest.id)).length, 0),
          },
        };
      })
      .sort((a, b) => {
        const popularityA = (a.stats?.soloSelections ?? 0) + (a.stats?.soloCompletions ?? 0) * 3 + (a.stats?.multiplayerLineups ?? 0) * 2 + (a.stats?.multiplayerFulfillments ?? 0) * 4;
        const popularityB = (b.stats?.soloSelections ?? 0) + (b.stats?.soloCompletions ?? 0) * 3 + (b.stats?.multiplayerLineups ?? 0) * 2 + (b.stats?.multiplayerFulfillments ?? 0) * 4;
        if (popularityA !== popularityB) return popularityB - popularityA;
        return Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
      })
      .slice(0, 80);
  } catch (error) {
    console.warn("mobile community Side Quest catalog unavailable", { reason: getClerkErrorReason(error) });
    return [];
  }
}

async function getMobileAccountGroupQuests(
  client: Awaited<ReturnType<typeof clerkClient>>,
  userId: string,
) {
  try {
    const [relatedGroupQuests, publicGroupQuests] = await Promise.all([
      listUserRelatedGroupQuests(client, userId),
      listPublicGroupQuests(client),
    ]);
    return { relatedGroupQuests, publicGroupQuests };
  } catch (error) {
    console.warn("mobile account group quest fetch unavailable", { reason: getClerkErrorReason(error) });
    return { relatedGroupQuests: [] as ServerGroupQuest[], publicGroupQuests: [] as ServerGroupQuest[] };
  }
}

function getRetryAfterSeconds(error: unknown) {
  if (!error || typeof error !== "object") return null;
  const retryAfter = (error as { retryAfter?: unknown }).retryAfter;
  if (typeof retryAfter === "number" && Number.isFinite(retryAfter)) return Math.max(1, Math.round(retryAfter));
  if (typeof retryAfter === "string") {
    const parsed = Number.parseInt(retryAfter, 10);
    if (Number.isFinite(parsed)) return Math.max(1, parsed);
  }
  return null;
}

function getClerkErrorReason(error: unknown) {
  if (!error || typeof error !== "object") return "unknown";
  const fields = error as { code?: unknown; status?: unknown; clerkTraceId?: unknown; message?: unknown };
  return {
    code: typeof fields.code === "string" ? fields.code : undefined,
    status: typeof fields.status === "number" ? fields.status : undefined,
    clerkTraceId: typeof fields.clerkTraceId === "string" ? fields.clerkTraceId : undefined,
    message: typeof fields.message === "string" ? fields.message : undefined,
  };
}

function buildOfficialGroupQuestWeeks<T extends { id: string; startAt?: string; endAt?: string }>(quests: T[]) {
  const finished = quests.filter((quest) => deriveGroupQuestStatus(quest.startAt ?? "", quest.endAt ?? "") === "Finished");
  const weekMap = new Map<string, { id: string; label: string; rangeLabel: string; quests: T[] }>();

  finished.forEach((quest) => {
    const date = new Date(quest.endAt ?? quest.startAt ?? Date.now());
    const weekStart = new Date(date);
    const day = weekStart.getUTCDay() || 7;
    weekStart.setUTCDate(weekStart.getUTCDate() - day + 1);
    weekStart.setUTCHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
    const id = weekStart.toISOString().slice(0, 10);
    const label = `Week of ${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    const rangeLabel = `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}–${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    const existing = weekMap.get(id) ?? { id, label, rangeLabel, quests: [] };
    existing.quests.push(quest);
    weekMap.set(id, existing);
  });

  return Array.from(weekMap.values()).sort((a, b) => b.id.localeCompare(a.id));
}

function formatPlayersLabel(count: number) {
  return `${count} player${count === 1 ? "" : "s"}`;
}

function formatPointsLabel(score: number) {
  return `${score.toLocaleString("en-US")} pts`;
}

function formatVerifiedLabel(completedCount: number, totalCount: number) {
  return `${completedCount} / ${Math.max(totalCount, 1)}`;
}

function formatTimeLeftLabel(endAt: string) {
  const end = Date.parse(endAt);
  if (!Number.isFinite(end)) return "Time TBA";
  const remainingMs = end - Date.now();
  if (remainingMs <= 0) return "Ended";
  const minutes = Math.ceil(remainingMs / 60000);
  if (minutes < 60) return `${minutes}m left`;
  const hours = Math.ceil(minutes / 60);
  if (hours < 48) return `${hours}h left`;
  return `${Math.ceil(hours / 24)}d left`;
}

function getParticipantPositionLabel(quest: { participants: Array<{ userId: string; score?: number }> }, userId: string) {
  const ranked = [...quest.participants].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const index = ranked.findIndex((participant) => participant.userId === userId);
  return index >= 0 ? `#${index + 1}` : null;
}

function deriveGroupQuestStatus(startAt: string, endAt: string) {
  const now = Date.now();
  const start = Date.parse(startAt);
  const end = Date.parse(endAt);
  if (Number.isFinite(start) && start > now) return "Soon";
  if (Number.isFinite(end) && end < now) return "Finished";
  return "Live";
}

function getGroupQuestChallengeTitle(quest: Pick<ServerGroupQuest, "customQuestSnapshots">, challengeId: string) {
  return CHALLENGES.find((challenge) => challenge.id === challengeId)?.title
    ?? quest.customQuestSnapshots?.find((snapshot) => snapshot.id === challengeId)?.title
    ?? challengeId;
}

function buildCustomQuestSummaries(quest: Pick<ServerGroupQuest, "customQuestSnapshots">) {
  return quest.customQuestSnapshots?.map((snapshot) => ({
    id: snapshot.id,
    title: snapshot.title,
    summary: snapshot.summary,
    badgeImageUrl: snapshot.badgeImageUrl ?? null,
    reward: snapshot.reward ?? 100,
  })) ?? [];
}

function buildRuleRows(quest: { providerLabel: string; rules: Record<string, string> }) {
  return [
    { label: "Games allowed", value: quest.providerLabel },
    { label: "Time control", value: quest.rules.timeControl ?? "Any time control" },
    { label: "Rated", value: quest.rules.rated ?? "Any rated state" },
    { label: "Color", value: quest.rules.color ?? "Any color" },
    ...(quest.rules.customRuleSummary ? [{ label: "Custom rule", value: quest.rules.customRuleSummary }] : []),
  ];
}

function buildLeaderboardRows(
  quest: { participants: Array<{ userId: string; username: string; provider: string; score?: number; completedQuestIds?: string[]; leaderboardName: string; lastProofSummary?: string; lastProofAt?: string }> ; questIds: string[] },
  userId: string,
) {
  const totalCount = Math.max(quest.questIds.length, 1);
  return [...quest.participants]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .map((participant, index) => ({
      userId: participant.userId,
      rank: `#${index + 1}`,
      name: participant.leaderboardName,
      provider: `${participant.provider === "chesscom" ? "chess.com" : "lichess"} · ${participant.username}`,
      points: formatPointsLabel(participant.score ?? 0),
      verified: `${participant.completedQuestIds?.length ?? 0}/${totalCount} verified`,
      note: formatLeaderboardNote(participant, userId),
      lastProofSummary: participant.lastProofSummary ?? undefined,
      lastProofAt: participant.lastProofAt ?? undefined,
      removable: participant.userId !== userId,
    }));
}

function formatLeaderboardNote(
  participant: { userId: string; lastProofSummary?: string; lastProofAt?: string },
  userId: string,
) {
  const summary = participant.lastProofSummary?.trim();
  const selfPrefix = participant.userId === userId ? "You" : "";
  if (!summary) return selfPrefix;

  const proofDate = participant.lastProofAt ? formatShortDateTime(participant.lastProofAt) : "";
  const proofLabel = proofDate ? `Latest proof ${proofDate}` : "Latest proof";
  return [selfPrefix, `${proofLabel}: ${summary}`].filter(Boolean).join(" · ");
}

function formatShortDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function dedupeGroupQuests(groupQuests: ServerGroupQuest[]) {
  const byId = new Map<string, ServerGroupQuest>();
  for (const quest of groupQuests) byId.set(quest.id, quest);
  return [...byId.values()];
}

function buildMobileMultiplayerTrophies({ groupQuests, userId, baseUrl }: { groupQuests: ServerGroupQuest[]; userId: string; baseUrl: string }) {
  return groupQuests
    .filter((quest) => deriveGroupQuestStatus(quest.startAt, quest.endAt) === "Finished")
    .map((quest) => {
      const ranked = [...quest.participants].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
      const index = ranked.findIndex((participant) => participant.userId === userId);
      const participant = index >= 0 ? ranked[index] : null;
      if (!participant || index > 2 || (participant.score ?? 0) <= 0) return null;
      const placement = index === 0 ? "Gold" : index === 1 ? "Silver" : "Bronze";
      const finishedAtValues = Object.values(participant.questFinishedAt ?? {}).filter(Boolean);
      return {
        id: `${quest.id}-${placement.toLowerCase()}`,
        title: quest.name,
        placement,
        rankLabel: `${index + 1}${index === 0 ? "st" : index === 1 ? "nd" : "rd"} place`,
        completedAt: participant.lastProofAt ?? finishedAtValues.at(-1) ?? quest.endAt,
        href: new URL(`/groupquests/${quest.id}?accepted=1`, baseUrl).toString(),
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .slice(0, 12);
}

function buildCustomQuestStats({
  questId,
  attempts,
  completedSet,
  activeChallengeId,
  groupQuests,
}: {
  questId: string;
  attempts: ChallengeAttempt[];
  completedSet: Set<string>;
  activeChallengeId: string | null;
  groupQuests: ServerGroupQuest[];
}) {
  const soloAttempts = attempts.filter((attempt) => (attempt.challengeId ?? attempt.id?.split(":")[0]) === questId).length;
  const lineups = groupQuests.filter((quest) => quest.questIds.includes(questId));
  return {
    soloAttempts,
    soloSelections: activeChallengeId === questId ? 1 : 0,
    soloCompletions: completedSet.has(questId) ? 1 : 0,
    multiplayerLineups: lineups.length,
    multiplayerAttempts: lineups.reduce((total, quest) => total + quest.participants.length, 0),
    multiplayerFulfillments: lineups.reduce((total, quest) => total + quest.participants.filter((participant) => participant.completedQuestIds?.includes(questId)).length, 0),
  };
}

function getLatestAttemptForChallenge(metadata: UserMetadataRecord, challengeId?: string) {
  if (!challengeId) return null;
  return getChallengeAttempts(metadata, challengeId).at(-1) ?? null;
}

function normalizeCurrentVerifierAttempt(
  latestAttempt: ReturnType<typeof getLatestAttemptForChallenge>,
  latestPassedAttempt: ReturnType<typeof getLatestPassedAttempt>,
  activeChallengeId?: string,
  activeChallengeStartedAt?: string,
) {
  if (latestPassedAttempt) {
    return latestPassedAttempt;
  }

  if (!latestAttempt) {
    return null;
  }

  if (activeChallengeId && latestAttempt.challengeId === activeChallengeId && latestAttempt.status !== "passed" && !isAttemptAfterActivation(latestAttempt, activeChallengeStartedAt)) {
    return buildAwaitingFreshGameAttempt(latestAttempt);
  }

  return latestAttempt;
}

function buildAwaitingFreshGameAttempt(attempt: NonNullable<ReturnType<typeof getLatestAttemptForChallenge>>): ChallengeAttempt {
  return {
    id: attempt.id,
    challengeId: attempt.challengeId,
    gameId: attempt.gameId,
    provider: attempt.provider,
    status: "pending",
    summary: "No new eligible games were found since this quest was started. Play a new public game after starting the quest, then check again.",
    checkedAt: attempt.checkedAt,
    startedGameAt: attempt.startedGameAt,
    completedGameAt: attempt.completedGameAt,
  };
}

function getLatestPassedAttempt(metadata: UserMetadataRecord, challengeId: string, activeChallengeStartedAt?: string) {
  return getChallengeAttempts(metadata, challengeId)
    .filter((attempt) => attempt.status === "passed")
    .filter((attempt) => isAttemptAfterActivation(attempt, activeChallengeStartedAt))
    .at(-1) ?? null;
}

function isAttemptAfterActivation(attempt: { startedGameAt?: string; completedGameAt?: string } | null | undefined, activeChallengeStartedAt?: string) {
  if (!activeChallengeStartedAt) return true;
  const raw = attempt?.startedGameAt ?? attempt?.completedGameAt;
  if (!raw) return false;
  const gameAt = Date.parse(raw);
  const activatedAt = Date.parse(activeChallengeStartedAt);
  return Number.isFinite(gameAt) && Number.isFinite(activatedAt) && gameAt > activatedAt;
}
