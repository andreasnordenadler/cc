"use client";

import { type FormEvent, useState } from "react";
import { groupQuestIdFromLookupHref, normalizeInviteLookupError, safeGroupQuestHref } from "@/lib/mobile-web-parity-actions";

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
        throw new Error(normalizeInviteLookupError(result?.error));
      }

      const groupQuestId = groupQuestIdFromLookupHref(result.href, window.location.origin);
      if (!groupQuestId) throw new Error(normalizeInviteLookupError("invite_not_found"));

      const joinResponse = await fetch(`/api/groupquests/${encodeURIComponent(groupQuestId)}/join`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ inviteKey: key }),
      });
      const joined = await joinResponse.json().catch(() => null) as { href?: string; error?: string } | null;
      if (!joinResponse.ok || !joined?.href) {
        const message = joined?.error === "missing_participant"
          ? "Add a public Lichess or Chess.com username before joining Multiplayer Side Quests."
          : normalizeInviteLookupError(joined?.error);
        throw new Error(message);
      }
      const destination = safeGroupQuestHref(joined.href, window.location.origin);
      if (!destination) throw new Error(normalizeInviteLookupError("invite_not_found"));
      window.location.href = destination;
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
      <button className="button primary" disabled={busy} type="submit">{busy ? "Joining…" : "Join with code"}</button>
      {error ? <p className="groupquest-join-error" role="alert">{error}</p> : null}
      <p className="microcopy">Use this only for private Multiplayer Side Quests. Public quests stay browsable below.</p>
    </form>
  );
}
