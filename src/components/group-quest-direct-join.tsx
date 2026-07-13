"use client";

import { useState } from "react";

const joinErrorMessages: Record<string, string> = {
  sign_in_required: "Sign in to join this Multiplayer Side Quest.",
  invalid_payload: "Could not join this Multiplayer Side Quest. Please try again.",
  not_found: "This Multiplayer Side Quest is no longer available.",
  groupquest_finished: "This Multiplayer Side Quest has ended.",
  invite_key_required: "That private invite link is no longer valid.",
  missing_participant: "Link a public Lichess or Chess.com username in Account before joining.",
  join_unavailable: "Could not join this Multiplayer Side Quest right now. Please try again.",
};

export function normalizeGroupQuestJoinError(error: unknown) {
  return typeof error === "string" && joinErrorMessages[error]
    ? joinErrorMessages[error]
    : "Could not join this Multiplayer Side Quest right now. Please try again.";
}

export default function GroupQuestDirectJoin({
  id,
  isSignedIn = true,
  buttonClassName = "button primary",
  buttonLabel = "Join Side Quest",
  inviteKey,
}: {
  id: string;
  isSignedIn?: boolean;
  buttonClassName?: string;
  buttonLabel?: string;
  inviteKey?: string;
}) {
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  async function joinQuest() {
    if (!isSignedIn) {
      window.location.href = `/sign-in?redirect_url=${encodeURIComponent(`/groupquests/${id}`)}`;
      return;
    }

    setJoining(true);
    setError("");
    try {
      const response = await fetch(`/api/groupquests/${encodeURIComponent(id)}/join`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(inviteKey ? { inviteKey } : {}),
      });
      const result = await response.json().catch(() => null) as { href?: string; error?: string } | null;
      if (!response.ok || !result?.href) throw new Error(normalizeGroupQuestJoinError(result?.error));
      window.location.href = result.href;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : normalizeGroupQuestJoinError(null));
      setJoining(false);
    }
  }

  return (
    <>
      <button className={buttonClassName} disabled={joining} onClick={joinQuest} type="button">
        {joining ? "Joining…" : buttonLabel}
      </button>
      {error ? <p className="groupquest-join-error" role="alert">{error}</p> : null}
    </>
  );
}
