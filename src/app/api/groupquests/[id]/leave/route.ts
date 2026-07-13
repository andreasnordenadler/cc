import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { compactAnalyticsStore, getAnalyticsStore } from "@/lib/analytics";
import {
  OFFICIAL_GROUP_QUEST_METADATA_KEY,
  findGroupQuestById,
  isBuiltInOfficialGroupQuestHost,
  isGroupQuestFinished,
  removeOfficialGroupQuestParticipation,
  removeParticipantFromGroupQuest,
  upsertHostGroupQuest,
} from "@/lib/groupquests";

type OfficialLeaveMetadataClient = {
  users: {
    updateUserMetadata: (userId: string, metadata: Record<string, unknown>) => Promise<unknown>;
  };
};

export async function saveWebOfficialQuestLeave(client: OfficialLeaveMetadataClient, userId: string, groupQuestId: string) {
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      [OFFICIAL_GROUP_QUEST_METADATA_KEY]: removeOfficialGroupQuestParticipation({}, groupQuestId),
    },
  });
}

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
  if (storeOnParticipant) {
    await saveWebOfficialQuestLeave(client, storageUserId, found.groupQuest.id);
  } else {
    await client.users.updateUserMetadata(storageUserId, {
      privateMetadata: {
        ...(storageUser.privateMetadata ?? {}),
        sqcAnalytics: compactAnalyticsStore(getAnalyticsStore(storageUser.privateMetadata)),
        sqcGroupQuests: upsertHostGroupQuest(storageUser.privateMetadata, updatedQuest),
      },
    });
  }

  return NextResponse.json({ ok: true, href: `/groupquests/${id}` });
}
