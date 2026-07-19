"use client";

import { type FormEvent, useEffect, useState } from "react";
import { continuePrivateInviteJoin, getPrivateInviteJoinState, takePendingPrivateInvite } from "@/lib/mobile-web-parity-actions";

const pendingInviteStorageKey = "sqc.pendingPrivateInviteKey";

export default function GroupQuestInviteKeyJoin({ isSignedIn }: { isSignedIn: boolean }) {
  const [inviteKey, setInviteKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isSignedIn) return;
    try {
      const pendingInviteKey = takePendingPrivateInvite(window.sessionStorage);
      if (!pendingInviteKey) return;

      void continuePrivateInviteJoin({ inviteKey: pendingInviteKey, origin: window.location.origin, fetch: window.fetch.bind(window) })
        .then((result) => {
          if (result.ok) {
            window.location.href = result.destination;
            return;
          }
          setInviteKey(pendingInviteKey);
          setError(result.error);
        });
    } catch {
      // The form remains usable when browser storage is unavailable.
    }
  }, [isSignedIn]);

  async function submitInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const key = inviteKey.trim();
    if (!key) {
      setError("Paste the invite code from the host first.");
      return;
    }
    const joinState = getPrivateInviteJoinState({ inviteKey: key, signedIn: isSignedIn });
    if (joinState.kind === "invalid") {
      setError(joinState.error);
      return;
    }
    if (joinState.kind === "signed-out") {
      try {
        window.sessionStorage.setItem(pendingInviteStorageKey, joinState.inviteKey);
      } catch {
        setError("Sign in first, then paste the invite code again.");
        return;
      }
      window.location.href = joinState.href;
      return;
    }

    setBusy(true);
    setError("");
    const result = await continuePrivateInviteJoin({ inviteKey: key, origin: window.location.origin, fetch: window.fetch.bind(window) });
    if (result.ok) {
      window.location.href = result.destination;
      return;
    }
    setError(result.error);
    setBusy(false);
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
