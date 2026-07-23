import { CHALLENGES } from "@/lib/challenges";
import { getCommunityLikeSummaries, type CommunityLikeSummary } from "@/lib/community-likes";
import { describeCustomSideQuestRuleDetails } from "@/lib/community-side-quests";
import { findGroupQuestById, listPublicGroupQuests, listUserRelatedGroupQuests, rankGroupQuestParticipants, type ServerGroupQuest } from "@/lib/groupquests";
import type { clerkClient } from "@clerk/nextjs/server";

export type MobileWebMultiplayerPreview = {
  id: string;
  title: string;
  meta: string;
  href: string;
  sourceBadge: "SQC Official" | "Community";
  hostName?: string;
  publiclyListed: boolean;
  inviteKey?: string;
  inviteCopy: string;
  quests: string[];
  questRuleDetails?: MobileWebMultiplayerQuestRuleDetail[];
  rules: Array<[string, string]>;
  status: "Not joined" | "Joined" | "Hosted";
  viewerJoined?: boolean;
  playerCount: number;
  playersLabel: string;
  timeLeftLabel: string;
  positionLabel?: string | null;
  leaderboardRows: MobileWebMultiplayerLeaderboardRow[];
  likeSummary: CommunityLikeSummary;
  eventStatus?: "Soon" | "Live" | "Finished";
  lifecycle: "open" | "finished";
  createdAt: string;
  startAt: string;
  endAt: string;
};

export type MobileWebMultiplayerQuestRuleDetail = {
  id: string;
  title: string;
  summary: string;
  status?: string;
  imageUrl?: string | null;
  glowColor?: string;
  ruleLines: string[];
};

export type MobileWebMultiplayerLeaderboardRow = {
  rank: number;
  name: string;
  provider: string;
  progress: string;
  placement: "Gold" | "Silver" | "Bronze" | null;
  viewer: boolean;
  participantUserId?: string;
};

export type MobileWebMultiplayerResult = {
  id: string;
  title: string;
  href: string;
  summary: string;
  podiumRows: Array<{
    placement: "Gold" | "Silver" | "Bronze";
    name: string;
    meta: string;
    pending: boolean;
  }>;
};

export type MobileWebOfficialWeek = {
  id: string;
  title: string;
  meta: string;
  questCount: number;
  results: MobileWebMultiplayerResult[];
};

type ClerkClient = Awaited<ReturnType<typeof clerkClient>>;

type MobileWebMultiplayerDetailDependencies = {
  findQuestById: typeof findGroupQuestById;
  getLikeSummaries: typeof getCommunityLikeSummaries;
};

const mobileWebMultiplayerDetailDependencies: MobileWebMultiplayerDetailDependencies = {
  findQuestById: findGroupQuestById,
  getLikeSummaries: getCommunityLikeSummaries,
};

export function getMultiplayerHostFilter(value: string | string[] | undefined) {
  return typeof value === "string" && value.length > 0 && value.length <= 80 ? value : null;
}

export function mergeCommunityCatalogQuests(publicQuests: ServerGroupQuest[], relatedQuests: ServerGroupQuest[]) {
  const questsById = new Map(publicQuests.filter((quest) => !isOfficialGroupQuest(quest)).map((quest) => [quest.id, quest]));
  relatedQuests.forEach((quest) => questsById.set(quest.id, quest));
  return [...questsById.values()];
}

export async function getMobileWebMultiplayerPreviews(client: ClerkClient, userId?: string | null) {
  const [publicQuests, relatedQuests, likeSummaries] = await Promise.all([
    listPublicGroupQuests(client),
    userId ? listUserRelatedGroupQuests(client, userId) : Promise.resolve([]),
    getCommunityLikeSummaries(client, userId ?? null),
  ]);
  const activeQuests = publicQuests.filter((quest) => deriveGroupQuestStatus(quest.startAt, quest.endAt) !== "Finished");
  const finishedQuests = publicQuests.filter((quest) => deriveGroupQuestStatus(quest.startAt, quest.endAt) === "Finished");

  const officialRows = activeQuests
    .filter((quest) => isOfficialGroupQuest(quest))
    .map((quest) => buildMobileWebMultiplayerPreview(quest, userId, "SQC Official", likeSummaries.get("multiplayer", quest.id)));

  const communityRows = mergeCommunityCatalogQuests(publicQuests, relatedQuests).map((quest) => buildMobileWebMultiplayerPreview(
    quest,
    userId,
    isOfficialGroupQuest(quest) ? "SQC Official" : "Community",
    likeSummaries.get("multiplayer", quest.id),
  ));

  const previousOfficialRows = finishedQuests
    .filter((quest) => isOfficialGroupQuest(quest))
    .slice(0, 3)
    .map(buildOfficialResultRow);

  const officialWeeks = buildOfficialWeeks(
    finishedQuests.filter((quest) => isOfficialGroupQuest(quest)),
  );
  const latestOfficialWeekId = officialWeeks[0]?.id ?? null;
  const earlierOfficialWeeks = officialWeeks.filter((week) => week.id !== latestOfficialWeekId);

  return { officialRows, communityRows, previousOfficialRows, earlierOfficialWeeks };
}

export async function getMobileWebMultiplayerDetail(
  client: ClerkClient,
  id: string,
  userId?: string | null,
  dependencies: MobileWebMultiplayerDetailDependencies = mobileWebMultiplayerDetailDependencies,
) {
  const found = await dependencies.findQuestById(client, id);
  if (!found) return null;
  const canonicalOwnerUserId = found.userId === found.groupQuest.hostUserId ? found.userId : undefined;
  const joined = Boolean(userId) && found.groupQuest.participants.some((participant) => participant.userId === userId);
  const hosted = canonicalOwnerUserId === userId;
  if (found.groupQuest.inviteMode !== "public" && !joined && !hosted) return null;
  const likeSummaries = await dependencies.getLikeSummaries(client, userId ?? null);
  return buildMobileWebMultiplayerPreview(
    found.groupQuest,
    userId,
    isOfficialGroupQuest(found.groupQuest) ? "SQC Official" : "Community",
    likeSummaries.get("multiplayer", id),
    true,
    canonicalOwnerUserId,
  );
}

export function buildMobileWebMultiplayerPreview(
  quest: ServerGroupQuest,
  userId: string | null | undefined,
  sourceBadge: "SQC Official" | "Community",
  likeSummary: CommunityLikeSummary,
  includeLeaderboard = false,
  canonicalOwnerUserId?: string,
): MobileWebMultiplayerPreview {
  const joined = Boolean(userId) && quest.participants.some((participant) => participant.userId === userId);
  const isOwner = Boolean(userId) && (canonicalOwnerUserId ?? quest.hostUserId) === userId;
  const status = deriveGroupQuestStatus(quest.startAt, quest.endAt);
  const playersLabel = formatPlayersLabel(quest.participants.length);
  const timeLeftLabel = status === "Finished" ? "Final" : formatTimeLeftLabel(quest.endAt);
  const positionLabel = userId ? getParticipantPositionLabel(quest, userId) : null;
  const joinStateLabel = userId ? (isOwner ? "You host" : joined ? "You joined" : "Not joined") : null;
  const meta = [
    sourceBadge === "SQC Official" ? "SQC official" : "Community public",
    joinStateLabel,
    playersLabel,
    timeLeftLabel,
    positionLabel,
  ].filter(Boolean).join(" · ");

  return {
    id: quest.id,
    title: quest.name,
    meta,
    href: `/groupquests/${quest.id}${joined && !isOwner ? "?accepted=1" : ""}`,
    sourceBadge,
    hostName: quest.hostName,
    publiclyListed: quest.inviteMode === "public",
    ...(canonicalOwnerUserId && isOwner && quest.inviteMode === "private-key" && quest.inviteKey ? { inviteKey: quest.inviteKey } : {}),
    inviteCopy: quest.inviteCopy,
    quests: quest.questIds.map((questId) => getGroupQuestChallengeTitle(quest, questId)),
    questRuleDetails: quest.questIds.map((questId) => getGroupQuestChallengeRuleDetail(quest, questId)),
    rules: buildRuleRows(quest),
    status: isOwner ? "Hosted" : joined ? "Joined" : "Not joined",
    viewerJoined: joined,
    playerCount: quest.participants.length,
    playersLabel,
    timeLeftLabel,
    positionLabel,
    leaderboardRows: includeLeaderboard ? buildMobileWebMultiplayerLeaderboardRows(quest, userId, isOwner && status !== "Finished") : [],
    likeSummary,
    eventStatus: status,
    lifecycle: status === "Finished" ? "finished" : "open",
    createdAt: quest.createdAt,
    startAt: quest.startAt,
    endAt: quest.endAt,
  };
}

export function buildUserMultiplayerRows(
  quests: ServerGroupQuest[],
  userId: string | null | undefined,
  likeSummaries: Map<string, CommunityLikeSummary>,
  now = Date.now(),
) {
  if (!userId) return [];
  return quests
    .filter((quest) => quest.hostUserId === userId || quest.participants.some((participant) => participant.userId === userId))
    .map((quest) => {
      const row = buildMobileWebMultiplayerPreview(quest, userId, isOfficialGroupQuest(quest) ? "SQC Official" : "Community", likeSummaries.get(quest.id) ?? { count: 0, likedByViewer: false });
      return { ...row, lifecycle: Number.isFinite(Date.parse(quest.endAt)) && Date.parse(quest.endAt) < now ? "finished" as const : "open" as const };
    });
}

function isOfficialGroupQuest(quest: Pick<ServerGroupQuest, "id" | "official">) {
  return quest.official === true || quest.id.startsWith("official-");
}

function deriveGroupQuestStatus(startAt: string, endAt: string) {
  const now = Date.now();
  const start = Date.parse(startAt);
  const end = Date.parse(endAt);
  if (Number.isFinite(start) && start > now) return "Soon";
  if (Number.isFinite(end) && end < now) return "Finished";
  return "Live";
}

function formatPlayersLabel(count: number) {
  return `${count} player${count === 1 ? "" : "s"}`;
}

function formatTimeLeftLabel(endAt: string) {
  const end = Date.parse(endAt);
  if (!Number.isFinite(end)) return "Time TBA";
  const remainingMs = end - Date.now();
  if (remainingMs <= 0) return "Ended";
  const minutes = Math.ceil(remainingMs / 60000);
  if (minutes < 60) return `${minutes}m left`;
  const hours = Math.ceil(minutes / 60);
  if (hours < 48) return `${hours}h left`;
  return `${Math.ceil(hours / 24)}d left`;
}

function getParticipantPositionLabel(
  quest: Pick<ServerGroupQuest, "questIds" | "participants">,
  userId: string,
) {
  const ranked = rankGroupQuestParticipants(quest);
  const index = ranked.findIndex((participant) => participant.userId === userId);
  return index >= 0 ? `#${index + 1}` : null;
}

const podiumPlacements = ["Gold", "Silver", "Bronze"] as const;

export function buildMobileWebMultiplayerLeaderboardRows(
  quest: Pick<ServerGroupQuest, "questIds" | "participants">,
  userId: string | null | undefined,
  canManageParticipants = false,
): MobileWebMultiplayerLeaderboardRow[] {
  return rankGroupQuestParticipants(quest).map((participant, index) => ({
    rank: index + 1,
    name: participant.leaderboardName,
    provider: `${participant.provider === "chesscom" ? "chess.com" : "lichess"} · ${participant.username}`,
    progress: `${participant.completedQuestIds?.length ?? 0}/${Math.max(quest.questIds.length, 1)}`,
    placement: podiumPlacements[index] ?? null,
    viewer: Boolean(userId) && participant.userId === userId,
    ...(canManageParticipants && participant.userId !== userId ? { participantUserId: participant.userId } : {}),
  }));
}

function getGroupQuestChallengeTitle(quest: Pick<ServerGroupQuest, "customQuestSnapshots">, challengeId: string) {
  return quest.customQuestSnapshots?.find((snapshot) => snapshot.id === challengeId)?.title
    ?? CHALLENGES.find((challenge) => challenge.id === challengeId)?.title
    ?? challengeId;
}

function getGroupQuestChallengeRuleDetail(
  quest: Pick<ServerGroupQuest, "customQuestSnapshots">,
  challengeId: string,
): MobileWebMultiplayerQuestRuleDetail {
  const custom = quest.customQuestSnapshots?.find((snapshot) => snapshot.id === challengeId);
  if (custom) {
    return {
      id: challengeId,
      title: custom.title,
      summary: custom.summary,
      status: "Included",
      imageUrl: custom.badgeImageUrl ?? null,
      glowColor: "rgba(245, 200, 106, .38)",
      ruleLines: getSafeCustomRuleDetails(custom.config),
    };
  }

  const official = CHALLENGES.find((challenge) => challenge.id === challengeId);
  if (official) {
    return {
      id: official.id,
      title: official.title,
      summary: official.objective,
      status: official.difficulty,
      imageUrl: official.badgeIdentity.image ?? null,
      glowColor: official.badgeIdentity.colors.glow,
      ruleLines: official.conditions.length ? official.conditions : [official.instruction],
    };
  }

  return {
    id: challengeId,
    title: challengeId,
    summary: "Complete this custom Side Quest.",
    ruleLines: ["Follow the saved Side Quest rules."],
  };
}

function getSafeCustomRuleDetails(config: string) {
  try {
    return describeCustomSideQuestRuleDetails(config);
  } catch {
    return ["Custom rule"];
  }
}

function buildRuleRows(quest: Pick<ServerGroupQuest, "providerLabel" | "rules">) {
  const rows: Array<[string, string]> = [
    ["Games allowed", quest.providerLabel],
    ["Time control", quest.rules.timeControl ?? "Any time control"],
    ["Rated", quest.rules.rated ?? "Any rated state"],
    ["Color", quest.rules.color ?? "Any color"],
  ];
  if (quest.rules.result) rows.push(["Result", quest.rules.result]);
  if (quest.rules.customRuleSummary) rows.push(["Custom rule", quest.rules.customRuleSummary]);
  return rows;
}

function buildOfficialResultRow(quest: ServerGroupQuest): MobileWebMultiplayerResult {
  const leaderboardRows = rankGroupQuestParticipants(quest).map((participant, index) => {
    const completedCount = participant.completedQuestIds?.length ?? 0;
    return {
      rank: `#${index + 1}`,
      name: participant.leaderboardName,
      provider: `${participant.provider === "chesscom" ? "chess.com" : "lichess"} · ${participant.username}`,
      progress: `${completedCount}/${Math.max(quest.questIds.length, 1)}`,
    };
  });
  const winner = leaderboardRows[0]?.name;

  return {
    id: quest.id,
    title: quest.name,
    href: `/groupquests/${quest.id}`,
    summary: ["Final", formatPlayersLabel(quest.participants.length), winner ? `Winner: ${winner}` : "Podium pending"].join(" · "),
    podiumRows: podiumPlacements.map((placement, index) => {
      const row = leaderboardRows[index];
      return {
        placement,
        name: row?.name ?? `${placement} pending`,
        meta: row ? `${row.rank} · ${row.progress} · ${row.provider}` : "Waiting for verified finishers",
        pending: !row,
      };
    }),
  };
}

export function buildOfficialWeeks(quests: ServerGroupQuest[]): MobileWebOfficialWeek[] {
  const weekMap = new Map<string, { id: string; label: string; rangeLabel: string; quests: ServerGroupQuest[] }>();

  quests.forEach((quest) => {
    const date = new Date(quest.endAt || quest.startAt || Date.now());
    const weekStart = new Date(date);
    const day = weekStart.getUTCDay() || 7;
    weekStart.setUTCDate(weekStart.getUTCDate() - day + 1);
    weekStart.setUTCHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekStart.getUTCDate() + 6);

    const id = weekStart.toISOString().slice(0, 10);
    const label = `Week of ${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    const rangeLabel = `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}-${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    const existing = weekMap.get(id) ?? { id, label, rangeLabel, quests: [] };
    existing.quests.push(quest);
    weekMap.set(id, existing);
  });

  return Array.from(weekMap.values())
    .sort((a, b) => b.id.localeCompare(a.id))
    .map((week) => ({
      id: week.id,
      title: week.label,
      meta: `${week.rangeLabel} · ${week.quests.length} official result${week.quests.length === 1 ? "" : "s"}`,
      questCount: week.quests.length,
      results: week.quests.map(buildOfficialResultRow),
    }));
}
