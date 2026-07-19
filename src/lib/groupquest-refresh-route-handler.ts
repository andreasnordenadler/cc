import { applyGroupQuestProofResults, type GroupQuestProofProgress } from "@/lib/groupquest-proof-progress";
import { buildGroupQuestRefreshChecks } from "@/lib/groupquest-refresh-contract";
import type { GroupQuestCheckResult } from "@/lib/groupquest-proof";

type Participant = Partial<GroupQuestProofProgress> & {
  userId: string;
  provider: "lichess" | "chesscom";
  username: string;
};

type RefreshQuest = {
  id: string;
  questIds: string[];
  startAt?: string;
  endAt?: string;
  rules?: Record<string, string>;
  participants: Participant[];
};

type RefreshCheck = { questId: string; result: GroupQuestCheckResult };

export function createGroupQuestRefreshRouteHandler(dependencies: {
  mode: "web" | "mobile";
  authenticate: (request: Request) => Promise<string | null>;
  findQuest: (id: string) => Promise<RefreshQuest | null>;
  isFinished: (quest: RefreshQuest) => boolean;
  reward: (questId: string) => number;
  check: (input: { questId: string; quest: RefreshQuest; participant: Participant }) => Promise<GroupQuestCheckResult>;
  persist: (input: { userId: string; progress: GroupQuestProofProgress; newlyPassedQuestIds: string[]; checks: RefreshCheck[] }) => Promise<void>;
}) {
  return async function handleGroupQuestRefresh(request: Request, id: string): Promise<Response> {
    const userId = await dependencies.authenticate(request);
    if (!userId) return json(dependencies.mode === "mobile"
      ? { apiVersion: 1, authenticated: false, ok: false, message: "Sign in to manage Multiplayer Side Quests." }
      : { ok: false, error: "sign_in_required" }, 401);
    const quest = await dependencies.findQuest(id);
    if (!quest) return json(dependencies.mode === "mobile"
      ? { apiVersion: 1, authenticated: true, ok: false, message: "Multiplayer Side Quest not found." }
      : { ok: false, error: "not_found" }, 404);
    const participant = quest.participants.find((entry) => entry.userId === userId);
    if (!participant) return json(dependencies.mode === "mobile"
      ? { apiVersion: 1, authenticated: true, ok: false, message: "Join this Multiplayer Side Quest before refreshing proof." }
      : { ok: false, error: "not_joined" }, 403);
    if (dependencies.isFinished(quest)) return json(dependencies.mode === "mobile"
      ? { apiVersion: 1, authenticated: true, ok: false, message: "This Multiplayer Side Quest has ended." }
      : { ok: false, error: "finished" }, 400);

    const uniqueQuestIds = Array.from(new Set(quest.questIds));
    const checks = await Promise.all(uniqueQuestIds.map(async (questId) => ({
      questId,
      result: await dependencies.check({ questId, quest, participant }),
    })));
    const progress = await applyGroupQuestProofResults({
      participant,
      checks: checks.map((entry) => ({ ...entry, reward: dependencies.reward(entry.questId) })),
      mutate: async (nextProgress, { newlyPassedQuestIds }) => dependencies.persist({
        userId,
        progress: nextProgress,
        newlyPassedQuestIds,
        checks,
      }),
    });
    const body = {
      ok: true,
      ...(dependencies.mode === "mobile" ? { apiVersion: 1, authenticated: true, action: "refresh", groupQuestId: quest.id } : {}),
      completedQuestIds: progress.completedQuestIds,
      newlyPassedQuestIds: progress.newlyPassedQuestIds,
      score: progress.score,
      checks: buildGroupQuestRefreshChecks(checks),
      ...(dependencies.mode === "mobile" ? { message: `${progress.completedQuestIds.length} of ${uniqueQuestIds.length} Multiplayer Side Quest checks verified.` } : {}),
    };
    return json(body, 200);
  };
}

function json(body: unknown, status: number) {
  return Response.json(body, { status });
}
