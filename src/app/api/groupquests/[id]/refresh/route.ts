import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { compactAnalyticsStore, getAnalyticsStore } from "@/lib/analytics";
import { getChallengeById } from "@/lib/challenges";
import { checkLatestGroupQuestChallenge } from "@/lib/groupquest-proof";
import { findGroupQuestById, updateParticipantProgress, upsertHostGroupQuest } from "@/lib/groupquests";

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
      }),
    })),
  );

  const completedQuestIds = checks.filter((entry) => entry.result.status === "passed").map((entry) => entry.questId);
  const questFinishedAt = Object.fromEntries(
    checks
      .filter((entry) => entry.result.status === "passed")
      .map((entry) => [entry.questId, entry.result.gameTime ?? new Date().toISOString()]),
  );
  const score = completedQuestIds.reduce((sum, questId) => sum + (getChallengeById(questId)?.reward ?? 0), 0);
  const lastCheck = checks[checks.length - 1]?.result;

  const refreshedQuest = updateParticipantProgress(found.groupQuest, userId, {
    completedQuestIds,
    questFinishedAt,
    score,
    lastProofSummary: lastCheck?.summary,
    lastProofAt: new Date().toISOString(),
  });

  const host = await client.users.getUser(found.userId);
  await client.users.updateUserMetadata(found.userId, {
    privateMetadata: {
      ...(host.privateMetadata ?? {}),
      sqcAnalytics: compactAnalyticsStore(getAnalyticsStore(host.privateMetadata)),
      sqcGroupQuests: upsertHostGroupQuest(host.privateMetadata, refreshedQuest),
    },
  });

  return NextResponse.json({
    ok: true,
    completedQuestIds,
    score,
    checks: checks.map((entry) => ({
      questId: entry.questId,
      status: entry.result.status,
      summary: entry.result.summary,
      gameId: entry.result.gameId,
    })),
  });
}
