import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  buildParticipant,
  findGroupQuestById,
  isBuiltInOfficialGroupQuestHost,
  isGroupQuestFinished,
  joinGroupQuest,
  upsertHostGroupQuest,
  upsertParticipantGroupQuest,
} from "@/lib/groupquests";
import { compactAnalyticsStore, getAnalyticsStore } from "@/lib/analytics";
import {
  getChessComUsername,
  getLichessUsername,
  getPreferredRunnerName,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    return NextResponse.json({ ok: false, error: "sign_in_required" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const client = await clerkClient();
  const found = await findGroupQuestById(client, id);
  if (!found) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  if (isGroupQuestFinished(found.groupQuest)) {
    return NextResponse.json({ ok: false, error: "groupquest_finished" }, { status: 400 });
  }

  if (found.groupQuest.inviteMode === "private-key" && !sameInviteKey((payload as Record<string, unknown>).inviteKey, found.groupQuest.inviteKey)) {
    return NextResponse.json({ ok: false, error: "invite_key_required" }, { status: 403 });
  }

  const sessionUser = await client.users.getUser(userId);
  const metadata = sessionUser.publicMetadata ? sessionUser.publicMetadata as UserMetadataRecord : {};
  const lichessUsername = getLichessUsername(metadata);
  const chessComUsername = getChessComUsername(metadata);
  const provider = found.groupQuest.providerMode === "chesscom"
    ? "chesscom"
    : found.groupQuest.providerMode === "lichess"
      ? "lichess"
      : lichessUsername
        ? "lichess"
        : "chesscom";
  const username = provider === "lichess" ? lichessUsername : chessComUsername;
  const leaderboardName = getPreferredRunnerName(metadata, {
    firstName: sessionUser.firstName,
    lastName: sessionUser.lastName,
    username: sessionUser.username,
    emailAddress: sessionUser.primaryEmailAddress?.emailAddress,
  });
  const participant = buildParticipant({ userId, provider, username, leaderboardName });
  if (!participant) {
    return NextResponse.json({ ok: false, error: "missing_participant" }, { status: 400 });
  }

  const joined = joinGroupQuest(found.groupQuest, participant);
  const storeOnParticipant = isBuiltInOfficialGroupQuestHost(found.userId);
  const storageUserId = storeOnParticipant ? userId : found.userId;
  const storageUser = await client.users.getUser(storageUserId);
  await client.users.updateUserMetadata(storageUserId, {
    privateMetadata: {
      ...(storageUser.privateMetadata ?? {}),
      sqcAnalytics: compactAnalyticsStore(getAnalyticsStore(storageUser.privateMetadata)),
      sqcGroupQuests: storeOnParticipant
        ? upsertParticipantGroupQuest(storageUser.privateMetadata, joined, userId)
        : upsertHostGroupQuest(storageUser.privateMetadata, joined),
    },
  });

  return NextResponse.json({ ok: true, href: `/groupquests/${id}?accepted=1` });
}

function sameInviteKey(input: unknown, expected: unknown) {
  if (typeof input !== "string" || typeof expected !== "string") return false;
  return input.trim().toLowerCase() === expected.trim().toLowerCase();
}
