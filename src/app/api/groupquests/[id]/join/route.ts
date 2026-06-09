import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  buildParticipant,
  findGroupQuestById,
  joinGroupQuest,
  upsertHostGroupQuest,
} from "@/lib/groupquests";
import { compactAnalyticsStore, getAnalyticsStore } from "@/lib/analytics";

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

  const participant = buildParticipant({ ...(payload as Record<string, unknown>), userId });
  if (!participant) {
    return NextResponse.json({ ok: false, error: "missing_participant" }, { status: 400 });
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

  const host = await client.users.getUser(found.userId);
  const joined = joinGroupQuest(found.groupQuest, participant);
  await client.users.updateUserMetadata(found.userId, {
    privateMetadata: {
      ...(host.privateMetadata ?? {}),
      sqcAnalytics: compactAnalyticsStore(getAnalyticsStore(host.privateMetadata)),
      sqcGroupQuests: upsertHostGroupQuest(host.privateMetadata, joined),
    },
  });

  return NextResponse.json({ ok: true, href: `/groupquests/${id}?accepted=1` });
}

function isGroupQuestFinished(groupQuest: { endAt: string }) {
  const end = Date.parse(groupQuest.endAt);
  return Number.isFinite(end) && end < Date.now();
}

function sameInviteKey(input: unknown, expected: unknown) {
  if (typeof input !== "string" || typeof expected !== "string") return false;
  return input.trim().toLowerCase() === expected.trim().toLowerCase();
}
