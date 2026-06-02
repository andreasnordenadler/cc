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
  type ChallengeAttempt,
  type UserMetadataRecord,
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
  const user = await client.users.getUser(userId);
  const baseUrl = new URL(request.url).origin;
  const metadata = user.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
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
      badgeImageUrl: new URL("/badges/custom/custom-side-quest-crest.png", baseUrl).toString(),
      gameId: latestPassed?.gameId ?? null,
      provider: latestPassed?.provider ?? null,
      finalPositionFen: latestPassed?.finalPositionFen ?? null,
      lastMoveUci: latestPassed?.lastMoveUci ?? null,
      lastMoveSan: latestPassed?.lastMoveSan ?? null,
    };
  }));
  const relatedGroupQuests = await listUserRelatedGroupQuests(client, userId);
  const publicGroupQuests = await listPublicGroupQuests(client);
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
    activeQuest: activeChallenge && activeChallengeRecord
      ? {
          id: activeChallengeRecord.id,
          title: activeChallengeRecord.title,
          status: activeChallenge.status ?? "accepted",
          startedAt: activeChallenge.startedAt ?? null,
          verifiedAt: activeChallenge.verifiedAt ?? null,
          completed: completedSet.has(activeChallengeRecord.id),
          banner: challengeBanner(activeChallenge),
          href: activeChallengeRecord.id.startsWith("custom-") ? new URL(`/challenges`, baseUrl).toString() : new URL(`/challenges/${activeChallengeRecord.id}`, baseUrl).toString(),
          proofHref: latestProofPath && latestAttempt?.challengeId === activeChallengeRecord.id ? new URL(latestProofPath, baseUrl).toString() : null,
          badgeImageUrl: "badgeImageUrl" in activeChallengeRecord && activeChallengeRecord.badgeImageUrl
            ? new URL(activeChallengeRecord.badgeImageUrl, baseUrl).toString()
            : "badgeIdentity" in activeChallengeRecord && activeChallengeRecord.badgeIdentity.image
              ? new URL(activeChallengeRecord.badgeIdentity.image, baseUrl).toString()
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
  quest: { participants: Array<{ userId: string; username: string; provider: string; score?: number; completedQuestIds?: string[]; leaderboardName: string }> ; questIds: string[] },
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
      note: participant.userId === userId ? "You" : "",
      removable: participant.userId !== userId,
    }));
}

function dedupeGroupQuests(groupQuests: ServerGroupQuest[]) {
  const byId = new Map<string, ServerGroupQuest>();
  for (const quest of groupQuests) byId.set(quest.id, quest);
  return [...byId.values()];
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
