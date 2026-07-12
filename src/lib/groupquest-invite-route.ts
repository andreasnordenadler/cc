import { isGroupQuestFinished, type GroupQuestHostRecord } from "@/lib/groupquests";

export type GroupQuestInviteLookupDependencies = {
  getAuthenticatedUserId: () => Promise<string | null>;
  findQuestByInviteKey: (inviteKey: string) => Promise<GroupQuestHostRecord | null>;
};

export async function handleInviteLookupRequest(request: Request, dependencies: GroupQuestInviteLookupDependencies): Promise<Response> {
  const userId = await dependencies.getAuthenticatedUserId();
  if (!userId) return Response.json({ ok: false, error: "sign_in_required" }, { status: 401 });

  const payload = await request.json().catch(() => null) as { inviteKey?: unknown } | null;
  const inviteKey = typeof payload?.inviteKey === "string" ? payload.inviteKey.trim() : "";
  if (!inviteKey) return Response.json({ ok: false, error: "missing_invite_key" }, { status: 400 });

  const found = await dependencies.findQuestByInviteKey(inviteKey);
  if (!found || found.groupQuest.inviteMode !== "private-key") {
    return Response.json({ ok: false, error: "invite_not_found" }, { status: 404 });
  }
  if (isGroupQuestFinished(found.groupQuest)) {
    return Response.json({ ok: false, error: "groupquest_finished" }, { status: 400 });
  }
  return Response.json({ ok: true, href: `/groupquests/${encodeURIComponent(found.groupQuest.id)}?inviteKey=${encodeURIComponent(inviteKey)}` });
}
