import { getActiveChallenge, getChallengeAttempts, getChallengeProgress, type ChallengeAttempt, type UserMetadataRecord } from "@/lib/user-metadata";

export type CustomSideQuestActivityStats = {
  soloAttempts: number;
  soloSelections: number;
  soloCompletions: number;
  multiplayerLineups: number;
  multiplayerAttempts: number;
  multiplayerFulfillments: number;
};

type ActivityGroupQuest = {
  id: string;
  questIds: string[];
  participants: Array<{ completedQuestIds?: string[] }>;
};

export function buildCustomQuestStats({
  questId,
  attempts,
  completedChallengeIds,
  activeChallengeId,
  groupQuests,
}: {
  questId: string;
  attempts: Array<Pick<ChallengeAttempt, "challengeId" | "id">>;
  completedChallengeIds: Iterable<string>;
  activeChallengeId: string | null;
  groupQuests: ActivityGroupQuest[];
}): CustomSideQuestActivityStats {
  const completedSet = new Set(completedChallengeIds);
  const dedupedQuests = new Map(groupQuests.map((quest) => [quest.id, quest]));
  const lineups = [...dedupedQuests.values()].filter((quest) => quest.questIds.includes(questId));

  return {
    soloAttempts: attempts.filter((attempt) => (attempt.challengeId ?? attempt.id?.split(":")[0]) === questId).length,
    soloSelections: activeChallengeId === questId ? 1 : 0,
    soloCompletions: completedSet.has(questId) ? 1 : 0,
    multiplayerLineups: lineups.length,
    multiplayerAttempts: lineups.reduce((total, quest) => total + quest.participants.length, 0),
    multiplayerFulfillments: lineups.reduce((total, quest) => total + quest.participants.filter((participant) => new Set(participant.completedQuestIds ?? []).has(questId)).length, 0),
  };
}

export function formatCustomQuestActivity(stats: CustomSideQuestActivityStats) {
  const plays = stats.soloAttempts + stats.multiplayerLineups;
  const completions = stats.soloCompletions + stats.multiplayerFulfillments;
  if (plays === 0 && completions === 0) return "No plays yet.";
  return `${plays} ${plays === 1 ? "play" : "plays"} · ${completions} ${completions === 1 ? "completion" : "completions"}`;
}

export function buildOwnedCustomQuestStats({
  questId,
  publicMetadata,
  groupQuests,
}: {
  questId: string;
  publicMetadata: UserMetadataRecord;
  groupQuests: ActivityGroupQuest[];
}) {
  return buildCustomQuestStats({
    questId,
    attempts: getChallengeAttempts(publicMetadata),
    completedChallengeIds: getChallengeProgress(publicMetadata).completedChallengeIds,
    activeChallengeId: getActiveChallenge(publicMetadata)?.id ?? null,
    groupQuests,
  });
}

export async function loadCustomQuestGroupContext({
  loadRelated,
  loadPublic,
}: {
  loadRelated: () => Promise<ActivityGroupQuest[]>;
  loadPublic: () => Promise<ActivityGroupQuest[]>;
}) {
  const [related, publicQuests] = await Promise.allSettled([loadRelated(), loadPublic()]);
  return [
    ...(related.status === "fulfilled" ? related.value : []),
    ...(publicQuests.status === "fulfilled" ? publicQuests.value : []),
  ];
}
