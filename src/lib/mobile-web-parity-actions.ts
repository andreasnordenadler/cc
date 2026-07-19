type CommunitySoloPickInput = {
  questId: string;
  signedIn: boolean;
  activeQuestId?: string | null;
};

type MultiplayerJoinInput = {
  questId: string;
  signedIn: boolean;
  status: "Not joined" | "Joined" | "Hosted";
};

function detailPath(prefix: string, id: string) {
  return `${prefix}/${encodeURIComponent(id)}`;
}

function signInPath(returnPath: string) {
  return `/sign-in?redirect_url=${encodeURIComponent(returnPath)}`;
}

export function getCommunitySoloPickState({ questId, signedIn, activeQuestId }: CommunitySoloPickInput) {
  const href = detailPath("/challenges/community", questId);
  if (!signedIn) return { kind: "signed-out" as const, href: signInPath(href), label: "Sign in" };
  if (activeQuestId === questId) return { kind: "active" as const, href, label: "Active Side Quest" };
  return { kind: "pick" as const, label: "Pick this Side Quest" };
}

export function getMultiplayerJoinState({ questId, signedIn, status }: MultiplayerJoinInput) {
  const href = detailPath("/groupquests", questId);
  if (!signedIn) return { kind: "signed-out" as const, href: signInPath(href), label: "Sign in to join" };
  if (status === "Joined") return { kind: "joined" as const, href: `${href}?accepted=1`, label: "Joined Side Quest" };
  if (status === "Hosted") return { kind: "hosted" as const, href, label: "You host this Side Quest" };
  return { kind: "join" as const, label: "Join Side Quest" };
}

export function getPrivateInviteJoinState({ inviteKey, signedIn }: { inviteKey: string; signedIn: boolean }) {
  const cleanInviteKey = inviteKey.trim();
  if (!cleanInviteKey || cleanInviteKey.length > 40 || !/^[a-z0-9-]+$/i.test(cleanInviteKey)) {
    return { kind: "invalid" as const, error: "Use the invite code exactly as the host shared it." };
  }
  if (signedIn) return { kind: "join" as const, inviteKey: cleanInviteKey };
  return {
    kind: "signed-out" as const,
    inviteKey: cleanInviteKey,
    href: signInPath("/multiplayer-side-quests?tab=community"),
  };
}

export function groupQuestIdFromLookupHref(href: string, currentOrigin: string): string | null {
  const destination = new URL(href, currentOrigin);
  if (destination.origin !== currentOrigin) return null;
  const matchedPath = destination.pathname.match(/^\/groupquests\/([^/]+)$/);
  return matchedPath?.[1] ? decodeURIComponent(matchedPath[1]) : null;
}

export function safeGroupQuestHref(href: string, currentOrigin: string): string | null {
  const destination = new URL(href, currentOrigin);
  if (destination.origin !== currentOrigin || !/^\/groupquests\/[^/]+$/.test(destination.pathname)) return null;
  return `${destination.pathname}${destination.search}${destination.hash}`;
}

export function validateCommunitySoloReport(questId: string, reason: string) {
  const cleanReason = reason.trim().replace(/\s+/g, " ").slice(0, 500);
  if (cleanReason.length < 3) return { ok: false as const, message: "Add a short reason before reporting this Side Quest." };
  return { ok: true as const, message: `Community Solo Side Quest ${questId}: ${cleanReason}` };
}

export function validateCommunityMultiplayerReport(questId: string, reason: string) {
  const cleanReason = reason.trim().replace(/\s+/g, " ").slice(0, 500);
  if (cleanReason.length < 3) return { ok: false as const, message: "Add a short reason before reporting this Side Quest." };
  return { ok: true as const, message: `Community Multiplayer Side Quest ${questId}: ${cleanReason}` };
}

export function normalizeInviteLookupError(error?: string) {
  if (error === "missing_invite_key") return "Paste the invite code from the host first.";
  if (error === "groupquest_finished") return "That Multiplayer Side Quest has finished.";
  return "That invite code did not match an open Multiplayer Side Quest.";
}
