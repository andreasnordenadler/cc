import type { SoloCompletion } from "@/lib/solo-check-result";

export type MultiplayerCompletionQuestDetail = {
  id: string;
  title: string;
  summary?: string;
  imageUrl?: string | null;
  glowColor?: string;
  badgeImage?: string;
  badgeName?: string;
  ruleLines?: string[];
};

export function buildMultiplayerCompletion({
  newlyPassedQuestIds,
  questDetails,
}: {
  newlyPassedQuestIds: readonly string[];
  questDetails: readonly MultiplayerCompletionQuestDetail[];
}): { completion: SoloCompletion; extraCompletedCount: number } | null {
  const detail = questDetails.find((candidate) => candidate.id === newlyPassedQuestIds[0]);
  if (!detail) return null;

  return {
    completion: {
      challengeId: detail.id,
      challengeTitle: detail.title,
      badgeName: detail.badgeName ?? detail.title,
      badgeImage: detail.imageUrl ?? detail.badgeImage ?? "/mobile-source/badges/v6/proof-loop-test-badge.png",
      unlockCopy: detail.summary || "The heralds have recorded this one.",
      accentColor: detail.glowColor ?? "#f5c86a",
    },
    extraCompletedCount: Math.max(0, newlyPassedQuestIds.length - 1),
  };
}
