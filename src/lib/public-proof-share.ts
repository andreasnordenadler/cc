export type PublicProofSharePayload = {
  title: string;
  text: string;
  url: string;
};

type PublicProofShareClient = {
  share?: (payload: PublicProofSharePayload) => Promise<void>;
  clipboard?: { writeText: (value: string) => Promise<void> };
};

export function buildPublicProofSharePayload({
  token,
  challengeTitle,
  badgeName,
  origin,
}: {
  token: string;
  challengeTitle: string;
  badgeName: string;
  origin: string;
}): PublicProofSharePayload {
  const base = new URL(origin);
  return {
    title: `Side Quest Chess proof: ${challengeTitle}`,
    text: `I completed “${challengeTitle}” on Side Quest Chess. ${badgeName} unlocked.`,
    url: new URL(`/proof/${encodeURIComponent(token)}`, base.origin).toString(),
  };
}

export async function sharePublicProof(
  payload: PublicProofSharePayload,
  client: PublicProofShareClient,
) {
  if (client.share) {
    try {
      await client.share(payload);
      return { kind: "shared" as const, message: "Proof link share sheet opened." };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return { kind: "cancelled" as const, message: "Sharing cancelled." };
      }
      return { kind: "error" as const, message: "Could not open sharing here. Copy the proof link instead." };
    }
  }
  if (client.clipboard) {
    try {
      await client.clipboard.writeText(payload.url);
      return { kind: "copied" as const, message: "Proof link copied." };
    } catch {
      return { kind: "error" as const, message: "Could not copy the proof link. Try again." };
    }
  }
  return { kind: "unavailable" as const, message: "Sharing is not available." };
}
