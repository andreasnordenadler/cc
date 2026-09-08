"use client";

import Link from "next/link";
import { useRef, useState, type RefObject } from "react";
import AccessibleModalDialog from "./accessible-modal-dialog";
import { ProofPositionMiniBoard } from "./proof-position-board";

type QuestAction = "start" | "check" | "submit" | "deactivate" | "reset";

export function buildCustomProofRequestBody(action: QuestAction, challengeId: string, gameId = "") {
  const normalizedGameId = gameId.trim();
  if (action === "submit" && !normalizedGameId) throw new Error("Paste a Lichess game ID or Chess.com game URL first.");
  return { action, challengeId, ...(action === "submit" ? { gameId: normalizedGameId } : {}) };
}

export function CustomCompletedResetControls({
  allowCompletedReset,
  busy,
  error,
  isConfirmingReset,
  message,
  onAction,
  onDismissReset,
  onOpenReset,
  openResetDialogRef,
  resultHref,
}: {
  allowCompletedReset: boolean;
  busy: QuestAction | "";
  error: boolean;
  isConfirmingReset: boolean;
  message: string;
  onAction: (action: QuestAction) => void;
  onDismissReset: () => void;
  onOpenReset: () => void;
  openResetDialogRef: RefObject<HTMLButtonElement | null>;
  resultHref?: string | null;
}) {
  return <>
    {resultHref ? <Link className="sqc-detail-primary-button" href={resultHref}>View result</Link> : null}
    {allowCompletedReset ? <button ref={openResetDialogRef} className="sqc-detail-secondary-button" disabled={Boolean(busy)} onClick={onOpenReset} type="button">{busy === "reset" ? "Resetting…" : "Reset completed Side Quest"}</button> : null}
    {isConfirmingReset ? (
      <AccessibleModalDialog
        className="quest-switch-dialog quest-reset-dialog"
        labelledBy="custom-quest-reset-title"
        describedBy="custom-quest-reset-copy"
        onDismiss={() => {
          if (busy !== "reset") onDismissReset();
        }}
        returnFocusRef={openResetDialogRef}
        role="alertdialog"
      >
        <span className="eyebrow">Reset completed Side Quest?</span>
        <h2 id="custom-quest-reset-title">Remove this completion?</h2>
        <p id="custom-quest-reset-copy">This removes the completed proof, receipt attempts, and Coat of Arms unlock so you can run this Side Quest again.</p>
        {message ? <p className={error ? "groupquest-join-error" : "sqc-action-success"} role={error ? "alert" : "status"}>{message}</p> : null}
        <div className="button-row quest-switch-actions">
          <button data-dialog-initial-focus type="button" className="button secondary" disabled={busy === "reset"} onClick={onDismissReset}>Keep completion</button>
          <button type="button" className="button danger" disabled={busy === "reset"} onClick={() => onAction("reset")}>{busy === "reset" ? "Resetting…" : "Reset completion"}</button>
        </div>
      </AccessibleModalDialog>
    ) : null}
  </>;
}

export default function CustomSideQuestProofControls({
  questId,
  active,
  playable,
  completed,
  completedAt,
  resultHref,
  latestAttempt,
  allowCompletedReset = false,
}: {
  questId: string;
  active: boolean;
  playable: boolean;
  completed?: boolean;
  completedAt?: string | null;
  resultHref?: string | null;
  latestAttempt?: {
    status: string;
    summary: string;
    checkedAt: string;
    finalPositionFen?: string;
    lastMoveSan?: string;
    failureLabel?: string;
    failureExplanation?: string;
  } | null;
  allowCompletedReset?: boolean;
}) {
  const [busy, setBusy] = useState<QuestAction | "">("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [gameId, setGameId] = useState("");
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const openResetDialogRef = useRef<HTMLButtonElement>(null);

  async function run(action: QuestAction) {
    let body: ReturnType<typeof buildCustomProofRequestBody>;
    try {
      body = buildCustomProofRequestBody(action, questId, gameId);
    } catch (caught) {
      setError(true);
      setMessage(caught instanceof Error ? caught.message : "Could not update this proof run.");
      return;
    }
    setBusy(action); setMessage(""); setError(false);
    try {
      const response = await fetch("/api/mobile/quest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json().catch(() => null) as { message?: string } | null;
      if (!response.ok) throw new Error(result?.message ?? "Could not update this proof run.");
      setMessage(result?.message ?? (action === "start" ? "Side Quest started." : action === "check" ? "Latest game checked." : action === "submit" ? "Submitted game checked." : action === "reset" ? "Completed quest reset." : "Side Quest deactivated."));
      window.location.reload();
    } catch (caught) {
      setError(true);
      setMessage(caught instanceof Error ? caught.message : "Could not update this proof run.");
      setBusy("");
    }
  }

  const completedLabel = completedAt ? formatCompletedDate(completedAt) : null;

  return <>
    <section className="sqc-native-card sqc-multiplayer-native-card sqc-custom-owner-proof" aria-labelledby="custom-proof-controls-title">
      <span className="sqc-card-eyebrow">Solo proof</span>
      <h2 id="custom-proof-controls-title">{completed ? "Completed Side Quest." : active ? "This is your active Side Quest." : playable ? "Ready for a proof run." : "Publish before playing."}</h2>
      <p>{completed ? `${completedAt ? "Your accepted proof is saved" : "Your completion is saved"}${completedLabel ? ` · Completed ${completedLabel}` : ""}.` : active ? "Play a fresh public Lichess or Chess.com game, then check the latest result against these saved rules." : playable ? "Start this Side Quest to make it your current Solo proof run." : "Draft and archived Side Quests keep their rules, but cannot start a proof run."}</p>
      {!completed && active && latestAttempt ? (
        <div className="sqc-detail-panel-strong" aria-label="Latest proof check">
          <span className="sqc-card-eyebrow">Latest proof check</span>
          <h3>{latestAttempt.failureLabel ?? (latestAttempt.status === "passed" ? "Proof check passed" : "No completion yet")}</h3>
          <p>{latestAttempt.summary}</p>
          {latestAttempt.failureExplanation ? <p>{latestAttempt.failureExplanation}</p> : null}
          {latestAttempt.lastMoveSan ? <small>Last move: {latestAttempt.lastMoveSan}</small> : null}
          <ProofPositionMiniBoard fen={latestAttempt.finalPositionFen} label="Latest checked proof chess board" />
        </div>
      ) : null}
      <div className="sqc-community-detail-actions" aria-label="Custom Side Quest proof actions">
        {completed ? <CustomCompletedResetControls
          allowCompletedReset={allowCompletedReset}
          busy={busy}
          error={error}
          isConfirmingReset={isConfirmingReset}
          message={message}
          onAction={(action) => void run(action)}
          onDismissReset={() => setIsConfirmingReset(false)}
          onOpenReset={() => setIsConfirmingReset(true)}
          openResetDialogRef={openResetDialogRef}
          resultHref={resultHref}
        /> : active ? <>
          <label className="sqc-form-row">
            <span>Specific proof game</span>
            <input aria-label="Specific proof game" autoCapitalize="none" autoCorrect="off" onChange={(event) => setGameId(event.target.value)} placeholder="Lichess game ID or Chess.com URL" value={gameId} />
          </label>
          <p className="sqc-form-help">Optional: paste a finished public game to check this exact custom Side Quest proof.</p>
          <button className="sqc-detail-primary-button" disabled={Boolean(busy)} onClick={() => run("check")} type="button">{busy === "check" ? "Checking…" : "Check my latest game"}</button>
          <button className="sqc-detail-secondary-button" disabled={Boolean(busy)} onClick={() => run("submit")} type="button">{busy === "submit" ? "Checking…" : "Submit game/link"}</button>
          <button className="sqc-detail-secondary-button" disabled={Boolean(busy)} onClick={() => run("deactivate")} type="button">{busy === "deactivate" ? "Deactivating…" : "Deactivate"}</button>
        </> : <button className="sqc-detail-primary-button" disabled={Boolean(busy) || !playable} onClick={() => run("start")} type="button">{busy === "start" ? "Starting…" : "Start this Side Quest"}</button>}
      </div>
      {message && !isConfirmingReset ? <p className={error ? "groupquest-join-error" : "sqc-action-success"} role={error ? "alert" : "status"}>{message}</p> : null}
    </section>
  </>;
}

function formatCompletedDate(value: string) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return null;
  return new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(timestamp);
}
