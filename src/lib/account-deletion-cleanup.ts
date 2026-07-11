type MetadataRecord = Record<string, unknown>;

type ClerkCleanupClient = {
  users: {
    getUserList: (params: { limit: number; offset: number }) => Promise<{ data: Array<{ id: string; privateMetadata: unknown }>; totalCount: number }>;
    updateUserMetadata: (userId: string, params: { privateMetadata: MetadataRecord }) => Promise<unknown>;
  };
};

export function purgeUserFromGroupQuestMetadata(metadata: unknown, deletedUserId: string): { changed: boolean; metadata: MetadataRecord } {
  if (!metadata || typeof metadata !== "object") return { changed: false, metadata: {} };
  const record = metadata as MetadataRecord;
  if (!Array.isArray(record.sqcGroupQuests)) return { changed: false, metadata: record };

  let changed = false;
  const quests = record.sqcGroupQuests.flatMap((value) => {
    if (!value || typeof value !== "object") return [value];
    const quest = value as MetadataRecord;
    if (quest.hostUserId === deletedUserId) {
      changed = true;
      return [];
    }
    if (!Array.isArray(quest.participants)) return [quest];
    const participants = quest.participants.filter((participant) => {
      const remove = Boolean(participant && typeof participant === "object" && (participant as MetadataRecord).userId === deletedUserId);
      if (remove) changed = true;
      return !remove;
    });
    return participants.length === quest.participants.length ? [quest] : [{ ...quest, participants }];
  });

  return changed ? { changed: true, metadata: { ...record, sqcGroupQuests: quests } } : { changed: false, metadata: record };
}

export async function purgeReplicatedAccountData(client: ClerkCleanupClient, deletedUserId: string) {
  const limit = 100;
  let offset = 0;
  const applied: Array<{ userId: string; sqcGroupQuests: unknown }> = [];
  const rollback = async () => {
    const failures: unknown[] = [];
    for (const mutation of [...applied].reverse()) {
      try {
        await client.users.updateUserMetadata(mutation.userId, { privateMetadata: { sqcGroupQuests: mutation.sqcGroupQuests } });
      } catch (error) {
        failures.push(error);
      }
    }
    if (failures.length > 0) throw new AggregateError(failures, "Failed to fully restore replicated account data");
  };

  try {
    while (true) {
      const page = await client.users.getUserList({ limit, offset });
      for (const user of page.data) {
        if (user.id === deletedUserId) continue;
        const result = purgeUserFromGroupQuestMetadata(user.privateMetadata, deletedUserId);
        if (result.changed) {
          const original = user.privateMetadata && typeof user.privateMetadata === "object"
            ? (user.privateMetadata as MetadataRecord).sqcGroupQuests
            : undefined;
          await client.users.updateUserMetadata(user.id, { privateMetadata: { sqcGroupQuests: result.metadata.sqcGroupQuests } });
          applied.push({ userId: user.id, sqcGroupQuests: original });
        }
      }
      offset += page.data.length;
      if (page.data.length === 0 || offset >= page.totalCount) break;
    }
  } catch (error) {
    await rollback();
    throw error;
  }

  return rollback;
}
