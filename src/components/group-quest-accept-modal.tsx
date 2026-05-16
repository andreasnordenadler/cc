"use client";

import { type ReactNode, useState } from "react";

const storagePrefix = "sqc-groupquest-participant:";

type JoinProvider = "lichess" | "chesscom";

export default function GroupQuestAcceptModal({
  id,
  questName,
  isSignedIn = true,
  defaultProvider = "lichess",
  defaultUsername = "",
  defaultLeaderboardName = "",
  canAutoJoin = false,
  buttonClassName = "button primary",
  buttonLabel,
  children,
}: {
  id: string;
  questName: string;
  isSignedIn?: boolean;
  defaultProvider?: JoinProvider;
  defaultUsername?: string;
  defaultLeaderboardName?: string;
  canAutoJoin?: boolean;
  buttonClassName?: string;
  buttonLabel?: string;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState<JoinProvider>(defaultProvider);
  const [username, setUsername] = useState(defaultUsername);
  const [leaderboardName, setLeaderboardName] = useState(defaultLeaderboardName);
  const [wantsEmail, setWantsEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);

  const trimmedUsername = username.trim();
  const trimmedLeaderboardName = leaderboardName.trim();
  const canContinue = trimmedUsername.length > 0 && trimmedLeaderboardName.length > 0 && (!wantsEmail || email.trim().length > 0);

  async function joinQuest(joinProvider: JoinProvider, joinUsername: string, joinLeaderboardName: string) {
    try {
      window.localStorage.setItem(
        `${storagePrefix}${id}`,
        JSON.stringify({
          provider: joinProvider,
          username: joinUsername,
          leaderboardName: joinLeaderboardName,
          wantsEmailUpdates: wantsEmail,
          email: wantsEmail ? email.trim() : "",
          location: location.trim(),
          joinedAt: new Date().toISOString(),
        }),
      );
    } catch {
      // Continue even if local persistence is unavailable; server-backed saving comes later.
    }

    const response = await fetch(`/api/groupquests/${id}/join`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        provider: joinProvider,
        username: joinUsername,
        leaderboardName: joinLeaderboardName,
        wantsEmailUpdates: wantsEmail,
        email: wantsEmail ? email.trim() : "",
        location: location.trim(),
      }),
    });
    const result = await response.json().catch(() => null) as { href?: string; error?: string } | null;
    if (!response.ok || !result?.href) {
      throw new Error(result?.error ?? "Could not join this Multiplayer Side Quest.");
    }
    window.location.href = result.href;
  }

  async function openModal() {
    if (!isSignedIn) {
      window.location.href = `/sign-in?redirect_url=${encodeURIComponent(`/groupquests/${id}`)}`;
      return;
    }
    setError("");
    if (canAutoJoin && defaultUsername.trim() && defaultLeaderboardName.trim()) {
      setJoining(true);
      try {
        await joinQuest(defaultProvider, defaultUsername.trim(), defaultLeaderboardName.trim());
      } catch (error) {
        setError(error instanceof Error ? error.message : "Could not join this Multiplayer Side Quest.");
        setJoining(false);
        setOpen(true);
      }
      return;
    }
    setOpen(true);
  }

  function closeModal() {
    setError("");
    setOpen(false);
  }

  async function continueToQuest() {
    if (!canContinue) {
      setError(wantsEmail && !email.trim() ? "Add an email address or turn off email updates." : "Add your public chess username and leaderboard name.");
      return;
    }

    setJoining(true);
    setError("");

    try {
      await joinQuest(provider, trimmedUsername, trimmedLeaderboardName);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not join this Multiplayer Side Quest.");
      setJoining(false);
    }
  }

  return (
    <>
      <button className={buttonClassName} onClick={openModal} type="button">
        {children ?? (isSignedIn ? (buttonLabel ?? "Accept this Side Quest") : (buttonLabel ?? "Sign in to accept"))}
      </button>

      {open ? (
        <div className="groupquest-join-overlay" role="presentation">
          <section className="groupquest-join-modal" aria-label={`Join ${questName}`} role="dialog" aria-modal="true">
            <div className="groupquest-join-head">
              <div>
                <span className="eyebrow">Join Multiplayer Side Quest</span>
                <h2>Join {questName}</h2>
                <p>Tell the leaderboard who you are. We only need public chess usernames — never chess-site passwords.</p>
              </div>
              <button aria-label="Cancel joining" className="groupquest-join-close" onClick={closeModal} type="button">×</button>
            </div>

            <div className="groupquest-join-form">
              <div className="groupquest-provider-choice" role="group" aria-label="Chess provider">
                <span>Public chess provider</span>
                <div>
                  <button className={provider === "lichess" ? "active" : undefined} onClick={() => setProvider("lichess")} type="button">Lichess</button>
                  <button className={provider === "chesscom" ? "active" : undefined} onClick={() => setProvider("chesscom")} type="button">Chess.com</button>
                </div>
              </div>

              <label>
                <span>Public username</span>
                <input
                  autoCapitalize="none"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder={provider === "lichess" ? "e.g. coffeeKnight" : "e.g. queenlesshero"}
                />
              </label>

              <label>
                <span>Leaderboard name</span>
                <input autoComplete="nickname" value={leaderboardName} onChange={(event) => setLeaderboardName(event.target.value)} placeholder="Name shown on the leaderboard" />
              </label>

              <label className="groupquest-checkbox-row">
                <input checked={wantsEmail} onChange={(event) => setWantsEmail(event.target.checked)} type="checkbox" />
                <span>Email me competition updates</span>
              </label>

              {wantsEmail ? (
                <label>
                  <span>Email address</span>
                  <input autoComplete="email" inputMode="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
                </label>
              ) : null}

              <label>
                <span>Location / country <em>optional</em></span>
                <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="e.g. Stockholm, Sweden" />
              </label>
            </div>

            <p className="groupquest-join-note">Side Quest Chess checks public game records only. No uploads, no private keys, no chess-site passwords.</p>
            {error ? <p className="groupquest-join-error" role="alert">{error}</p> : null}

            <div className="groupquest-join-actions">
              <button className="button secondary" onClick={closeModal} type="button">Cancel</button>
              <button className="button primary" disabled={!canContinue || joining} onClick={continueToQuest} type="button">{joining ? "Joining…" : "Continue"}</button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
