"use client";

import { useState } from "react";

type QuestAction = "start" | "check" | "submit" | "deactivate";

export default function CustomSideQuestProofControls({
  questId,
  active,
  playable,
}: {
  questId: string;
  active: boolean;
  playable: boolean;
}) {
  const [busy, setBusy] = useState<QuestAction | "">("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [gameId, setGameId] = useState("");

  async function run(action: QuestAction) {
    if (action === "submit" && !gameId.trim()) {
      setError(true);
      setMessage("Paste a Lichess game ID or Chess.com game URL first.");
      return;
    }
    setBusy(action); setMessage(""); setError(false);
    try {
      const response = await fetch("/api/mobile/quest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, challengeId: questId, ...(action === "submit" ? { gameId: gameId.trim() } : {}) }),
      });
      const result = await response.json().catch(() => null) as { message?: string } | null;
      if (!response.ok) throw new Error(result?.message ?? "Could not update this proof run.");
      setMessage(result?.message ?? (action === "start" ? "Side Quest started." : action === "check" ? "Latest game checked." : action === "submit" ? "Submitted game checked." : "Side Quest deactivated."));
      window.location.reload();
    } catch (caught) {
      setError(true);
      setMessage(caught instanceof Error ? caught.message : "Could not update this proof run.");
      setBusy("");
    }
  }

  return <section className="sqc-native-card sqc-multiplayer-native-card" aria-labelledby="custom-proof-controls-title">
    <span className="sqc-card-eyebrow">Solo proof</span>
    <h2 id="custom-proof-controls-title">{active ? "This is your active Side Quest." : playable ? "Ready for a proof run." : "Publish before playing."}</h2>
    <p>{active ? "Play a fresh public Lichess or Chess.com game, then check the latest result against these saved rules." : playable ? "Start this Side Quest to make it your current Solo proof run." : "Draft and archived Side Quests keep their rules, but cannot start a proof run."}</p>
    <div className="sqc-community-detail-actions" aria-label="Custom Side Quest proof actions">
      {active ? <>
        <label className="sqc-form-row">
          <span>Specific proof game</span>
          <input aria-label="Specific proof game" autoCapitalize="none" autoCorrect="off" onChange={(event) => setGameId(event.target.value)} placeholder="Lichess game ID or Chess.com URL" value={gameId} />
        </label>
        <p className="sqc-form-help">Optional: check this exact finished public game instead of only your latest game.</p>
        <button className="sqc-detail-primary-button" disabled={Boolean(busy)} onClick={() => run("check")} type="button">{busy === "check" ? "Checking…" : "Check my latest game"}</button>
        <button className="sqc-detail-secondary-button" disabled={Boolean(busy)} onClick={() => run("submit")} type="button">{busy === "submit" ? "Submitting…" : "Submit game/link"}</button>
        <button className="sqc-detail-secondary-button" disabled={Boolean(busy)} onClick={() => run("deactivate")} type="button">{busy === "deactivate" ? "Deactivating…" : "Deactivate"}</button>
      </> : <button className="sqc-detail-primary-button" disabled={Boolean(busy) || !playable} onClick={() => run("start")} type="button">{busy === "start" ? "Starting…" : "Start this Side Quest"}</button>}
    </div>
    {message ? <p className={error ? "groupquest-join-error" : "sqc-action-success"} role={error ? "alert" : "status"}>{message}</p> : null}
  </section>;
}
