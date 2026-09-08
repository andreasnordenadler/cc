"use client";

import { useState } from "react";
import { continueDirectGroupQuestJoin } from "@/lib/mobile-web-parity-actions";

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
  returnHref,
}: {
  id: string;
  isSignedIn?: boolean;
  buttonClassName?: string;
  buttonLabel?: string;
  inviteKey?: string;
  returnHref?: string;
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
    const result = await continueDirectGroupQuestJoin({
      questId: id,
      inviteKey,
      returnHref,
      origin: window.location.origin,
      fetch,
    });
    if (result.ok) {
      window.location.href = result.destination;
      return;
    }
    setError(normalizeGroupQuestJoinError(result.error));
    setJoining(false);
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
