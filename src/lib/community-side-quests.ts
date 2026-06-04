import { getCustomSideQuests, parseCustomRuleConfig, type CustomSideQuest } from "@/lib/custom-side-quests";
import { getPreferredRunnerName, type UserMetadataRecord } from "@/lib/user-metadata";

export type PublicCommunitySideQuest = CustomSideQuest & {
  creatorName: string;
  creatorUserId: string;
  ruleLabel: string;
  updatedAtMs: number;
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

export async function listPublicCommunitySideQuests(client: ClerkUserListClient, options: { limit?: number } = {}) {
  const users = await fetchAllUsers(client);
  const seen = new Set<string>();
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

    return records
      .filter((quest) => quest.lifecycle === "published" && quest.visibility === "public")
      .map((quest) => ({
        ...quest,
        creatorName,
        creatorUserId: user.id,
        ruleLabel: describeCustomRule(quest.config),
        updatedAtMs: Date.parse(quest.updatedAt) || Date.parse(quest.createdAt) || 0,
      }));
  });

  return quests
    .filter((quest) => {
      if (seen.has(quest.id)) return false;
      seen.add(quest.id);
      return isDisplayableCommunitySideQuest(quest);
    })
    .sort((a, b) => b.updatedAtMs - a.updatedAtMs)
    .slice(0, options.limit ?? 80);
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

function describeCustomRule(config: string) {
  const parsed = parseCustomRuleConfig(config);
  const first = parsed?.blocks[0];
  if (!first) return "Custom rule";
  if (first.type === "gameResult") return `${capitalize(first.result)} result`;
  if (first.type === "openingSequence") return "Opening pattern";
  if (first.type === "moveSequence") return first.negate ? "Avoid a move pattern" : "Move pattern";
  if (first.type === "pieceState") {
    const timing = first.timing?.byMove ? ` by move ${first.timing.byMove}` : first.timing?.atGameEnd ? " by game end" : "";
    return `${capitalize(first.piece)} ${first.condition}${timing}`;
  }
  return "Custom rule";
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
