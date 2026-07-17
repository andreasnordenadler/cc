type RemoveParticipantInput = {
  id: string;
  participantUserId: string;
  participantName: string;
};

type RemoveParticipantDependencies = {
  confirm: (message: string) => boolean;
  request: (url: string, init: RequestInit) => Promise<Response>;
  navigate: (href: string) => void;
};

export async function removeGroupQuestParticipant(
  input: RemoveParticipantInput,
  dependencies: RemoveParticipantDependencies,
) {
  const confirmed = dependencies.confirm(
    `Remove ${input.participantName} from this Multiplayer Side Quest? Their leaderboard entry and proof progress for this table will be removed, but they can rejoin while it is open.`,
  );
  if (!confirmed) return { kind: "cancelled" as const };

  try {
    const encodedId = encodeURIComponent(input.id);
    const response = await dependencies.request(`/api/groupquests/${encodedId}/remove-participant`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ participantUserId: input.participantUserId }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => null) as { error?: string } | null;
      return {
        kind: "error" as const,
        message: payload?.error === "participant_not_found"
          ? "That player is no longer in this Multiplayer Side Quest."
          : "Could not remove that player right now.",
      };
    }
    dependencies.navigate(`/groupquests/${encodedId}`);
    return { kind: "success" as const };
  } catch {
    return { kind: "error" as const, message: "Could not remove that player right now." };
  }
}
