import { CHALLENGES } from "@/lib/challenges";
import { getCommunityLikeSummaries, type CommunityLikeSummary } from "@/lib/community-likes";
import { listPublicGroupQuests, rankGroupQuestParticipants, type ServerGroupQuest } from "@/lib/groupquests";
import type { clerkClient } from "@clerk/nextjs/server";

export type MobileWebMultiplayerPreview = {
  id: string;
  title: string;
  meta: string;
  href: string;
  sourceBadge: "SQC Official" | "Community";
  hostName?: string;
  inviteCopy: string;
  quests: string[];
  rules: Array<[string, string]>;
  status: "Not joined" | "Joined" | "Hosted";
  playersLabel: string;
  timeLeftLabel: string;
  positionLabel?: string | null;
  likeSummary: CommunityLikeSummary;
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

type ClerkClient = Awaited<ReturnType<typeof clerkClient>>;

export async function getMobileWebMultiplayerPreviews(client: ClerkClient, userId?: string | null) {
  const [publicQuests, likeSummaries] = await Promise.all([
    listPublicGroupQuests(client),
    getCommunityLikeSummaries(client, userId ?? null),
  ]);
  const activeQuests = publicQuests.filter((quest) => deriveGroupQuestStatus(quest.startAt, quest.endAt) !== "Finished");
  const finishedQuests = publicQuests.filter((quest) => deriveGroupQuestStatus(quest.startAt, quest.endAt) === "Finished");

  const officialRows = activeQuests
    .filter((quest) => isOfficialGroupQuest(quest))
    .map((quest) => buildPreviewRow(quest, userId, "SQC Official", likeSummaries.get("multiplayer", quest.id)));

  const communityRows = activeQuests
    .filter((quest) => !isOfficialGroupQuest(quest))
    .map((quest) => buildPreviewRow(quest, userId, "Community", likeSummaries.get("multiplayer", quest.id)));

  const previousOfficialRows = finishedQuests
    .filter((quest) => isOfficialGroupQuest(quest))
    .slice(0, 3)
    .map(buildOfficialResultRow);

  return { officialRows, communityRows, previousOfficialRows };
}

function buildPreviewRow(
  quest: ServerGroupQuest,
  userId: string | null | undefined,
  sourceBadge: "SQC Official" | "Community",
  likeSummary: CommunityLikeSummary,
): MobileWebMultiplayerPreview {
  const joined = Boolean(userId) && quest.participants.some((participant) => participant.userId === userId);
  const isOwner = Boolean(userId) && quest.hostUserId === userId;
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
    inviteCopy: quest.inviteCopy,
    quests: quest.questIds.map((questId) => getGroupQuestChallengeTitle(quest, questId)),
    rules: buildRuleRows(quest),
    status: isOwner ? "Hosted" : joined ? "Joined" : "Not joined",
    playersLabel,
    timeLeftLabel,
    positionLabel,
    likeSummary,
  };
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

function getGroupQuestChallengeTitle(quest: Pick<ServerGroupQuest, "customQuestSnapshots">, challengeId: string) {
  return CHALLENGES.find((challenge) => challenge.id === challengeId)?.title
    ?? quest.customQuestSnapshots?.find((snapshot) => snapshot.id === challengeId)?.title
    ?? challengeId;
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

const officialPodiumPlacements = ["Gold", "Silver", "Bronze"] as const;

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
    podiumRows: officialPodiumPlacements.map((placement, index) => {
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
