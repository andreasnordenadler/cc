export type GroupQuestInviteMode = "public" | "unlisted-link" | "private-key";
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
  inviteKey?: string;
  questIds: string[];
  providerMode: GroupQuestProviderMode;
  providerLabel: string;
  official?: boolean;
  officialLabel?: string;
  customQuestSnapshots?: GroupQuestCustomQuestSnapshot[];
  startAt: string;
  endAt: string;
  rules: Record<string, string>;
  createdAt: string;
  participants: GroupQuestParticipant[];
};

export type GroupQuestCustomQuestSnapshot = {
  id: string;
  title: string;
  summary: string;
  config: string;
  badgeImageUrl?: string | null;
  reward?: number;
};

export type GroupQuestHostRecord = {
  userId: string;
  groupQuest: ServerGroupQuest;
};

const MAX_HOST_QUESTS = 4;
const MAX_PARTICIPANTS = 80;
const defaultInviteCopy = "A shared Multiplayer Side Quest where every player proves the same bad idea with fresh public games.";
const defaultRules = { timeControl: "Any time control", rated: "Any rated state", color: "Any color" };

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
  inviteKey?: unknown;
  questIds?: unknown;
  providerMode?: unknown;
  providerLabel?: unknown;
  customQuestSnapshots?: unknown;
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
    inviteKey: cleanInviteKey(input.inviteKey) ?? makeInviteKey(name),
    questIds: questIds.length ? questIds : ["knights-before-coffee"],
    providerMode: normalizeProviderMode(input.providerMode),
    providerLabel: cleanText(input.providerLabel, 80) ?? providerLabelFor(input.providerMode),
    official: false,
    customQuestSnapshots: normalizeCustomQuestSnapshots(input.customQuestSnapshots),
    startAt: cleanText(input.startAt, 40) ?? now,
    endAt: cleanText(input.endAt, 40) ?? now,
    rules: normalizeRules(input.rules),
    createdAt: now,
    participants: [],
  };
}

export async function findGroupQuestById(
  client: { users: { getUserList: (params: { limit: number; offset?: number; orderBy?: "-created_at" }) => Promise<{ data: Array<{ id: string; privateMetadata: unknown }> }> } },
  id: string,
): Promise<GroupQuestHostRecord | null> {
  let offset = 0;
  while (true) {
    const users = await client.users.getUserList({ limit: 100, offset, orderBy: "-created_at" });
    for (const user of users.data) {
      const quests = getStoredGroupQuests(user.privateMetadata);
      const groupQuest = quests.find((quest) => quest.id === id);
      if (groupQuest) return { userId: user.id, groupQuest };
    }
    if (users.data.length < 100) return null;
    offset += users.data.length;
  }
}

export async function findGroupQuestByInviteKey(
  client: { users: { getUserList: (params: { limit: number; offset?: number; orderBy?: "-created_at" }) => Promise<{ data: Array<{ id: string; privateMetadata: unknown }> }> } },
  inviteKey: string,
): Promise<GroupQuestHostRecord | null> {
  const normalizedKey = cleanInviteKey(inviteKey);
  if (!normalizedKey) return null;

  let offset = 0;
  while (true) {
    const users = await client.users.getUserList({ limit: 100, offset, orderBy: "-created_at" });
    for (const user of users.data) {
      const quests = getStoredGroupQuests(user.privateMetadata);
      const groupQuest = quests.find((quest) => cleanInviteKey(quest.inviteKey) === normalizedKey);
      if (groupQuest) return { userId: user.id, groupQuest };
    }
    if (users.data.length < 100) return null;
    offset += users.data.length;
  }
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
  return [groupQuest, ...existing].slice(0, MAX_HOST_QUESTS).map(compactGroupQuestForStorage);
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


function compactGroupQuestForStorage(groupQuest: ServerGroupQuest) {
  const providerMode = groupQuest.providerMode === "lichess" || groupQuest.providerMode === "chesscom" ? groupQuest.providerMode : "both";
  const rules = normalizeRules(groupQuest.rules);
  const hasCustomRules = rules.timeControl !== defaultRules.timeControl || rules.rated !== defaultRules.rated || rules.color !== defaultRules.color;
  return {
    id: groupQuest.id,
    hostUserId: groupQuest.hostUserId,
    hostName: groupQuest.hostName,
    name: groupQuest.name,
    ...(groupQuest.inviteCopy && groupQuest.inviteCopy !== defaultInviteCopy ? { inviteCopy: groupQuest.inviteCopy } : {}),
    inviteMode: groupQuest.inviteMode,
    ...(groupQuest.inviteMode === "private-key" && groupQuest.inviteKey ? { inviteKey: groupQuest.inviteKey } : {}),
    questIds: groupQuest.questIds.slice(0, 8),
    providerMode,
    ...(providerMode !== "both" ? { providerLabel: providerLabelFor(providerMode) } : {}),
    ...(hasCustomRules ? { rules } : {}),
    ...(groupQuest.official ? { official: true, officialLabel: groupQuest.officialLabel } : {}),
    ...(groupQuest.customQuestSnapshots?.length ? { customQuestSnapshots: groupQuest.customQuestSnapshots.slice(0, 8).map(compactCustomQuestSnapshot) } : {}),
    startAt: groupQuest.startAt,
    endAt: groupQuest.endAt,
    createdAt: groupQuest.createdAt,
    participants: groupQuest.participants.slice(0, MAX_PARTICIPANTS).map((participant) => ({
      userId: participant.userId,
      provider: participant.provider,
      username: participant.username,
      leaderboardName: participant.leaderboardName,
      joinedAt: participant.joinedAt,
      ...(participant.score ? { score: participant.score } : {}),
      ...(participant.completedQuestIds?.length ? { completedQuestIds: participant.completedQuestIds.slice(0, 8) } : {}),
      ...(participant.questFinishedAt && Object.keys(participant.questFinishedAt).length ? { questFinishedAt: participant.questFinishedAt } : {}),
      ...(participant.lastProofSummary ? { lastProofSummary: participant.lastProofSummary.slice(0, 120) } : {}),
      ...(participant.lastProofAt ? { lastProofAt: participant.lastProofAt } : {}),
    })),
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
    inviteKey: cleanInviteKey(record.inviteKey),
    questIds: Array.isArray(record.questIds) ? record.questIds.filter((entry): entry is string => typeof entry === "string") : ["knights-before-coffee"],
    providerMode: normalizeProviderMode(record.providerMode),
    providerLabel: cleanText(record.providerLabel, 80) ?? providerLabelFor(record.providerMode),
    official: record.official === true,
    officialLabel: cleanText(record.officialLabel, 80),
    customQuestSnapshots: normalizeCustomQuestSnapshots(record.customQuestSnapshots),
    startAt: cleanText(record.startAt, 40) ?? "Not set",
    endAt: cleanText(record.endAt, 40) ?? "Not set",
    rules: normalizeRules(record.rules),
    createdAt: cleanText(record.createdAt, 40) ?? new Date().toISOString(),
    participants: Array.isArray(record.participants) ? record.participants.map(normalizeParticipant).filter((entry): entry is GroupQuestParticipant => Boolean(entry)) : [],
  };
}

function compactCustomQuestSnapshot(snapshot: GroupQuestCustomQuestSnapshot) {
  return {
    id: snapshot.id,
    title: snapshot.title,
    summary: snapshot.summary,
    config: snapshot.config,
    ...(snapshot.badgeImageUrl ? { badgeImageUrl: snapshot.badgeImageUrl } : {}),
    ...(snapshot.reward ? { reward: snapshot.reward } : {}),
  };
}

function normalizeCustomQuestSnapshots(value: unknown): GroupQuestCustomQuestSnapshot[] {
  if (!Array.isArray(value)) return [];
  return value.map(normalizeCustomQuestSnapshot).filter((snapshot): snapshot is GroupQuestCustomQuestSnapshot => Boolean(snapshot)).slice(0, 8);
}

function normalizeCustomQuestSnapshot(value: unknown): GroupQuestCustomQuestSnapshot | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const id = cleanText(record.id, 100);
  const title = cleanText(record.title, 80);
  const config = cleanText(record.config, 3000);
  if (!id || !title || !config) return null;
  return {
    id,
    title,
    summary: cleanText(record.summary, 500) ?? "Custom Side Quest rule",
    config,
    badgeImageUrl: cleanText(record.badgeImageUrl, 240) ?? null,
    reward: typeof record.reward === "number" && record.reward > 0 ? Math.min(record.reward, 500) : 100,
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
  if (value === "private-key") return value;
  if (value === "unlisted-link") return value;
  return "public";
}

function makeInviteKey(name: string) {
  const safe = name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 8) || "sqc";
  return `${safe}-${Math.random().toString(36).slice(2, 8)}`;
}

function cleanInviteKey(value: unknown) {
  return cleanText(value, 40)?.toLowerCase().replace(/[^a-z0-9-]/g, "") || undefined;
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
  if (!value || typeof value !== "object") return defaultRules;
  const record = value as Record<string, unknown>;
  return {
    timeControl: cleanText(record.timeControl, 60) ?? defaultRules.timeControl,
    rated: cleanText(record.rated, 60) ?? defaultRules.rated,
    color: cleanText(record.color, 60) ?? defaultRules.color,
    ...(cleanText(record.customRuleSummary, 180) ? { customRuleSummary: cleanText(record.customRuleSummary, 180) as string } : {}),
    ...(cleanText(record.customRuleConfig, 800) ? { customRuleConfig: cleanText(record.customRuleConfig, 800) as string } : {}),
  };
}

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().slice(0, maxLength);
  return trimmed || undefined;
}
