export type CommunitySoloSharePayload = {
  title: string;
  text: string;
  url: string;
};

type CommunitySoloShareClient = {
  share?: (payload: CommunitySoloSharePayload) => Promise<void>;
  clipboard?: { writeText: (value: string) => Promise<void> };
};

export function buildCommunitySoloSharePayload({
  id,
  title,
  origin,
}: {
  id: string;
  title: string;
  origin: string;
}): CommunitySoloSharePayload {
  const base = new URL(origin);
  return {
    title,
    text: `Try “${title}” on Side Quest Chess.`,
    url: new URL(`/challenges/community/${encodeURIComponent(id)}`, base.origin).toString(),
  };
}

export async function shareCommunitySoloQuest(
  payload: CommunitySoloSharePayload,
  client: CommunitySoloShareClient,
) {
  if (client.share) {
    try {
      await client.share(payload);
      return { kind: "shared" as const, message: "Side Quest shared." };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return { kind: "cancelled" as const, message: "Sharing cancelled." };
      }
      return { kind: "error" as const, message: "Could not open sharing. Copy the public link instead." };
    }
  }
  if (client.clipboard) {
    try {
      await client.clipboard.writeText(payload.url);
      return { kind: "copied" as const, message: "Public link copied." };
    } catch {
      return { kind: "error" as const, message: "Could not copy the public link. Try again." };
    }
  }
  return { kind: "unavailable" as const, message: "Sharing is not available." };
}
