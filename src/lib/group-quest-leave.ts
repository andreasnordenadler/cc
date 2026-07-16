export type GroupQuestLeaveResult =
  | { kind: "cancelled" }
  | { kind: "success" }
  | { kind: "error"; message: string };

type GroupQuestLeaveDependencies = {
  confirm: (message: string) => boolean;
  request: (url: string, init: RequestInit) => Promise<Response>;
  navigate?: (destination: string) => void;
};

const leaveConfirmation = "Leave this Multiplayer Side Quest? Your participant entry will be removed from this quest, but you can rejoin later if it is still open.";
const genericLeaveError = "Could not leave this quest right now.";

export async function leaveGroupQuest(
  id: string,
  dependencies: GroupQuestLeaveDependencies,
): Promise<GroupQuestLeaveResult> {
  if (!dependencies.confirm(leaveConfirmation)) return { kind: "cancelled" };

  try {
    const response = await dependencies.request(`/api/groupquests/${encodeURIComponent(id)}/leave`, { method: "POST" });
    const payload = await response.json().catch(() => null) as { error?: unknown } | null;
    if (!response.ok) {
      return {
        kind: "error",
        message: payload?.error === "not_joined" ? "You are not currently joined to this quest." : genericLeaveError,
      };
    }
    dependencies.navigate?.(`/groupquests/${encodeURIComponent(id)}`);
    return { kind: "success" };
  } catch {
    return { kind: "error", message: genericLeaveError };
  }
}
