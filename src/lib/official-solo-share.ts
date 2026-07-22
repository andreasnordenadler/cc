export type OfficialSoloSharePayload = {
  title: string;
  text: string;
  url: string;
};

type OfficialSoloShareClient = {
  share?: (payload: OfficialSoloSharePayload) => Promise<void>;
  clipboard?: { writeText: (value: string) => Promise<void> };
};

export function buildOfficialSoloSharePayload({
  id,
  title,
  origin,
}: {
  id: string;
  title: string;
  origin: string;
}): OfficialSoloSharePayload {
  const base = new URL(origin);
  return {
    title: `Side Quest Chess: ${title}`,
    text: `Try “${title}” in Side Quest Chess.`,
    url: new URL(`/challenges/${encodeURIComponent(id)}`, base.origin).toString(),
  };
}

export async function shareOfficialSoloQuest(
  payload: OfficialSoloSharePayload,
  client: OfficialSoloShareClient,
) {
  if (client.share) {
    try {
      await client.share(payload);
      return { kind: "shared" as const, message: "Side Quest share sheet opened." };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return { kind: "cancelled" as const, message: "Sharing cancelled." };
      }
      return { kind: "error" as const, message: "Could not open sharing here. Copy the public link instead." };
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
