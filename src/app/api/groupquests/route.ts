import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { buildGroupQuest, upsertHostGroupQuest } from "@/lib/groupquests";
import { getPreferredRunnerName, type UserMetadataRecord } from "@/lib/user-metadata";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "sign_in_required" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const hostName = getPreferredRunnerName((user.publicMetadata as UserMetadataRecord) ?? {}, {
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    emailAddress: user.primaryEmailAddress?.emailAddress,
  }) || "SQC host";
  const groupQuest = buildGroupQuest({
    ...(payload as Record<string, unknown>),
    hostUserId: userId,
    hostName,
  });

  await client.users.updateUserMetadata(userId, {
    privateMetadata: {
      ...(user.privateMetadata ?? {}),
      sqcGroupQuests: upsertHostGroupQuest(user.privateMetadata, groupQuest),
    },
  });

  return NextResponse.json({ ok: true, id: groupQuest.id, href: `/groupquests/${groupQuest.id}` });
}
