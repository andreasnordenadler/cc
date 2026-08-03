export type BlockedUser = {
  userId: string;
  blockedAt: string;
  source: "website" | "mobile";
};

export function getBlockedUsers(metadata: unknown): BlockedUser[] {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return [];
  const value = (metadata as Record<string, unknown>).sqcBlockedUsers;
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is BlockedUser => {
    if (!entry || typeof entry !== "object") return false;
    const candidate = entry as Partial<BlockedUser>;
    return typeof candidate.userId === "string"
      && typeof candidate.blockedAt === "string"
      && (candidate.source === "website" || candidate.source === "mobile");
  });
}

export function getBlockedUserIds(metadata: unknown): Set<string> {
  return new Set(getBlockedUsers(metadata).map((entry) => entry.userId));
}

export function filterBlockedCommunityGroupQuests<T extends { hostUserId: string; official?: boolean }>(
  quests: T[],
  blockedUserIds: ReadonlySet<string>,
): T[] {
  return quests.filter((quest) => quest.official || !blockedUserIds.has(quest.hostUserId));
}
