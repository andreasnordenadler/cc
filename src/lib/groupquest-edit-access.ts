type EditableGroupQuestIdentity = {
  id: string;
  hostUserId: string;
  storageUserId: string;
  finished: boolean;
};

type GroupQuestEditAccess =
  | { kind: "render" }
  | { kind: "not-found" }
  | { kind: "redirect"; href: string };

export function getGroupQuestEditEndpoint(questId: string) {
  return `/api/groupquests/${encodeURIComponent(questId)}`;
}

export function getGroupQuestDetailHref(questId: string, accepted = false) {
  return `/groupquests/${encodeURIComponent(questId)}${accepted ? "?accepted=1" : ""}`;
}

export function isCanonicalGroupQuestOwner(
  userId: string | null | undefined,
  quest: Pick<EditableGroupQuestIdentity, "hostUserId" | "storageUserId">,
) {
  return Boolean(userId) && quest.hostUserId === userId && quest.storageUserId === quest.hostUserId;
}

export function getGroupQuestEditAccess({
  userId,
  quest,
}: {
  userId: string | null | undefined;
  quest: EditableGroupQuestIdentity | null;
}): GroupQuestEditAccess {
  if (!quest) return { kind: "not-found" };

  const detailHref = getGroupQuestDetailHref(quest.id);
  if (!userId) {
    return {
      kind: "redirect",
      href: `/sign-in?redirect_url=${encodeURIComponent(`${detailHref}/edit`)}`,
    };
  }
  if (!isCanonicalGroupQuestOwner(userId, quest) || quest.finished) {
    return { kind: "redirect", href: detailHref };
  }
  return { kind: "render" };
}
