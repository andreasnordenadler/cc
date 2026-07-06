"use client";

import { type FormEvent, useState } from "react";

export default function GroupQuestInviteKeyJoin({ isSignedIn, initialInviteKey = "" }: { isSignedIn: boolean; initialInviteKey?: string }) {
  const [inviteKey, setInviteKey] = useState(initialInviteKey);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submitInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const key = inviteKey.trim();
    if (!key) {
      setError("Paste the invite code from the host first.");
      return;
    }
    if (!isSignedIn) {
      window.location.href = `/sign-in?redirect_url=${encodeURIComponent(`/groupquests?inviteKey=${encodeURIComponent(key)}`)}`;
      return;
    }

    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/groupquests/invite/lookup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ inviteKey: key }),
      });
      const result = await response.json().catch(() => null) as { href?: string; error?: string } | null;
      if (!response.ok || !result?.href) {
        throw new Error(result?.error ?? "That invite code did not match an open Multiplayer Side Quest.");
      }
      window.location.href = result.href;
    } catch (error) {
      setError(error instanceof Error ? error.message : "That invite code did not match an open Multiplayer Side Quest.");
      setBusy(false);
    }
  }

  return (
    <form className="groupquests-invite-key-form" onSubmit={submitInvite}>
      <label>
        <span>Private invite code</span>
        <input
          autoCapitalize="characters"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={inviteKey}
          onChange={(event) => setInviteKey(event.target.value)}
          placeholder="e.g. NO-CASTLE-42"
        />
      </label>
      <button className="button primary" disabled={busy} type="submit">{busy ? "Opening…" : "Open invite"}</button>
      {error ? <p className="groupquest-join-error" role="alert">{error}</p> : null}
      <p className="microcopy">Use this only for private Multiplayer Side Quests. Public quests stay browsable below.</p>
    </form>
  );
}
