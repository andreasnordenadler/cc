import { auth, clerkClient } from "@clerk/nextjs/server";
import { compactAnalyticsStore, getAnalyticsStore } from "@/lib/analytics";
import { getChallengeById } from "@/lib/challenges";
import { checkLatestGroupQuestChallenge } from "@/lib/groupquest-proof";
import { createGroupQuestRefreshRouteHandler } from "@/lib/groupquest-refresh-route-handler";
import {
  findGroupQuestById,
  isBuiltInOfficialGroupQuestHost,
  isGroupQuestFinished,
  updateParticipantProgress,
  upsertHostGroupQuest,
  upsertParticipantGroupQuest,
} from "@/lib/groupquests";
import {
  buildChallengeProgressRecord,
  compactChallengeAttempts,
  getChallengeAttempts,
  getChallengeProgress,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

type WebRefreshRouteDependencies = {
  authenticate: () => Promise<string | null>;
  getClient: () => ReturnType<typeof clerkClient>;
  findQuest: typeof findGroupQuestById;
  check: typeof checkLatestGroupQuestChallenge;
};

let testDependencies: WebRefreshRouteDependencies | null = null;

export function setWebRefreshRouteTestDependencies(dependencies: WebRefreshRouteDependencies | null) {
  if (process.env.NODE_ENV !== "test") throw new Error("Refresh route dependency overrides are test-only.");
  testDependencies = dependencies;
}

function createWebRefreshRouteDependencies(): WebRefreshRouteDependencies {
  return {
    authenticate: async () => (await auth()).userId,
    getClient: clerkClient,
    findQuest: findGroupQuestById,
    check: checkLatestGroupQuestChallenge,
  };
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dependencies = testDependencies ?? createWebRefreshRouteDependencies();
  let client: Awaited<ReturnType<typeof clerkClient>>;
  let found: Awaited<ReturnType<typeof findGroupQuestById>>;
  const handler = createGroupQuestRefreshRouteHandler({
    mode: "web",
    authenticate: dependencies.authenticate,
    findQuest: async (questId) => {
      client = await dependencies.getClient();
      found = await dependencies.findQuest(client, questId);
      return found?.groupQuest ?? null;
    },
    isFinished: (quest) => isGroupQuestFinished({ endAt: quest.endAt ?? "" }),
    reward: (questId) => getChallengeById(questId)?.reward ?? found?.groupQuest.customQuestSnapshots?.find((snapshot) => snapshot.id === questId)?.reward ?? 0,
    check: async ({ questId, quest, participant }) => dependencies.check({
        challengeId: questId,
        provider: participant.provider,
        username: participant.username,
        startAt: quest.startAt,
        endAt: quest.endAt,
        rules: quest.rules,
        customQuest: found?.groupQuest.customQuestSnapshots?.find((snapshot) => snapshot.id === questId) ?? null,
      }),
    persist: async ({ userId, progress: nextProgress, newlyPassedQuestIds, checks }) => {
      if (!found) throw new Error("Group quest disappeared during refresh.");
      const participant = found.groupQuest.participants.find((entry) => entry.userId === userId)!;
      const lastCheck = checks[checks.length - 1]?.result;
      const refreshedQuest = updateParticipantProgress(found.groupQuest, userId, {
        ...nextProgress,
        lastProofSummary: lastCheck?.summary,
        lastProofAt: new Date().toISOString(),
      });
      const storeOnParticipant = isBuiltInOfficialGroupQuestHost(found.userId);
      const storageUserId = storeOnParticipant ? userId : found.userId;
      const storageUser = await client.users.getUser(storageUserId);
      await client.users.updateUserMetadata(storageUserId, {
        privateMetadata: {
          ...(storageUser.privateMetadata ?? {}),
          sqcAnalytics: compactAnalyticsStore(getAnalyticsStore(storageUser.privateMetadata)),
          sqcGroupQuests: storeOnParticipant
            ? upsertParticipantGroupQuest(storageUser.privateMetadata, refreshedQuest, userId)
            : upsertHostGroupQuest(storageUser.privateMetadata, refreshedQuest),
        },
      });
      const participantUser = await client.users.getUser(userId);
      await mergeWebMultiplayerCompletions(client, userId, participantUser.publicMetadata, participant, checks.filter((check) => newlyPassedQuestIds.includes(check.questId)));
    },
  });
  return handler(request, id);
}

async function mergeWebMultiplayerCompletions(
  client: Awaited<ReturnType<typeof clerkClient>>,
  userId: string,
  metadata: UserMetadataRecord,
  participant: { provider: "lichess" | "chesscom"; username: string },
  checks: Array<{ questId: string; result: Awaited<ReturnType<typeof checkLatestGroupQuestChallenge>> }>,
) {
  const passedChecks = checks.filter((entry) => entry.result.status === "passed");
  if (!passedChecks.length) return;

  const progress = getChallengeProgress(metadata);
  const completedChallengeIds = Array.from(new Set([...progress.completedChallengeIds, ...passedChecks.map((entry) => entry.questId)]));
  const existingAttempts = getChallengeAttempts(metadata);
  const now = new Date().toISOString();
  const newAttempts = passedChecks.map((entry) => ({
    id: `${entry.questId}:multiplayer:${participant.provider}:${entry.result.gameId}:${now}`,
    challengeId: entry.questId,
    gameId: entry.result.gameId,
    provider: participant.provider === "chesscom" ? "chess.com" as const : "lichess" as const,
    status: "passed",
    summary: `Multiplayer proof verified: ${entry.result.summary}`,
    checkedAt: now,
    completedGameAt: entry.result.gameTime,
    finalPositionFen: entry.result.finalPositionFen,
    lastMoveUci: entry.result.lastMoveUci,
    lastMoveSan: entry.result.lastMoveSan,
  }));

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...metadata,
      challengeProgress: buildChallengeProgressRecord(completedChallengeIds),
      challengeAttempts: compactChallengeAttempts([...existingAttempts, ...newAttempts]),
    },
  });
}
