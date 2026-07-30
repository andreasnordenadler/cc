import { CHALLENGES } from "@/lib/challenges";
import { getCustomSideQuestBadgeUrl, type CustomSideQuest } from "@/lib/custom-side-quests";
import { listPublicGroupQuests, listUserRelatedGroupQuests, rankGroupQuestParticipants, type ServerGroupQuest } from "@/lib/groupquests";

export type MobileWebTrophyRow = {
  id: string;
  title: string;
  meta: string;
  href: string;
  image?: string | null;
  glow?: string | null;
  statusImage?: string | null;
  source: "officialMultiplayer" | "communityMultiplayer" | "officialSolo" | "customSolo" | "communitySolo";
};

type SoloTrophyQuest = Pick<CustomSideQuest, "id" | "title" | "badgeImageUrl">;

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

type AccountMultiplayerQuest = {
  name: string;
  hostUserId: string;
  startAt: string;
  endAt: string;
  participants: Array<{ userId: string }>;
};

export type ActiveMultiplayerAccountSummary = {
  activeCount: number;
  hostedCount: number;
  joinedCount: number;
  firstTitle: string | null;
};

export type ActiveMultiplayerAccountRow = {
  title: string;
  meta: string;
  status: string;
};

type ClerkClient = Parameters<typeof listUserRelatedGroupQuests>[0] & Parameters<typeof listPublicGroupQuests>[0];
const MOBILE_MULTIPLAYER_TROPHY_LIMIT = 12;

export async function getMobileWebTrophyRows(
  client: ClerkClient,
  userId: string,
  completedChallengeIds: string[],
  limit: number | null = 12,
  soloQuests: { ownedCustomQuests?: SoloTrophyQuest[]; communityQuests?: SoloTrophyQuest[] } = {},
): Promise<MobileWebTrophyRow[]> {
  const overview = await getMobileWebAccountOverview(client, userId, {
    completedChallengeIds,
    attempts: [],
    customSideQuestIds: [],
    ownedCustomQuests: soloQuests.ownedCustomQuests,
    communityQuests: soloQuests.communityQuests,
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
    ownedCustomQuests?: SoloTrophyQuest[];
    communityQuests?: SoloTrophyQuest[];
    limit?: number | null;
    multiplayerLimit?: number;
    soloLimit?: number;
  },
): Promise<{ trophyRows: MobileWebTrophyRow[]; stats: MobileWebAccountStats; activeMultiplayer: ActiveMultiplayerAccountSummary }> {
  const [relatedGroupQuests, publicGroupQuests] = await Promise.all([
    listUserRelatedGroupQuests(client, userId),
    listPublicGroupQuests(client),
  ]);
  // The related scan resolves a non-official quest to its host-owned record.
  // Keep that authoritative copy when the public scan also returns a stale or
  // participant-only replica of the same quest.
  const dedupedGroupQuests = new Map([...publicGroupQuests, ...relatedGroupQuests].map((quest) => [quest.id, quest]));
  const multiplayerRows = [...dedupedGroupQuests.values()]
    .filter((quest) => deriveGroupQuestStatus(quest.startAt, quest.endAt) === "Finished")
    .map((quest) => {
      const ranked = rankGroupQuestParticipants(quest);
      const index = ranked.findIndex((participant) => participant.userId === userId);
      const participant = index >= 0 ? ranked[index] : null;
      if (!participant || index > 2 || (participant.score ?? 0) <= 0) return null;
      const placement = index === 0 ? "Gold" : index === 1 ? "Silver" : "Bronze";

      const source = getMultiplayerTrophySource(quest);
      return {
        id: `multiplayer-${quest.id}-${placement.toLowerCase()}`,
        title: quest.name,
        meta: `${source === "officialMultiplayer" ? "Official" : "Community"} Multiplayer placement · ${index === 0 ? "1st" : index === 1 ? "2nd" : "3rd"} place`,
        href: `/groupquests/${quest.id}?accepted=1`,
        image: "/mobile-source/sqc-coat-of-arms.png",
        statusImage: `/mobile-source/stamps/sqc-${placement.toLowerCase()}-seal.png`,
        source,
      };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row));

  const soloRows = buildSoloTrophyRows(input.completedChallengeIds, input.ownedCustomQuests, input.communityQuests);

  return {
    trophyRows: combineTrophyRows(multiplayerRows, soloRows, {
      multiplayerLimit: input.multiplayerLimit ?? MOBILE_MULTIPLAYER_TROPHY_LIMIT,
      soloLimit: input.soloLimit,
      totalLimit: input.limit,
    }),
    stats: summarizeMobileWebAccountStats({
      completedChallengeIds: input.completedChallengeIds,
      attempts: input.attempts,
      customSideQuestIds: input.customSideQuestIds,
      multiplayerTrophyCount: multiplayerRows.length,
      groupQuests: [...dedupedGroupQuests.values()],
    }),
    activeMultiplayer: summarizeActiveMultiplayerAccount(userId, relatedGroupQuests),
  };
}

export function combineTrophyRows(
  multiplayerRows: MobileWebTrophyRow[],
  soloRows: MobileWebTrophyRow[],
  limits: { multiplayerLimit?: number; soloLimit?: number; totalLimit?: number | null } = {},
) {
  const selectedMultiplayer = limits.multiplayerLimit === undefined
    ? multiplayerRows
    : multiplayerRows.slice(0, limits.multiplayerLimit);
  const selectedSolo = limits.soloLimit === undefined
    ? soloRows
    : soloRows.slice(0, limits.soloLimit);
  const combined = [...selectedMultiplayer, ...selectedSolo];
  return typeof limits.totalLimit === "number" ? combined.slice(0, limits.totalLimit) : combined;
}

export async function loadOptionalCommunityTrophyQuests<T extends SoloTrophyQuest>(loader: () => Promise<T[]>): Promise<T[]> {
  try {
    return await loader();
  } catch {
    return [];
  }
}

export function buildSoloTrophyRows(
  completedChallengeIds: string[],
  ownedCustomQuests: SoloTrophyQuest[] = [],
  communityQuests: SoloTrophyQuest[] = [],
): MobileWebTrophyRow[] {
  const completedSet = new Set(completedChallengeIds);
  const ownedIds = new Set(ownedCustomQuests.map((quest) => quest.id));
  const officialRows = CHALLENGES
    .filter((challenge) => completedSet.has(challenge.id))
    .map((challenge) => ({
      id: `solo-${challenge.id}`,
      title: challenge.title,
      meta: `Official Solo Side Quest · ${challenge.badgeIdentity.name}`,
      href: `/challenges/${challenge.id}`,
      image: toMobileAssetPath(challenge.badgeIdentity.image) ?? "/mobile-source/sqc-coat-of-arms.png",
      glow: getChallengeGlowPath(challenge.id),
      statusImage: "/mobile-source/stamps/quest-complete-red-wax-sqc-v15.png",
      source: "officialSolo" as const,
    }));
  const customRows = ownedCustomQuests
    .filter((quest) => completedSet.has(quest.id))
    .map((quest) => buildCustomSoloTrophyRow(quest, "customSolo"));
  const communityRows = communityQuests
    .filter((quest) => completedSet.has(quest.id) && !ownedIds.has(quest.id))
    .map((quest) => buildCustomSoloTrophyRow(quest, "communitySolo"));

  return [...officialRows, ...customRows, ...communityRows];
}

function buildCustomSoloTrophyRow(
  quest: SoloTrophyQuest,
  source: "customSolo" | "communitySolo",
): MobileWebTrophyRow {
  const isOwned = source === "customSolo";
  return {
    id: `solo-${quest.id}`,
    title: quest.title,
    meta: `${isOwned ? "Custom" : "Community"} Solo Side Quest · ${isOwned ? "Custom" : "Community"} Side Quest`,
    href: isOwned ? `/custom-side-quests/${encodeURIComponent(quest.id)}` : `/challenges/community/${encodeURIComponent(quest.id)}`,
    image: getCustomSideQuestBadgeUrl(quest) ?? "/mobile-source/sqc-coat-of-arms.png",
    statusImage: "/mobile-source/stamps/quest-complete-red-wax-sqc-v15.png",
    source,
  };
}

export function getMultiplayerTrophySource(quest: Pick<ServerGroupQuest, "id" | "official">) {
  return quest.official === true || quest.id.startsWith("official-")
    ? "officialMultiplayer" as const
    : "communityMultiplayer" as const;
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

export function summarizeActiveMultiplayerAccount(
  userId: string,
  groupQuests: AccountMultiplayerQuest[],
  now = new Date(),
): ActiveMultiplayerAccountSummary {
  const activeQuests = groupQuests
    .filter((quest) => quest.hostUserId === userId || quest.participants.some((participant) => participant.userId === userId))
    .filter((quest) => {
      const end = Date.parse(quest.endAt);
      return !Number.isFinite(end) || end >= now.getTime();
    })
    .sort((a, b) => {
      const bTime = Date.parse(b.startAt || b.endAt);
      const aTime = Date.parse(a.startAt || a.endAt);
      return (Number.isFinite(bTime) ? bTime : 0) - (Number.isFinite(aTime) ? aTime : 0);
    });
  const hostedCount = activeQuests.filter((quest) => quest.hostUserId === userId).length;

  return {
    activeCount: activeQuests.length,
    hostedCount,
    joinedCount: activeQuests.length - hostedCount,
    firstTitle: activeQuests[0]?.name ?? null,
  };
}

export function getActiveMultiplayerAccountRow(summary: ActiveMultiplayerAccountSummary): ActiveMultiplayerAccountRow {
  if (!summary.activeCount) {
    return {
      title: "Multiplayer Side Quests",
      meta: "Join an official table, join a community table, or create one for friends.",
      status: "Open",
    };
  }

  return {
    title: "Active Multiplayer Side Quests",
    meta: `${summary.hostedCount} hosted · ${summary.joinedCount} joined · ${summary.firstTitle ?? "Open Multiplayer Side Quest"}`,
    status: `${summary.activeCount} active`,
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
