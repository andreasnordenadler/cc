"use client";

import { useState } from "react";
import { getCommunitySoloPickState } from "@/lib/mobile-web-parity-actions";

export default function CommunitySoloPickControl({
  questId,
  signedIn,
  activeQuestId,
}: {
  questId: string;
  signedIn: boolean;
  activeQuestId?: string | null;
}) {
  const state = getCommunitySoloPickState({ questId, signedIn, activeQuestId });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (state.kind !== "pick") {
    return <a href={state.href} className="sqc-detail-primary-button">{state.label}</a>;
  }

  async function pick() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/mobile/quest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "start", challengeId: questId }),
      });
      const result = await response.json().catch(() => null) as { message?: string } | null;
      if (!response.ok) throw new Error(result?.message ?? "Could not pick this Side Quest.");
      window.location.href = `/challenges/community/${encodeURIComponent(questId)}`;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not pick this Side Quest.");
      setBusy(false);
    }
  }

  return (
    <>
      <button className="sqc-detail-primary-button" disabled={busy} onClick={pick} type="button">
        {busy ? "Picking…" : state.label}
      </button>
      {error ? <p className="groupquest-join-error" role="alert">{error}</p> : null}
    </>
  );
}
