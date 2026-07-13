export type GroupQuestSharePayload = {
  title: string;
  text: string;
  url: string;
};

type ShareClient = {
  share?: (payload: GroupQuestSharePayload) => Promise<void>;
  clipboard?: { writeText: (value: string) => Promise<void> };
};

export function buildGroupQuestSharePayload({
  id,
  title,
  origin,
}: {
  id: string;
  title: string;
  origin: string;
}): GroupQuestSharePayload {
  const base = new URL(origin);
  const url = new URL(`/groupquests/${encodeURIComponent(id)}`, base.origin).toString();
  return {
    title,
    text: `Join me for “${title}” on Side Quest Chess.`,
    url,
  };
}

export async function shareGroupQuest(payload: GroupQuestSharePayload, client: ShareClient) {
  if (client.share) {
    try {
      await client.share(payload);
      return { kind: "shared" as const, message: "Side Quest shared." };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return { kind: "cancelled" as const, message: "Sharing cancelled." };
      }
      return { kind: "error" as const, message: "Could not open sharing. Copy the invite link instead." };
    }
  }

  return copyGroupQuestLink(payload.url, client);
}

export async function copyGroupQuestLink(url: string, client: Pick<ShareClient, "clipboard">) {
  if (!client.clipboard) {
    return { kind: "error" as const, message: "Copying is not available in this browser." };
  }
  try {
    await client.clipboard.writeText(url);
    return { kind: "copied" as const, message: "Invite link copied." };
  } catch {
    return { kind: "error" as const, message: "Could not copy the invite link. Try again." };
  }
}
