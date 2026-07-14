import { CHALLENGES } from "@/lib/challenges";
import { listPublicGroupQuests, listUserRelatedGroupQuests, rankGroupQuestParticipants } from "@/lib/groupquests";
import type { clerkClient } from "@clerk/nextjs/server";

export type MobileWebTrophyRow = {
  id: string;
  title: string;
  meta: string;
  href: string;
  image?: string | null;
  glow?: string | null;
  statusImage?: string | null;
  source: "multiplayer" | "solo";
};

export type MobileWebAccountStats = {
  completedCount: number;
  proofCount: number;
  coatCount: number;
  podiumCount: number;
  customQuestCount: number;
  customTries: number;
  customWins: number;
};

type AccountStatsAttempt = {
  id?: string;
  challengeId?: string;
};

type AccountStatsGroupQuest = {
  questIds: string[];
  participants: Array<{ completedQuestIds?: string[] }>;
};

type ClerkClient = Awaited<ReturnType<typeof clerkClient>>;
const MOBILE_MULTIPLAYER_TROPHY_LIMIT = 12;

export async function getMobileWebTrophyRows(
  client: ClerkClient,
  userId: string,
  completedChallengeIds: string[],
  limit = 12,
): Promise<MobileWebTrophyRow[]> {
  const overview = await getMobileWebAccountOverview(client, userId, {
    completedChallengeIds,
    attempts: [],
    customSideQuestIds: [],
    limit,
  });
  return overview.trophyRows;
}

export async function getMobileWebAccountOverview(
  client: ClerkClient,
  userId: string,
  input: {
    completedChallengeIds: string[];
    attempts: AccountStatsAttempt[];
    customSideQuestIds: string[];
    limit?: number;
  },
): Promise<{ trophyRows: MobileWebTrophyRow[]; stats: MobileWebAccountStats }> {
  const [relatedGroupQuests, publicGroupQuests] = await Promise.all([
    listUserRelatedGroupQuests(client, userId),
    listPublicGroupQuests(client),
  ]);
  const dedupedGroupQuests = new Map([...relatedGroupQuests, ...publicGroupQuests].map((quest) => [quest.id, quest]));
  const multiplayerRows = [...dedupedGroupQuests.values()]
    .filter((quest) => deriveGroupQuestStatus(quest.startAt, quest.endAt) === "Finished")
    .map((quest) => {
      const ranked = rankGroupQuestParticipants(quest);
      const index = ranked.findIndex((participant) => participant.userId === userId);
      const participant = index >= 0 ? ranked[index] : null;
      if (!participant || index > 2 || (participant.score ?? 0) <= 0) return null;
      const placement = index === 0 ? "Gold" : index === 1 ? "Silver" : "Bronze";

      return {
        id: `multiplayer-${quest.id}-${placement.toLowerCase()}`,
        title: quest.name,
        meta: `Multiplayer placement · ${index === 0 ? "1st" : index === 1 ? "2nd" : "3rd"} place`,
        href: `/groupquests/${quest.id}?accepted=1`,
        image: "/mobile-source/sqc-coat-of-arms.png",
        statusImage: `/mobile-source/stamps/sqc-${placement.toLowerCase()}-seal.png`,
        source: "multiplayer" as const,
      };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row))
    .slice(0, MOBILE_MULTIPLAYER_TROPHY_LIMIT);

  const completedSet = new Set(input.completedChallengeIds);
  const soloRows = CHALLENGES
    .filter((challenge) => completedSet.has(challenge.id))
    .map((challenge) => ({
      id: `solo-${challenge.id}`,
      title: challenge.title,
      meta: `Official Solo Side Quest · ${challenge.badgeIdentity.name}`,
      href: `/challenges/${challenge.id}`,
      image: toMobileAssetPath(challenge.badgeIdentity.image) ?? "/mobile-source/sqc-coat-of-arms.png",
      glow: getChallengeGlowPath(challenge.id),
      statusImage: "/mobile-source/stamps/quest-complete-red-wax-sqc-v15.png",
      source: "solo" as const,
    }));

  return {
    trophyRows: [...multiplayerRows, ...soloRows].slice(0, input.limit ?? 12),
    stats: summarizeMobileWebAccountStats({
      completedChallengeIds: input.completedChallengeIds,
      attempts: input.attempts,
      customSideQuestIds: input.customSideQuestIds,
      multiplayerTrophyCount: multiplayerRows.length,
      groupQuests: [...dedupedGroupQuests.values()],
    }),
  };
}

export function summarizeMobileWebAccountStats(input: {
  completedChallengeIds: string[];
  attempts: AccountStatsAttempt[];
  customSideQuestIds: string[];
  multiplayerTrophyCount: number;
  groupQuests: AccountStatsGroupQuest[];
}): MobileWebAccountStats {
  const multiplayerTrophyCount = Math.min(input.multiplayerTrophyCount, MOBILE_MULTIPLAYER_TROPHY_LIMIT);
  const customQuestIds = new Set(input.customSideQuestIds);
  const completedSet = new Set(input.completedChallengeIds);
  const customSoloAttempts = input.attempts.filter((attempt) => {
    const questId = attempt.challengeId ?? attempt.id?.split(":")[0];
    return Boolean(questId && customQuestIds.has(questId));
  }).length;
  const customMultiplayerAttempts = input.groupQuests.reduce((total, quest) => {
    const customQuestCount = quest.questIds.filter((questId) => customQuestIds.has(questId)).length;
    return total + customQuestCount * quest.participants.length;
  }, 0);
  const customSoloWins = input.customSideQuestIds.filter((questId) => completedSet.has(questId)).length;
  const customMultiplayerWins = input.groupQuests.reduce((total, quest) => {
    const customQuestIdsInLineup = quest.questIds.filter((questId) => customQuestIds.has(questId));
    return total + customQuestIdsInLineup.reduce(
      (questTotal, questId) => questTotal + quest.participants.filter((participant) => participant.completedQuestIds?.includes(questId)).length,
      0,
    );
  }, 0);

  return {
    completedCount: input.completedChallengeIds.length,
    proofCount: input.attempts.length,
    coatCount: input.completedChallengeIds.length + multiplayerTrophyCount,
    podiumCount: multiplayerTrophyCount,
    customQuestCount: input.customSideQuestIds.length,
    customTries: customSoloAttempts + customMultiplayerAttempts,
    customWins: customSoloWins + customMultiplayerWins,
  };
}

function deriveGroupQuestStatus(startAt: string, endAt: string) {
  const now = Date.now();
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();
  if (Number.isFinite(end) && now > end) return "Finished";
  if (Number.isFinite(start) && now < start) return "Scheduled";
  return "Active";
}

export function toMobileAssetPath(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("/mobile-source/")) return path;
  if (path.startsWith("/badges/")) return `/mobile-source${path}`;
  if (path.startsWith("/stamps/")) return `/mobile-source${path}`;
  return path;
}

export function getChallengeGlowPath(challengeId: string) {
  const known = new Set([
    "bishop-field-trip",
    "early-king-walk",
    "finish-any-game",
    "knightmare-mode",
    "knights-before-coffee",
    "no-castle-club",
    "pawn-only-picnic",
    "queen-never-heard-of-her",
    "the-blunder-gambit",
  ]);
  return known.has(challengeId) ? `/mobile-source/badges/glow/${challengeId}-glow.png` : null;
}
