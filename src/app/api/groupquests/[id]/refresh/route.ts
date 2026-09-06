import { auth, clerkClient } from "@clerk/nextjs/server";
import { AsyncLocalStorage } from "node:async_hooks";
import { compactAnalyticsStore, getAnalyticsStore } from "@/lib/analytics";
import { getChallengeById } from "@/lib/challenges";
import { checkLatestGroupQuestChallenge } from "@/lib/groupquest-proof";
import { createGroupQuestRefreshRouteHandler } from "@/lib/groupquest-refresh-route-handler";
import {
  buildMultiplayerCompletionAccountPatch,
  buildPendingGroupQuestCompletions,
} from "@/lib/groupquest-completion-reconciliation";
import {
  findGroupQuestById,
  isBuiltInOfficialGroupQuestHost,
  isGroupQuestFinished,
  persistOfficialGroupQuestCompletions,
  updateParticipantProgress,
  upsertHostGroupQuest,
} from "@/lib/groupquests";


type WebRefreshRouteDependencies = {
  authenticate: () => Promise<string | null>;
  getClient: () => ReturnType<typeof clerkClient>;
  findQuest: typeof findGroupQuestById;
  check: typeof checkLatestGroupQuestChallenge;
};

const testDependencies = new AsyncLocalStorage<WebRefreshRouteDependencies>();

export function withWebRefreshRouteTestDependencies<Result>(dependencies: WebRefreshRouteDependencies, callback: () => Result): Result {
  if (process.env.NODE_ENV !== "test") throw new Error("Refresh route dependency overrides are test-only.");
  return testDependencies.run(dependencies, callback);
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
  const dependencies = process.env.NODE_ENV === "test"
    ? testDependencies.getStore() ?? createWebRefreshRouteDependencies()
    : createWebRefreshRouteDependencies();
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
      const pendingCompletions = buildPendingGroupQuestCompletions({
        groupQuestId: found.groupQuest.id,
        provider: participant.provider,
        existing: participant.pendingCompletions ?? [],
        newlyPassedQuestIds,
        checks,
      });
      const refreshedQuest = updateParticipantProgress(found.groupQuest, userId, {
        ...nextProgress,
        pendingCompletions,
        ...(lastCheck ? { lastProofSummary: lastCheck.summary, lastProofAt: new Date().toISOString() } : {}),
      });
      if (isBuiltInOfficialGroupQuestHost(found.userId)) {
        await persistOfficialGroupQuestCompletions(
          client, refreshedQuest, userId, Boolean(newlyPassedQuestIds.length),
        );
        return;
      }
      const storageUserId = found.userId;
      const saveProgress = async (quest: typeof refreshedQuest) => {
        const storageUser = await client.users.getUser(storageUserId);
        await client.users.updateUserMetadata(storageUserId, {
          privateMetadata: {
            ...(storageUser.privateMetadata ?? {}),
            sqcAnalytics: compactAnalyticsStore(getAnalyticsStore(storageUser.privateMetadata)),
            sqcGroupQuests: upsertHostGroupQuest(storageUser.privateMetadata, quest),
          },
        });
      };

      await saveProgress(refreshedQuest);
      const participantUser = await client.users.getUser(userId);
      await client.users.updateUserMetadata(userId, {
        publicMetadata: buildMultiplayerCompletionAccountPatch(participantUser.publicMetadata, pendingCompletions),
      });
      await saveProgress(updateParticipantProgress(refreshedQuest, userId, { pendingCompletions: [] }));
    },
  });
  return handler(request, id);
}
