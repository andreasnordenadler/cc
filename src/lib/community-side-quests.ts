import { unstable_noStore as noStore } from "next/cache";
import { getCommunityLikes, type CommunityLikeSummary } from "@/lib/community-likes";
import { getCustomSideQuestBadgeUrl, getCustomSideQuests, parseCustomRuleConfig, type CustomSideQuest } from "@/lib/custom-side-quests";
import { type ServerGroupQuest } from "@/lib/groupquests";
import { getActiveChallenge, getChallengeAttempts, getChallengeProgress, getPreferredRunnerName, type UserMetadataRecord } from "@/lib/user-metadata";

export type PublicCommunitySideQuest = CustomSideQuest & {
  creatorName: string;
  creatorKey: string;
  creatorUserId: string;
  creatorBrowsePath: string;
  detailPath: string;
  ruleLabel: string;
  ruleDetails: string[];
  updatedAtMs: number;
  stats: {
    soloAttempts: number;
    soloSelections: number;
    soloCompletions: number;
    multiplayerLineups: number;
    multiplayerAttempts: number;
    multiplayerFulfillments: number;
  };
  popularityScore: number;
  likeSummary: CommunityLikeSummary;
};

type ClerkUserListClient = {
  users: {
    getUserList: (params: { limit: number; offset?: number; orderBy?: "-created_at" }) => Promise<{
      data: Array<{
        id: string;
        firstName: string | null;
        lastName: string | null;
        username: string | null;
        primaryEmailAddress?: { emailAddress: string } | null;
        publicMetadata: unknown;
        privateMetadata: unknown;
      }>;
    }>;
  };
};

export async function listPublicCommunitySideQuests(client: ClerkUserListClient, options: { limit?: number | null; groupQuests?: ServerGroupQuest[]; viewerUserId?: string | null } = {}) {
  noStore();
  const users = await fetchAllUsers(client);
  const seen = new Set<string>();
  const userPublicMetadata = users.map((user) => asMetadata(user.publicMetadata));
  const soloLikeCounts = new Map<string, number>();
  let viewerSoloLikes = new Set<string>();
  for (const user of users) {
    const soloLikes = getCommunityLikes(asMetadata(user.privateMetadata)).filter((like) => like.targetType === "solo");
    if (options.viewerUserId && user.id === options.viewerUserId) {
      viewerSoloLikes = new Set(soloLikes.map((like) => like.targetId));
    }
    for (const like of soloLikes) {
      soloLikeCounts.set(like.targetId, (soloLikeCounts.get(like.targetId) ?? 0) + 1);
    }
  }
  const quests = users.flatMap((user) => {
    const publicMetadata = asMetadata(user.publicMetadata);
    const privateMetadata = asMetadata(user.privateMetadata);
    const records = getCustomSideQuests(privateMetadata).length ? getCustomSideQuests(privateMetadata) : getCustomSideQuests(publicMetadata);
    const creatorName = getPreferredRunnerName(publicMetadata, {
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      emailAddress: user.primaryEmailAddress?.emailAddress,
    }) || "SQC player";
    const creatorKey = makeCreatorKey(creatorName, user.id);

    return records
      .filter((quest) => quest.lifecycle === "published" && quest.visibility === "public")
      .map((quest) => {
        const stats = buildPublicCommunityStats(quest.id, userPublicMetadata, options.groupQuests ?? []);
        return {
          ...quest,
          badgeImageUrl: getCustomSideQuestBadgeUrl(quest),
          creatorName,
          creatorKey,
          creatorUserId: user.id,
          creatorBrowsePath: `/challenges/community?creator=${encodeURIComponent(creatorKey)}#creator-${creatorKey}`,
          detailPath: `/challenges/community/${encodeURIComponent(quest.id)}`,
          ruleLabel: describeCustomSideQuestRule(quest.config),
          ruleDetails: describeCustomSideQuestRuleDetails(quest.config),
          updatedAtMs: Date.parse(quest.updatedAt) || Date.parse(quest.createdAt) || 0,
          stats,
          popularityScore: getCommunityPopularityScore(stats),
          likeSummary: {
            count: soloLikeCounts.get(quest.id) ?? 0,
            likedByViewer: viewerSoloLikes.has(quest.id),
          },
        };
      });
  });

  const sortedQuests = quests
    .filter((quest) => {
      if (seen.has(quest.id)) return false;
      seen.add(quest.id);
      return isDisplayableCommunitySideQuest(quest);
    })
    .sort((a, b) => b.updatedAtMs - a.updatedAtMs);
  return options.limit === null ? sortedQuests : sortedQuests.slice(0, options.limit ?? 80);
}

export async function findPublicCommunitySideQuestById(client: ClerkUserListClient, id: string) {
  const quests = await listPublicCommunitySideQuests(client, { limit: null });
  return quests.find((quest) => quest.id === id) ?? null;
}

export async function findPublicCommunityCustomSideQuestById(client: ClerkUserListClient, id: string) {
  return findPublicCommunitySideQuestById(client, id);
}

async function fetchAllUsers(client: ClerkUserListClient) {
  const out: Awaited<ReturnType<ClerkUserListClient["users"]["getUserList"]>>["data"] = [];
  let offset = 0;
  while (true) {
    const batch = await client.users.getUserList({ limit: 100, offset, orderBy: "-created_at" });
    out.push(...batch.data);
    if (batch.data.length < 100) return out;
    offset += batch.data.length;
  }
}

function asMetadata(value: unknown): UserMetadataRecord {
  return value && typeof value === "object" ? (value as UserMetadataRecord) : {};
}

export function describeCustomSideQuestRule(config: string) {
  return describeCustomSideQuestRuleDetails(config)[0] ?? "Custom rule";
}

export function describeCustomSideQuestRuleDetails(config: string) {
  const parsed = parseCustomRuleConfig(config);
  if (!parsed?.blocks.length) return ["Custom rule"];
  const lines = parsed.blocks.map((block) => {
    if (block.type === "gameResult") return `${capitalize(block.result)} the game.`;
    if (block.type === "openingSequence") return `Play the opening pattern ${block.moves.join(" ")}.`;
    if (block.type === "moveSequence") return block.negate ? `Avoid the move pattern ${block.sequence}.` : `Play the move pattern ${block.sequence}.`;
    if (block.type === "pieceState") {
      const timing = block.timing?.byMove ? ` by move ${block.timing.byMove}` : block.timing?.atMove ? ` at move ${block.timing.atMove}` : block.timing?.atGameEnd ? " by game end" : "";
      const selector = block.selector?.quantifier === "all" ? "all starting" : block.selector?.quantifier ? `${block.selector.quantifier} ${block.selector.count ?? 1}` : "any";
      const identity = block.selector?.identity && block.selector.identity !== "any" ? ` (${block.selector.identity})` : "";
      const target = block.targetSquare ? ` on ${block.targetSquare}` : "";
      const line = `${capitalize(block.owner)} ${selector} ${block.piece}${identity} must be ${block.condition}${target}${timing}.`;
      return block.negate ? `Avoid: ${line}` : line;
    }
    return "Custom rule";
  });
  return parsed.logic === "any" && lines.length > 1 ? ["Complete any one of these rules.", ...lines] : lines;
}

export function getCommunityPopularityScore(stats: PublicCommunitySideQuest["stats"]) {
  return stats.soloSelections + stats.soloCompletions * 3 + stats.multiplayerLineups * 2 + stats.multiplayerFulfillments * 4;
}

function buildPublicCommunityStats(questId: string, userMetadata: UserMetadataRecord[], groupQuests: ServerGroupQuest[]): PublicCommunitySideQuest["stats"] {
  const lineups = groupQuests.filter((quest) => quest.questIds.includes(questId));
  return {
    soloAttempts: userMetadata.reduce((total, metadata) => total + getChallengeAttempts(metadata, questId).length, 0),
    soloSelections: userMetadata.filter((metadata) => getActiveChallenge(metadata)?.id === questId).length,
    soloCompletions: userMetadata.filter((metadata) => getChallengeProgress(metadata).completedChallengeIds.includes(questId)).length,
    multiplayerLineups: lineups.length,
    multiplayerAttempts: lineups.reduce((total, quest) => total + quest.participants.length, 0),
    multiplayerFulfillments: lineups.reduce((total, quest) => total + quest.participants.filter((participant) => participant.completedQuestIds?.includes(questId)).length, 0),
  };
}

function isDisplayableCommunitySideQuest(quest: PublicCommunitySideQuest) {
  const text = `${quest.title} ${quest.summary} ${quest.creatorName}`.toLowerCase();
  if (/(cokok|asdf|test test|lorem|dummy|prototype)/i.test(text)) return false;
  if (quest.title.trim().length < 4 || quest.summary.trim().length < 16) return false;
  return true;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function makeCreatorKey(name: string, userId: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 28) || "sqc-player";
  return `${slug}-${userId.slice(-6).toLowerCase()}`;
}
