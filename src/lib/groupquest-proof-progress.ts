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
  mutate: (progress: GroupQuestProofProgress) => Promise<void>;
}): Promise<GroupQuestProofProgress & { mutated: boolean }> {
  const existingIds = input.participant.completedQuestIds ?? [];
  const existing = new Set(existingIds);
  const newlyPassed = input.checks.filter((check) => check.result.status === "passed" && !existing.has(check.questId));
  const progress: GroupQuestProofProgress = {
    completedQuestIds: [...existingIds, ...newlyPassed.map((check) => check.questId)],
    questFinishedAt: {
      ...(input.participant.questFinishedAt ?? {}),
      ...Object.fromEntries(newlyPassed.map((check) => [check.questId, check.result.gameTime ?? new Date().toISOString()])),
    },
    score: (input.participant.score ?? 0) + newlyPassed.reduce((sum, check) => sum + check.reward, 0),
  };
  if (!newlyPassed.length) return { ...progress, mutated: false };
  await input.mutate(progress);
  return { ...progress, mutated: true };
}
