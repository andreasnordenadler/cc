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

export function normalizeInviteLookupError(error?: string) {
  if (error === "missing_invite_key") return "Paste the invite code from the host first.";
  if (error === "groupquest_finished") return "That Multiplayer Side Quest has finished.";
  return "That invite code did not match an open Multiplayer Side Quest.";
}
