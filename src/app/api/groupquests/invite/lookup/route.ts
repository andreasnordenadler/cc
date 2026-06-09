import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { findGroupQuestByInviteKey } from "@/lib/groupquests";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "sign_in_required" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null) as { inviteKey?: unknown } | null;
  const inviteKey = typeof payload?.inviteKey === "string" ? payload.inviteKey.trim() : "";
  if (!inviteKey) {
    return NextResponse.json({ ok: false, error: "missing_invite_key" }, { status: 400 });
  }

  const client = await clerkClient();
  const found = await findGroupQuestByInviteKey(client, inviteKey);
  if (!found || found.groupQuest.inviteMode !== "private-key") {
    return NextResponse.json({ ok: false, error: "invite_not_found" }, { status: 404 });
  }

  if (isGroupQuestFinished(found.groupQuest)) {
    return NextResponse.json({ ok: false, error: "groupquest_finished" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, href: `/groupquests/${found.groupQuest.id}?inviteKey=${encodeURIComponent(inviteKey)}` });
}

function isGroupQuestFinished(groupQuest: { endAt: string }) {
  const end = Date.parse(groupQuest.endAt);
  return Number.isFinite(end) && end < Date.now();
}
