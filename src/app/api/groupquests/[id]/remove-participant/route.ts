import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { compactAnalyticsStore, getAnalyticsStore } from "@/lib/analytics";
import { findGroupQuestById, removeParticipantFromGroupQuest, upsertHostGroupQuest } from "@/lib/groupquests";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    return NextResponse.json({ ok: false, error: "sign_in_required" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null) as { participantUserId?: unknown } | null;
  const participantUserId = typeof payload?.participantUserId === "string" ? payload.participantUserId : "";

  if (!participantUserId) {
    return NextResponse.json({ ok: false, error: "participant_required" }, { status: 400 });
  }

  if (participantUserId === userId) {
    return NextResponse.json({ ok: false, error: "cannot_remove_self" }, { status: 400 });
  }

  const client = await clerkClient();
  const found = await findGroupQuestById(client, id);
  if (!found) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  if (found.groupQuest.hostUserId !== userId) {
    return NextResponse.json({ ok: false, error: "host_only" }, { status: 403 });
  }

  const joined = found.groupQuest.participants.some((participant) => participant.userId === participantUserId);
  if (!joined) {
    return NextResponse.json({ ok: false, error: "participant_not_found" }, { status: 404 });
  }

  const host = await client.users.getUser(found.userId);
  const updatedQuest = removeParticipantFromGroupQuest(found.groupQuest, participantUserId);
  await client.users.updateUserMetadata(found.userId, {
    privateMetadata: {
      ...(host.privateMetadata ?? {}),
      sqcAnalytics: compactAnalyticsStore(getAnalyticsStore(host.privateMetadata)),
      sqcGroupQuests: upsertHostGroupQuest(host.privateMetadata, updatedQuest),
    },
  });

  return NextResponse.json({ ok: true, href: `/groupquests/${id}` });
}
