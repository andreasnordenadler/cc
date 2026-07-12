import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { compactAnalyticsStore, getAnalyticsStore } from "@/lib/analytics";
import { getChallengeById } from "@/lib/challenges";
import { checkLatestGroupQuestChallenge } from "@/lib/groupquest-proof";
import { applyGroupQuestProofResults } from "@/lib/groupquest-proof-progress";
import { buildGroupQuestRefreshChecks } from "@/lib/groupquest-refresh-contract";
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

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    return NextResponse.json({ ok: false, error: "sign_in_required" }, { status: 401 });
  }

  const client = await clerkClient();
  const found = await findGroupQuestById(client, id);
  if (!found) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const participant = found.groupQuest.participants.find((entry) => entry.userId === userId);
  if (!participant) {
    return NextResponse.json({ ok: false, error: "not_joined" }, { status: 403 });
  }
  if (isGroupQuestFinished(found.groupQuest)) {
    return NextResponse.json({ ok: false, error: "finished" }, { status: 400 });
  }

  const customSnapshotsById = new Map((found.groupQuest.customQuestSnapshots ?? []).map((snapshot) => [snapshot.id, snapshot]));

  const checks = await Promise.all(
    found.groupQuest.questIds.map(async (questId) => ({
      questId,
      challenge: getChallengeById(questId),
      result: await checkLatestGroupQuestChallenge({
        challengeId: questId,
        provider: participant.provider,
        username: participant.username,
        startAt: found.groupQuest.startAt,
        endAt: found.groupQuest.endAt,
        rules: found.groupQuest.rules,
        customQuest: customSnapshotsById.get(questId) ?? null,
      }),
    })),
  );

  const progress = await applyGroupQuestProofResults({
    participant,
    checks: checks.map((entry) => ({
      ...entry,
      reward: getChallengeById(entry.questId)?.reward ?? customSnapshotsById.get(entry.questId)?.reward ?? 0,
    })),
    mutate: async (nextProgress) => {
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
      await mergeWebMultiplayerCompletions(client, userId, participantUser.publicMetadata, participant, checks);
    },
  });
  const completedQuestIds = progress.completedQuestIds;
  const score = progress.score;

  return NextResponse.json({
    ok: true,
    completedQuestIds,
    score,
    checks: buildGroupQuestRefreshChecks(checks),
  });
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
