"use client";

import { useState } from "react";

const CONFIRMATION = "DELETE MY ACCOUNT";

export default function DeleteAccountControl() {
  const [expanded, setExpanded] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deleteAccount() {
    if (confirmation !== CONFIRMATION || busy) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ confirmation }),
      });
      const payload = await response.json() as { message?: string };
      if (!response.ok) throw new Error(payload.message || "Account deletion failed.");
      window.location.assign("/?accountDeleted=1");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Account deletion failed. Please try again.");
      setBusy(false);
    }
  }

  return (
    <section className="sqc-username-editor-card" aria-labelledby="delete-account-title">
      <p className="sqc-account-kicker">Danger zone</p>
      <h2 id="delete-account-title">Delete account</h2>
      <p>Permanently deletes your SQC profile, progress, proofs, custom Side Quests, and Clerk sign-in. This cannot be undone.</p>
      {expanded ? (
        <div className="sqc-input-stack">
          <label className="sqc-form-row">
            <span>Type <strong>{CONFIRMATION}</strong> to confirm</span>
            <input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="off" />
          </label>
          {error ? <p role="alert">{error}</p> : null}
          <button className="sqc-logout-button" type="button" disabled={confirmation !== CONFIRMATION || busy} onClick={() => void deleteAccount()}>
            {busy ? "Deleting…" : "Permanently delete account"}
          </button>
          <button type="button" onClick={() => { setExpanded(false); setConfirmation(""); setError(null); }}>Cancel</button>
        </div>
      ) : (
        <button className="sqc-logout-button" type="button" onClick={() => setExpanded(true)}>Delete account</button>
      )}
    </section>
  );
}
