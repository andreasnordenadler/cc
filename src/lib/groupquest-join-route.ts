import {
  buildParticipant,
  isGroupQuestFinished,
  joinGroupQuest,
  type GroupQuestHostRecord,
  type ServerGroupQuest,
} from "@/lib/groupquests";
import { getChessComUsername, getLichessUsername, getPreferredRunnerName, type UserMetadataRecord } from "@/lib/user-metadata";

type ClerkUserForJoin = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  primaryEmailAddress?: { emailAddress?: string | null } | null;
  publicMetadata?: unknown;
  privateMetadata?: unknown;
};

export type GroupQuestJoinDependencies = {
  getAuthenticatedUserId: () => Promise<string | null>;
  findQuestById: (id: string) => Promise<GroupQuestHostRecord | null>;
  getUser: (id: string) => Promise<ClerkUserForJoin>;
  saveJoinedQuest: (input: {
    authenticatedUserId: string;
    hostUserId: string;
    joinedQuest: ServerGroupQuest;
  }) => Promise<void>;
};

export async function handleGroupQuestJoinRequest(
  request: Request,
  routeQuestId: string,
  dependencies: GroupQuestJoinDependencies,
): Promise<Response> {
  const userId = await dependencies.getAuthenticatedUserId();
  if (!userId) return Response.json({ ok: false, error: "sign_in_required" }, { status: 401 });

  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return Response.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const found = await dependencies.findQuestById(routeQuestId);
  if (!found) return Response.json({ ok: false, error: "not_found" }, { status: 404 });
  if (isGroupQuestFinished(found.groupQuest)) {
    return Response.json({ ok: false, error: "groupquest_finished" }, { status: 400 });
  }
  if (found.groupQuest.inviteMode === "private-key" && !sameInviteKey((payload as Record<string, unknown>).inviteKey, found.groupQuest.inviteKey)) {
    return Response.json({ ok: false, error: "invite_key_required" }, { status: 403 });
  }

  const sessionUser = await dependencies.getUser(userId);
  const metadata = sessionUser.publicMetadata && typeof sessionUser.publicMetadata === "object"
    ? sessionUser.publicMetadata as UserMetadataRecord
    : {};
  const lichessUsername = getLichessUsername(metadata);
  const chessComUsername = getChessComUsername(metadata);
  const provider = found.groupQuest.providerMode === "chesscom"
    ? "chesscom"
    : found.groupQuest.providerMode === "lichess"
      ? "lichess"
      : lichessUsername ? "lichess" : "chesscom";
  const participant = buildParticipant({
    userId,
    provider,
    username: provider === "lichess" ? lichessUsername : chessComUsername,
    leaderboardName: getPreferredRunnerName(metadata, {
      firstName: sessionUser.firstName,
      lastName: sessionUser.lastName,
      username: sessionUser.username,
      emailAddress: sessionUser.primaryEmailAddress?.emailAddress,
    }),
  });
  if (!participant) return Response.json({ ok: false, error: "missing_participant" }, { status: 400 });

  await dependencies.saveJoinedQuest({
    authenticatedUserId: userId,
    hostUserId: found.userId,
    joinedQuest: joinGroupQuest(found.groupQuest, participant),
  });
  return Response.json({ ok: true, href: `/groupquests/${encodeURIComponent(routeQuestId)}?accepted=1` });
}

function sameInviteKey(input: unknown, expected: unknown) {
  return typeof input === "string" && typeof expected === "string"
    && input.trim().toLowerCase() === expected.trim().toLowerCase();
}
