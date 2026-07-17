"use client";

import { useState } from "react";
import { removeGroupQuestParticipant } from "@/lib/group-quest-remove-participant";

export default function GroupQuestRemoveParticipantAction({
  id,
  participantUserId,
  participantName,
}: {
  id: string;
  participantUserId: string;
  participantName: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function removeParticipant() {
    if (busy) return;
    setBusy(true);
    setError("");
    const result = await removeGroupQuestParticipant({ id, participantUserId, participantName }, {
      confirm: (message) => window.confirm(message),
      request: fetch,
      navigate: (href) => window.location.assign(href),
    });
    if (result.kind === "error") setError(result.message);
    setBusy(false);
  }

  return (
    <span className="sqc-participant-remove-action">
      <button
        type="button"
        className="sqc-quiet-button"
        aria-label={`Remove ${participantName}`}
        disabled={busy}
        onClick={() => void removeParticipant()}
      >
        {busy ? "Removing…" : "Remove player"}
      </button>
      {error ? <small role="alert">{error}</small> : null}
    </span>
  );
}
