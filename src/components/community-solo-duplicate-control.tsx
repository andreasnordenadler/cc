"use client";

import { useState } from "react";
import {
  duplicateCustomOwnerQuest,
  getCustomOwnerDuplicateSuccessMessage,
  type CustomOwnerSaveInput,
} from "@/lib/custom-owner-controls";

export default function CommunitySoloDuplicateControl({ quest }: { quest: CustomOwnerSaveInput }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);

  async function duplicate() {
    if (busy) return;
    setBusy(true);
    setMessage("");
    setFailed(false);
    try {
      const destination = await duplicateCustomOwnerQuest(quest);
      if (!destination) {
        setFailed(true);
        setMessage("Could not duplicate this Side Quest right now.");
        return;
      }
      setMessage(getCustomOwnerDuplicateSuccessMessage(quest.title));
    } catch {
      setFailed(true);
      setMessage("Could not duplicate this Side Quest right now.");
    } finally {
      setBusy(false);
    }
  }

  return <>
    <button
      aria-label="Duplicate custom Side Quest"
      className="sqc-detail-secondary-button"
      disabled={busy}
      onClick={() => { void duplicate(); }}
      type="button"
    >
      {busy ? "Duplicating…" : "Duplicate"}
    </button>
    {message ? <p className={failed ? "groupquest-join-error" : "sqc-action-success"} role={failed ? "alert" : "status"}>{message}</p> : null}
  </>;
}
