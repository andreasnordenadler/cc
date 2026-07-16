import { buildGroupQuest, buildParticipant, upsertHostGroupQuest } from "./groupquests";
import { compactAnalyticsStore, getAnalyticsStore } from "./analytics";
import { getChallengeById } from "./challenges";
import { getCustomSideQuests, parseCustomRuleConfig, type CustomSideQuest } from "./custom-side-quests";
import { getChessComUsername, getLichessUsername, getPreferredRunnerName, type UserMetadataRecord } from "./user-metadata";
import { validateMultiplayerProofConfiguration } from "./multiplayer-proof-rules";

type CreateUser = { id: string; firstName?: string | null; lastName?: string | null; username?: string | null; primaryEmailAddress?: { emailAddress?: string | null } | null; publicMetadata?: unknown; privateMetadata?: unknown };
export type GroupQuestCreateDependencies = {
  getAuthenticatedUserId: () => Promise<string | null>;
  getUser: (id: string) => Promise<CreateUser>;
  findPublicCustomQuestById: (id: string) => Promise<CustomSideQuest | null>;
  savePrivateMetadata: (id: string, metadata: UserMetadataRecord) => Promise<void>;
  now?: () => Date;
  makeId?: () => string;
};

export async function handleGroupQuestCreateRequest(request: Request, dependencies: GroupQuestCreateDependencies): Promise<Response> {
  const userId = await dependencies.getAuthenticatedUserId().catch(() => null);
  if (!userId) return Response.json({ ok: false, error: "sign_in_required" }, { status: 401 });
  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return Response.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  const input = payload as Record<string, unknown>;
  const proofConfiguration = validateMultiplayerProofConfiguration(input);
  if (!proofConfiguration.ok) return Response.json({ ok: false, error: proofConfiguration.code }, { status: 400 });
  try {
    const user = await dependencies.getUser(userId);
    const selection = await buildSelection(input.questIds, user.privateMetadata, user.publicMetadata, dependencies.findPublicCustomQuestById);
    if (selection.error) return Response.json({ ok: false, error: selection.error }, { status: 400 });
    const publicMetadata = (user.publicMetadata && typeof user.publicMetadata === "object" ? user.publicMetadata : {}) as UserMetadataRecord;
    const privateMetadata = (user.privateMetadata && typeof user.privateMetadata === "object" ? user.privateMetadata : {}) as UserMetadataRecord;
    const hostName = getPreferredRunnerName(publicMetadata, { firstName: user.firstName, lastName: user.lastName, username: user.username, emailAddress: user.primaryEmailAddress?.emailAddress }) || "SQC host";
    const now = (dependencies.now?.() ?? new Date()).toISOString();
    const normalized = normalizeSchedulePayload({ ...input, ...proofConfiguration }, now);
    const groupQuest = buildGroupQuest({ ...normalized, questIds: selection.questIds, customQuestSnapshots: selection.customQuestSnapshots, hostUserId: userId, hostName });
    groupQuest.id = dependencies.makeId?.() ?? groupQuest.id;
    groupQuest.createdAt = now;
    const lichess = getLichessUsername(publicMetadata); const chesscom = getChessComUsername(publicMetadata);
    const provider = groupQuest.providerMode === "chesscom" ? (chesscom ? "chesscom" : lichess ? "lichess" : undefined) : (lichess ? "lichess" : chesscom ? "chesscom" : undefined);
    const participant = provider ? buildParticipant({ userId, provider, username: provider === "lichess" ? lichess : chesscom, leaderboardName: hostName }) : null;
    if (participant) { participant.joinedAt = now; groupQuest.participants = [participant]; }
    await dependencies.savePrivateMetadata(userId, { ...privateMetadata, sqcAnalytics: compactAnalyticsStore(getAnalyticsStore(privateMetadata)), sqcGroupQuests: upsertHostGroupQuest(privateMetadata, groupQuest) });
    return Response.json({ ok: true, id: groupQuest.id, href: `/groupquests/${groupQuest.id}${participant ? "?accepted=1" : ""}` });
  } catch {
    return Response.json({ ok: false, error: "groupquest_save_failed" }, { status: 503 });
  }
}

async function buildSelection(raw: unknown, privateMetadata: unknown, publicMetadata: unknown, findPublic: (id: string) => Promise<CustomSideQuest | null>) {
  if (!Array.isArray(raw)) return { questIds: undefined, customQuestSnapshots: [] };
  const ids = Array.from(new Set(raw.filter((id): id is string => typeof id === "string" && id.length > 0))).slice(0, 8);
  if (!ids.length) return { error: "Choose at least one Side Quest for this Multiplayer lineup." };
  const privateQuests = getCustomSideQuests(privateMetadata as Record<string, unknown>);
  const ownedQuests = privateQuests.length ? privateQuests : getCustomSideQuests(publicMetadata as Record<string, unknown>);
  const owned = new Map(ownedQuests.map(q => [q.id, q]));
  const snapshots = [];
  for (const id of ids) {
    if (getChallengeById(id)) continue;
    const quest = owned.get(id) ?? await findPublic(id);
    if (!quest) return { error: "Only official, public community-created, or your own saved custom Side Quests can be added to multiplayer." };
    if ((quest.lifecycle ?? "published") !== "published") return { error: `${quest.title} must be published before it can be used in multiplayer.` };
    if (!parseCustomRuleConfig(quest.config)?.blocks.length) return { error: `${quest.title} needs a launch-ready custom rule before it can be used in multiplayer.` };
    snapshots.push({ id: quest.id, title: quest.title, summary: quest.summary, config: quest.config, badgeImageUrl: quest.badgeImageUrl ?? null, reward: 100 });
  }
  return { questIds: ids, customQuestSnapshots: snapshots };
}
function normalizeSchedulePayload(payload: Record<string, unknown>, now: string) {
  const date = (value: unknown) => { if (typeof value !== "string" || !value.trim()) return undefined; const parsed = new Date(value.trim()); return Number.isNaN(parsed.getTime()) ? value.trim() : parsed.toISOString(); };
  return { ...payload, startAt: payload.openImmediately === true ? now : (date(payload.startAt) ?? payload.startAt), endAt: date(payload.endAt) ?? payload.endAt };
}
