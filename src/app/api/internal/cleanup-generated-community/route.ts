import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TARGET_EMAILS = new Set([
  "andreas.nordenadler@gmail.com",
  "samnordbot@gmail.com",
  "samnordbot+googleplay@gmail.com",
]);
const SEED_RUN = "2026-06-04-realistic-community-v1";

type RecordValue = Record<string, unknown>;
type ClerkUser = Awaited<ReturnType<Awaited<ReturnType<typeof clerkClient>>["users"]["getUserList"]>>["data"][number];

function authorized(request: Request) {
  const token = process.env.SQC_SIGNUP_MONITOR_TOKEN;
  return Boolean(token && request.headers.get("authorization") === `Bearer ${token}`);
}

function record(value: unknown): RecordValue {
  return value && typeof value === "object" && !Array.isArray(value) ? value as RecordValue : {};
}

function array(value: unknown): RecordValue[] {
  return Array.isArray(value) ? value.filter((entry): entry is RecordValue => Boolean(entry && typeof entry === "object")) : [];
}

function emails(user: ClerkUser) {
  return user.emailAddresses.map((entry) => entry.emailAddress.toLowerCase());
}

function isGeneratedSeedUser(user: ClerkUser) {
  const publicMetadata = record(user.publicMetadata);
  const privateMetadata = record(user.privateMetadata);
  return publicMetadata.sqcSeedUser === true
    || privateMetadata.sqcSeedUser === true
    || publicMetadata.sqcSeedRun === SEED_RUN
    || privateMetadata.sqcSeedRun === SEED_RUN
    || emails(user).some((email) => /^sqcseed\d+@example\.com$/.test(email));
}

function isTargetAccount(user: ClerkUser) {
  return emails(user).some((email) => TARGET_EMAILS.has(email));
}

async function allUsers() {
  const client = await clerkClient();
  const users: ClerkUser[] = [];
  for (let offset = 0; ; offset += 100) {
    const page = await client.users.getUserList({ limit: 100, offset, orderBy: "-created_at" });
    users.push(...page.data);
    if (page.data.length < 100) break;
  }
  return { client, users };
}

function questIds(metadata: RecordValue) {
  return new Set(array(metadata.customSideQuests).map((quest) => String(quest.id ?? "")).filter(Boolean));
}

function groupIds(metadata: RecordValue) {
  return new Set(array(metadata.sqcGroupQuests).filter((quest) => quest.official !== true && !String(quest.id ?? "").startsWith("official-")).map((quest) => String(quest.id ?? "")).filter(Boolean));
}

function challengeId(entry: RecordValue) {
  if (typeof entry.challengeId === "string") return entry.challengeId;
  if (typeof entry.id === "string") return entry.id.split(":")[0];
  return "";
}

function cleanTargetMetadata(metadata: RecordValue, removedQuestIds: Set<string>, privateSide: boolean) {
  const next = structuredClone(metadata) as RecordValue;
  next.customSideQuests = [];
  if (privateSide) {
    next.sqcGroupQuests = array(next.sqcGroupQuests).filter((quest) => quest.official === true || String(quest.id ?? "").startsWith("official-"));
  }
  const active = record(next.activeChallenge);
  if (removedQuestIds.has(String(active.id ?? ""))) delete next.activeChallenge;
  if (Array.isArray(next.challengeAttempts)) next.challengeAttempts = array(next.challengeAttempts).filter((attempt) => !removedQuestIds.has(challengeId(attempt)));
  const progress = record(next.challengeProgress);
  if (Array.isArray(progress.completedChallengeIds)) {
    const completedChallengeIds = progress.completedChallengeIds.filter((id): id is string => typeof id === "string" && !removedQuestIds.has(id));
    next.challengeProgress = { ...progress, completedChallengeIds, totalCompletedChallenges: completedChallengeIds.length };
  }
  return next;
}

function cleanReferences(metadata: RecordValue, removedQuestIds: Set<string>, removedGroupIds: Set<string>, removedUserIds: Set<string>) {
  const next = structuredClone(metadata) as RecordValue;
  if (Array.isArray(next.sqcCommunityLikes)) {
    next.sqcCommunityLikes = array(next.sqcCommunityLikes).filter((like) => {
      const id = String(like.targetId ?? "");
      return like.targetType === "multiplayer" ? !removedGroupIds.has(id) : !removedQuestIds.has(id);
    });
  }
  if (Array.isArray(next.sqcGroupQuests)) {
    next.sqcGroupQuests = array(next.sqcGroupQuests).flatMap((group) => {
      const id = String(group.id ?? "");
      if (removedGroupIds.has(id) || removedUserIds.has(String(group.hostUserId ?? ""))) return [];
      const participants = array(group.participants).filter((participant) => !removedUserIds.has(String(participant.userId ?? "")));
      return [{ ...group, participants }];
    });
  }
  return next;
}

function inventory(users: ClerkUser[]) {
  const generated = users.filter(isGeneratedSeedUser);
  const targets = users.filter(isTargetAccount);
  const generatedQuestIds = new Set<string>();
  const generatedGroupIds = new Set<string>();
  for (const user of generated) {
    for (const id of [...questIds(record(user.publicMetadata)), ...questIds(record(user.privateMetadata))]) generatedQuestIds.add(id);
    for (const id of [...groupIds(record(user.publicMetadata)), ...groupIds(record(user.privateMetadata))]) generatedGroupIds.add(id);
  }
  const targetRows = targets.map((user) => {
    const publicMetadata = record(user.publicMetadata);
    const privateMetadata = record(user.privateMetadata);
    const ids = new Set([...questIds(publicMetadata), ...questIds(privateMetadata)]);
    for (const id of ids) generatedQuestIds.add(id);
    for (const id of [...groupIds(publicMetadata), ...groupIds(privateMetadata)]) generatedGroupIds.add(id);
    return { user, ids, publicMetadata, privateMetadata };
  });
  return { generated, targets: targetRows, generatedQuestIds, generatedGroupIds };
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ ok: false }, { status: 401 });
  const { users } = await allUsers();
  const found = inventory(users);
  return NextResponse.json({
    ok: true,
    createdAt: new Date().toISOString(),
    totalUsers: users.length,
    generatedAccounts: found.generated.map((user) => ({ id: user.id, emails: emails(user), publicMetadata: user.publicMetadata, privateMetadata: user.privateMetadata })),
    targetAccounts: found.targets.map(({ user, publicMetadata, privateMetadata }) => ({ id: user.id, emails: emails(user), publicMetadata, privateMetadata })),
    counts: { generatedAccounts: found.generated.length, targetAccounts: found.targets.length, removedSoloQuestIds: found.generatedQuestIds.size, removedMultiplayerQuestIds: found.generatedGroupIds.size },
  });
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { confirm?: string };
  if (body.confirm !== "REMOVE_GENERATED_COMMUNITY_CONTENT") return NextResponse.json({ ok: false, message: "Confirmation missing" }, { status: 400 });
  const { client, users } = await allUsers();
  const found = inventory(users);
  const removedUserIds = new Set(found.generated.map((user) => user.id));

  for (const target of found.targets) {
    await client.users.updateUserMetadata(target.user.id, {
      publicMetadata: cleanTargetMetadata(target.publicMetadata, target.ids, false),
      privateMetadata: cleanTargetMetadata(target.privateMetadata, target.ids, true),
    });
  }

  for (const user of users) {
    if (removedUserIds.has(user.id)) continue;
    const publicMetadata = cleanReferences(record(user.publicMetadata), found.generatedQuestIds, found.generatedGroupIds, removedUserIds);
    const privateMetadata = cleanReferences(record(user.privateMetadata), found.generatedQuestIds, found.generatedGroupIds, removedUserIds);
    await client.users.updateUserMetadata(user.id, { publicMetadata, privateMetadata });
  }

  for (const user of found.generated) await client.users.deleteUser(user.id);

  return NextResponse.json({
    ok: true,
    appliedAt: new Date().toISOString(),
    deletedGeneratedAccounts: found.generated.length,
    cleanedTargetAccounts: found.targets.length,
    removedSoloQuestIds: found.generatedQuestIds.size,
    removedMultiplayerQuestIds: found.generatedGroupIds.size,
  });
}
