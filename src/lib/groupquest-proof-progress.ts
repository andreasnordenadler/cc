export type GroupQuestProofProgress = {
  completedQuestIds: string[];
  questFinishedAt: Record<string, string>;
  score: number;
};

export async function applyGroupQuestProofResults(input: {
  participant: Partial<GroupQuestProofProgress>;
  checks: Array<{
    questId: string;
    reward: number;
    result: { status: "passed" | "failed" | "pending"; gameTime?: string };
  }>;
  mutate: (progress: GroupQuestProofProgress, mutation: { newlyPassedQuestIds: string[] }) => Promise<void>;
}): Promise<GroupQuestProofProgress & { mutated: boolean; newlyPassedQuestIds: string[] }> {
  const existingIds = input.participant.completedQuestIds ?? [];
  const existing = new Set(existingIds);
  const newlyPassedIds = new Set<string>();
  const newlyPassed = input.checks.filter((check) => {
    if (check.result.status !== "passed" || existing.has(check.questId) || newlyPassedIds.has(check.questId)) return false;
    newlyPassedIds.add(check.questId);
    return true;
  });
  const progress: GroupQuestProofProgress = {
    completedQuestIds: [...existingIds, ...newlyPassed.map((check) => check.questId)],
    questFinishedAt: {
      ...(input.participant.questFinishedAt ?? {}),
      ...Object.fromEntries(newlyPassed.map((check) => [check.questId, check.result.gameTime ?? new Date().toISOString()])),
    },
    score: (input.participant.score ?? 0) + newlyPassed.reduce((sum, check) => sum + check.reward, 0),
  };
  const newlyPassedQuestIds = newlyPassed.map((check) => check.questId);
  if (!newlyPassed.length) return { ...progress, mutated: false, newlyPassedQuestIds };
  await input.mutate(progress, { newlyPassedQuestIds });
  return { ...progress, mutated: true, newlyPassedQuestIds };
}
