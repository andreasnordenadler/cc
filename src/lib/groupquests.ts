export type GroupQuestInviteMode = "public" | "unlisted-link" | "invite-only";
export type GroupQuestProviderMode = "both" | "lichess" | "chesscom";
export type GroupQuestJoinProvider = "lichess" | "chesscom";

export type GroupQuestParticipant = {
  userId: string;
  provider: GroupQuestJoinProvider;
  username: string;
  leaderboardName: string;
  wantsEmailUpdates?: boolean;
  email?: string;
  location?: string;
  joinedAt: string;
  score?: number;
  completedQuestIds?: string[];
  questFinishedAt?: Record<string, string>;
  lastProofSummary?: string;
  lastProofAt?: string;
};

export type ServerGroupQuest = {
  id: string;
  hostUserId: string;
  hostName: string;
  name: string;
  inviteCopy: string;
  inviteMode: GroupQuestInviteMode;
  questIds: string[];
  providerMode: GroupQuestProviderMode;
  providerLabel: string;
  startAt: string;
  endAt: string;
  rules: Record<string, string>;
  createdAt: string;
  participants: GroupQuestParticipant[];
};

export type GroupQuestHostRecord = {
  userId: string;
  groupQuest: ServerGroupQuest;
};

const MAX_HOST_QUESTS = 24;
const MAX_PARTICIPANTS = 80;
const defaultInviteCopy = "A friend invited you to a chess side quest. Try to win real games while completing weird objectives, then Side Quest Chess checks the public proof and updates the competition leaderboard.";

export function getStoredGroupQuests(metadata: unknown): ServerGroupQuest[] {
  if (!metadata || typeof metadata !== "object") return [];
  const raw = (metadata as { sqcGroupQuests?: unknown }).sqcGroupQuests;
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeGroupQuest).filter((quest): quest is ServerGroupQuest => Boolean(quest));
}

export function makeGroupQuestId(name: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 34) || "multiplayer-side-quest";
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${slug}-${suffix}`;
}

export function buildGroupQuest(input: {
  hostUserId: string;
  hostName: string;
  name?: unknown;
  inviteCopy?: unknown;
  inviteMode?: unknown;
  questIds?: unknown;
  providerMode?: unknown;
  providerLabel?: unknown;
  startAt?: unknown;
  endAt?: unknown;
  rules?: unknown;
}): ServerGroupQuest {
  const name = cleanText(input.name, 64) ?? "Untitled Multiplayer Side Quest";
  const now = new Date().toISOString();
  const questIds = Array.isArray(input.questIds)
    ? input.questIds.filter((id): id is string => typeof id === "string" && id.length > 0).slice(0, 8)
    : [];

  return {
    id: makeGroupQuestId(name),
    hostUserId: input.hostUserId,
    hostName: cleanText(input.hostName, 80) ?? "SQC host",
    name,
    inviteCopy: cleanText(input.inviteCopy, 280) ?? defaultInviteCopy,
    inviteMode: normalizeInviteMode(input.inviteMode),
    questIds: questIds.length ? questIds : ["knights-before-coffee"],
    providerMode: normalizeProviderMode(input.providerMode),
    providerLabel: cleanText(input.providerLabel, 80) ?? providerLabelFor(input.providerMode),
    startAt: cleanText(input.startAt, 40) ?? now,
    endAt: cleanText(input.endAt, 40) ?? now,
    rules: normalizeRules(input.rules),
    createdAt: now,
    participants: [],
  };
}

export async function findGroupQuestById(
  client: { users: { getUserList: (params: { limit: number; orderBy?: "-created_at" }) => Promise<{ data: Array<{ id: string; privateMetadata: unknown }> }> } },
  id: string,
): Promise<GroupQuestHostRecord | null> {
  const users = await client.users.getUserList({ limit: 100, orderBy: "-created_at" });
  for (const user of users.data) {
    const quests = getStoredGroupQuests(user.privateMetadata);
    const groupQuest = quests.find((quest) => quest.id === id);
    if (groupQuest) return { userId: user.id, groupQuest };
  }
  return null;
}


export async function listUserRelatedGroupQuests(
  client: { users: { getUserList: (params: { limit: number; orderBy?: "-created_at" }) => Promise<{ data: Array<{ id: string; privateMetadata: unknown }> }> } },
  userId: string,
) {
  const users = await client.users.getUserList({ limit: 100, orderBy: "-created_at" });
  const related = users.data
    .flatMap((user) => getStoredGroupQuests(user.privateMetadata))
    .filter((quest) => quest.hostUserId === userId || quest.participants.some((participant) => participant.userId === userId));

  const seen = new Set<string>();
  return related.filter((quest) => {
    if (seen.has(quest.id)) return false;
    seen.add(quest.id);
    return true;
  }).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function listPublicGroupQuests(
  client: { users: { getUserList: (params: { limit: number; orderBy?: "-created_at" }) => Promise<{ data: Array<{ privateMetadata: unknown }> }> } },
) {
  const users = await client.users.getUserList({ limit: 100, orderBy: "-created_at" });
  return users.data
    .flatMap((user) => getStoredGroupQuests(user.privateMetadata))
    .filter((quest) => quest.inviteMode === "public")
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function upsertHostGroupQuest(metadata: unknown, groupQuest: ServerGroupQuest) {
  const existing = getStoredGroupQuests(metadata).filter((quest) => quest.id !== groupQuest.id);
  return [groupQuest, ...existing].slice(0, MAX_HOST_QUESTS);
}

export function joinGroupQuest(groupQuest: ServerGroupQuest, participant: GroupQuestParticipant): ServerGroupQuest {
  const existing = groupQuest.participants.find((entry) => entry.userId === participant.userId);
  const participants = [
    {
      ...existing,
      ...participant,
      score: existing?.score ?? participant.score ?? 0,
      completedQuestIds: existing?.completedQuestIds ?? participant.completedQuestIds ?? [],
      questFinishedAt: existing?.questFinishedAt ?? participant.questFinishedAt ?? {},
      lastProofSummary: existing?.lastProofSummary ?? participant.lastProofSummary,
      lastProofAt: existing?.lastProofAt ?? participant.lastProofAt,
    },
    ...groupQuest.participants.filter((entry) => entry.userId !== participant.userId),
  ].slice(0, MAX_PARTICIPANTS);
  return { ...groupQuest, participants };
}

export function removeParticipantFromGroupQuest(groupQuest: ServerGroupQuest, userId: string): ServerGroupQuest {
  return {
    ...groupQuest,
    participants: groupQuest.participants.filter((participant) => participant.userId !== userId),
  };
}

export function updateParticipantProgress(groupQuest: ServerGroupQuest, userId: string, patch: Partial<GroupQuestParticipant>): ServerGroupQuest {
  return {
    ...groupQuest,
    participants: groupQuest.participants.map((participant) => participant.userId === userId ? { ...participant, ...patch } : participant),
  };
}

export function buildParticipant(input: {
  userId: string;
  provider?: unknown;
  username?: unknown;
  leaderboardName?: unknown;
  wantsEmailUpdates?: unknown;
  email?: unknown;
  location?: unknown;
}): GroupQuestParticipant | null {
  const username = cleanText(input.username, 60);
  const leaderboardName = cleanText(input.leaderboardName, 60);
  if (!username || !leaderboardName) return null;
  return {
    userId: input.userId,
    provider: input.provider === "chesscom" ? "chesscom" : "lichess",
    username,
    leaderboardName,
    wantsEmailUpdates: input.wantsEmailUpdates === true,
    email: cleanText(input.email, 120),
    location: cleanText(input.location, 80),
    joinedAt: new Date().toISOString(),
    score: 0,
    completedQuestIds: [],
    questFinishedAt: {},
  };
}

function normalizeGroupQuest(value: unknown): ServerGroupQuest | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const id = cleanText(record.id, 80);
  const hostUserId = cleanText(record.hostUserId, 120);
  const name = cleanText(record.name, 64);
  if (!id || !hostUserId || !name) return null;
  return {
    id,
    hostUserId,
    hostName: cleanText(record.hostName, 80) ?? "SQC host",
    name,
    inviteCopy: cleanText(record.inviteCopy, 280) ?? defaultInviteCopy,
    inviteMode: normalizeInviteMode(record.inviteMode),
    questIds: Array.isArray(record.questIds) ? record.questIds.filter((entry): entry is string => typeof entry === "string") : ["knights-before-coffee"],
    providerMode: normalizeProviderMode(record.providerMode),
    providerLabel: cleanText(record.providerLabel, 80) ?? providerLabelFor(record.providerMode),
    startAt: cleanText(record.startAt, 40) ?? "Not set",
    endAt: cleanText(record.endAt, 40) ?? "Not set",
    rules: normalizeRules(record.rules),
    createdAt: cleanText(record.createdAt, 40) ?? new Date().toISOString(),
    participants: Array.isArray(record.participants) ? record.participants.map(normalizeParticipant).filter((entry): entry is GroupQuestParticipant => Boolean(entry)) : [],
  };
}

function normalizeParticipant(value: unknown): GroupQuestParticipant | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const userId = cleanText(record.userId, 120);
  const username = cleanText(record.username, 60);
  const leaderboardName = cleanText(record.leaderboardName, 60);
  const joinedAt = cleanText(record.joinedAt, 40);
  if (!userId || !username || !leaderboardName || !joinedAt) return null;
  return {
    userId,
    username,
    leaderboardName,
    joinedAt,
    provider: record.provider === "chesscom" ? "chesscom" : "lichess",
    wantsEmailUpdates: record.wantsEmailUpdates === true,
    email: cleanText(record.email, 120),
    location: cleanText(record.location, 80),
    score: typeof record.score === "number" && record.score >= 0 ? record.score : 0,
    completedQuestIds: Array.isArray(record.completedQuestIds) ? record.completedQuestIds.filter((entry): entry is string => typeof entry === "string") : [],
    questFinishedAt: record.questFinishedAt && typeof record.questFinishedAt === "object"
      ? (Object.fromEntries(
          Object.entries(record.questFinishedAt as Record<string, unknown>).filter(([, value]) => typeof value === "string"),
        ) as Record<string, string>)
      : {},
    lastProofSummary: cleanText(record.lastProofSummary, 240),
    lastProofAt: cleanText(record.lastProofAt, 40),
  };
}

function normalizeInviteMode(value: unknown): GroupQuestInviteMode {
  if (value === "unlisted-link" || value === "invite-only") return value;
  return "public";
}

function normalizeProviderMode(value: unknown): GroupQuestProviderMode {
  if (value === "lichess" || value === "chesscom") return value;
  return "both";
}

function providerLabelFor(value: unknown) {
  if (value === "lichess") return "Lichess only";
  if (value === "chesscom") return "Chess.com only";
  return "Lichess or Chess.com";
}

function normalizeRules(value: unknown): Record<string, string> {
  const fallback = { timeControl: "Any time control", rated: "Any rated state", color: "Any color" };
  if (!value || typeof value !== "object") return fallback;
  const record = value as Record<string, unknown>;
  return {
    timeControl: cleanText(record.timeControl, 60) ?? fallback.timeControl,
    rated: cleanText(record.rated, 60) ?? fallback.rated,
    color: cleanText(record.color, 60) ?? fallback.color,
  };
}

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().slice(0, maxLength);
  return trimmed || undefined;
}
