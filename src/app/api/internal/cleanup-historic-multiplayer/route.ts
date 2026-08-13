import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getBuiltInOfficialGroupQuests, OFFICIAL_GROUP_QUEST_METADATA_KEY } from "@/lib/groupquests";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Metadata = Record<string, unknown>;
type ClerkUser = Awaited<ReturnType<Awaited<ReturnType<typeof clerkClient>>["users"]["getUserList"]>>["data"][number];

function authorized(request: Request) {
  const token = process.env.SQC_SIGNUP_MONITOR_TOKEN;
  return Boolean(token && request.headers.get("authorization") === `Bearer ${token}`);
}

function record(value: unknown): Metadata {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Metadata : {};
}

function rows(value: unknown): Metadata[] {
  return Array.isArray(value) ? value.filter((entry): entry is Metadata => Boolean(entry && typeof entry === "object" && !Array.isArray(entry))) : [];
}

function string(value: unknown) {
  return typeof value === "string" ? value : "";
}

function isFinishedQuest(quest: Metadata, nowMs: number, currentOfficialIds: Set<string>) {
  const id = string(quest.id);
  if (!id) return false;
  if ((quest.official === true || id.startsWith("official-")) && !currentOfficialIds.has(id)) return true;
  const endMs = Date.parse(string(quest.endAt));
  return Number.isFinite(endMs) && endMs <= nowMs;
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

function inventory(users: ClerkUser[], now: Date) {
  const nowMs = now.getTime();
  const currentOfficialIds = new Set(getBuiltInOfficialGroupQuests(now).map((quest) => quest.id));
  const removedOfficialIds = new Set<string>();
  const removedCommunityIds = new Set<string>();

  for (const user of users) {
    const publicMetadata = record(user.publicMetadata);
    const official = record(publicMetadata[OFFICIAL_GROUP_QUEST_METADATA_KEY]);
    for (const id of Object.keys(official)) if (!currentOfficialIds.has(id)) removedOfficialIds.add(id);

    for (const side of [record(user.publicMetadata), record(user.privateMetadata)]) {
      for (const quest of rows(side.sqcGroupQuests)) {
        if (!isFinishedQuest(quest, nowMs, currentOfficialIds)) continue;
        const id = string(quest.id);
        if (!id) continue;
        if (quest.official === true || id.startsWith("official-")) removedOfficialIds.add(id);
        else removedCommunityIds.add(id);
      }
    }
  }

  const removedIds = new Set([...removedOfficialIds, ...removedCommunityIds]);
  const affected = users.flatMap((user) => {
    const publicMetadata = record(user.publicMetadata);
    const privateMetadata = record(user.privateMetadata);
    const official = record(publicMetadata[OFFICIAL_GROUP_QUEST_METADATA_KEY]);
    const publicGroups = rows(publicMetadata.sqcGroupQuests);
    const privateGroups = rows(privateMetadata.sqcGroupQuests);
    const likes = rows(privateMetadata.sqcCommunityLikes);
    const officialHits = Object.keys(official).filter((id) => removedOfficialIds.has(id));
    const publicGroupHits = publicGroups.filter((quest) => removedIds.has(string(quest.id)));
    const privateGroupHits = privateGroups.filter((quest) => removedIds.has(string(quest.id)));
    const likeHits = likes.filter((like) => like.targetType === "multiplayer" && removedIds.has(string(like.targetId)));
    if (!officialHits.length && !publicGroupHits.length && !privateGroupHits.length && !likeHits.length) return [];
    return [{ user, publicMetadata, privateMetadata, officialHits, publicGroupHits, privateGroupHits, likeHits }];
  });

  return { currentOfficialIds, removedOfficialIds, removedCommunityIds, removedIds, affected };
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ ok: false }, { status: 401 });
  const { users } = await allUsers();
  const now = new Date();
  const found = inventory(users, now);
  return NextResponse.json({
    ok: true,
    createdAt: now.toISOString(),
    totalUsers: users.length,
    currentOfficialIds: [...found.currentOfficialIds].sort(),
    removedOfficialIds: [...found.removedOfficialIds].sort(),
    removedCommunityIds: [...found.removedCommunityIds].sort(),
    affectedUsers: found.affected.map(({ user, publicMetadata, privateMetadata, officialHits, publicGroupHits, privateGroupHits, likeHits }) => ({
      id: user.id,
      emailAddresses: user.emailAddresses.map((entry) => entry.emailAddress),
      publicMetadata,
      privateMetadata,
      matches: { officialHits, publicGroupHits, privateGroupHits, likeHits },
    })),
    counts: {
      affectedUsers: found.affected.length,
      officialResultIds: found.removedOfficialIds.size,
      communityResultIds: found.removedCommunityIds.size,
      officialParticipationEntries: found.affected.reduce((sum, entry) => sum + entry.officialHits.length, 0),
      storedQuestCopies: found.affected.reduce((sum, entry) => sum + entry.publicGroupHits.length + entry.privateGroupHits.length, 0),
      likes: found.affected.reduce((sum, entry) => sum + entry.likeHits.length, 0),
    },
  });
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { confirm?: string };
  if (body.confirm !== "REMOVE_HISTORIC_MULTIPLAYER_RESULTS") {
    return NextResponse.json({ ok: false, message: "Confirmation missing" }, { status: 400 });
  }

  const { client, users } = await allUsers();
  const now = new Date();
  const found = inventory(users, now);
  let updatedUsers = 0;

  for (const entry of found.affected) {
    const officialDeletePatch = Object.fromEntries(entry.officialHits.map((id) => [id, null]));
    const publicGroups = rows(entry.publicMetadata.sqcGroupQuests).filter((quest) => !found.removedIds.has(string(quest.id)));
    const privateGroups = rows(entry.privateMetadata.sqcGroupQuests).filter((quest) => !found.removedIds.has(string(quest.id)));
    const likes = rows(entry.privateMetadata.sqcCommunityLikes).filter((like) => !(like.targetType === "multiplayer" && found.removedIds.has(string(like.targetId))));

    await client.users.updateUserMetadata(entry.user.id, {
      publicMetadata: {
        ...(entry.officialHits.length ? { [OFFICIAL_GROUP_QUEST_METADATA_KEY]: officialDeletePatch } : {}),
        ...(entry.publicGroupHits.length ? { sqcGroupQuests: publicGroups } : {}),
      },
      privateMetadata: {
        ...(entry.privateGroupHits.length ? { sqcGroupQuests: privateGroups } : {}),
        ...(entry.likeHits.length ? { sqcCommunityLikes: likes } : {}),
      },
    });
    updatedUsers += 1;
  }

  return NextResponse.json({
    ok: true,
    appliedAt: new Date().toISOString(),
    updatedUsers,
    removedOfficialResultIds: found.removedOfficialIds.size,
    removedCommunityResultIds: found.removedCommunityIds.size,
  });
}
