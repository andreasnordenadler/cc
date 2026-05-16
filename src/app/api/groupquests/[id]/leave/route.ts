import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { compactAnalyticsStore, getAnalyticsStore } from "@/lib/analytics";
import { findGroupQuestById, removeParticipantFromGroupQuest, upsertHostGroupQuest } from "@/lib/groupquests";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    return NextResponse.json({ ok: false, error: "sign_in_required" }, { status: 401 });
  }

  const client = await clerkClient();
  const found = await findGroupQuestById(client, id);
  if (!found) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const joined = found.groupQuest.participants.some((participant) => participant.userId === userId);
  if (!joined) {
    return NextResponse.json({ ok: false, error: "not_joined" }, { status: 403 });
  }

  const host = await client.users.getUser(found.userId);
  const updatedQuest = removeParticipantFromGroupQuest(found.groupQuest, userId);
  await client.users.updateUserMetadata(found.userId, {
    privateMetadata: {
      ...(host.privateMetadata ?? {}),
      sqcAnalytics: compactAnalyticsStore(getAnalyticsStore(host.privateMetadata)),
      sqcGroupQuests: upsertHostGroupQuest(host.privateMetadata, updatedQuest),
    },
  });

  return NextResponse.json({ ok: true, href: `/groupquests/${id}` });
}
