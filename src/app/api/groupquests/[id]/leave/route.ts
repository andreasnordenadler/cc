import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { compactAnalyticsStore, getAnalyticsStore } from "@/lib/analytics";
import {
  findGroupQuestById,
  isBuiltInOfficialGroupQuestHost,
  isGroupQuestFinished,
  removeParticipantFromGroupQuest,
  removeStoredGroupQuest,
  upsertHostGroupQuest,
} from "@/lib/groupquests";

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
  if (isGroupQuestFinished(found.groupQuest)) {
    return NextResponse.json({ ok: false, error: "finished" }, { status: 400 });
  }

  const joined = found.groupQuest.participants.some((participant) => participant.userId === userId);
  if (!joined) {
    return NextResponse.json({ ok: false, error: "not_joined" }, { status: 403 });
  }

  const updatedQuest = removeParticipantFromGroupQuest(found.groupQuest, userId);
  const storeOnParticipant = isBuiltInOfficialGroupQuestHost(found.userId);
  const storageUserId = storeOnParticipant ? userId : found.userId;
  const storageUser = await client.users.getUser(storageUserId);
  await client.users.updateUserMetadata(storageUserId, {
    privateMetadata: {
      ...(storageUser.privateMetadata ?? {}),
      sqcAnalytics: compactAnalyticsStore(getAnalyticsStore(storageUser.privateMetadata)),
      sqcGroupQuests: storeOnParticipant
        ? removeStoredGroupQuest(storageUser.privateMetadata, found.groupQuest.id)
        : upsertHostGroupQuest(storageUser.privateMetadata, updatedQuest),
    },
  });

  return NextResponse.json({ ok: true, href: `/groupquests/${id}` });
}
