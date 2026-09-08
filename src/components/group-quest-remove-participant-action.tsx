"use client";

import { useId, useRef, useState, type RefObject } from "react";
import AccessibleModalDialog from "@/components/accessible-modal-dialog";
import { removeGroupQuestParticipant } from "@/lib/group-quest-remove-participant";

export function GroupQuestRemoveParticipantControls({
  busy,
  descriptionId,
  error,
  isConfirming,
  onConfirm,
  onDismiss,
  onOpen,
  openerRef,
  participantName,
  titleId,
}: {
  busy: boolean;
  descriptionId: string;
  error: string;
  isConfirming: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
  onOpen: () => void;
  openerRef: RefObject<HTMLButtonElement | null>;
  participantName: string;
  titleId: string;
}) {
  return (
    <span className="sqc-participant-remove-action">
      <button
        ref={openerRef}
        type="button"
        className="sqc-quiet-button"
        aria-label={`Remove ${participantName}`}
        disabled={busy}
        onClick={onOpen}
      >
        {busy ? "Removing…" : "Remove player"}
      </button>
      {isConfirming ? (
        <AccessibleModalDialog
          className="quest-switch-dialog quest-reset-dialog"
          labelledBy={titleId}
          describedBy={descriptionId}
          onDismiss={() => {
            if (!busy) onDismiss();
          }}
          returnFocusRef={openerRef}
          role="alertdialog"
        >
          <span className="eyebrow">Remove player?</span>
          <h2 id={titleId}>Remove {participantName} from this Multiplayer Side Quest?</h2>
          <p id={descriptionId}>Their leaderboard entry and proof progress for this table will be removed, but they can rejoin while it is open.</p>
          {error ? <p className="groupquest-join-error" role="alert">{error}</p> : null}
          <div className="button-row quest-switch-actions">
            <button data-dialog-initial-focus type="button" className="button secondary" disabled={busy} onClick={onDismiss}>Keep player</button>
            <button type="button" className="button danger" disabled={busy} onClick={onConfirm}>{busy ? "Removing…" : "Remove player"}</button>
          </div>
        </AccessibleModalDialog>
      ) : null}
    </span>
  );
}

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
  const [isConfirming, setIsConfirming] = useState(false);
  const openerRef = useRef<HTMLButtonElement>(null);
  const dialogId = useId();
  const titleId = `${dialogId}-title`;
  const descriptionId = `${dialogId}-description`;

  async function removeParticipant() {
    if (busy) return;
    setBusy(true);
    setError("");
    const result = await removeGroupQuestParticipant({ id, participantUserId, participantName }, {
      confirm: () => true,
      request: fetch,
      navigate: (href) => window.location.assign(href),
    });
    if (result.kind === "error") setError(result.message);
    setBusy(false);
  }

  return (
    <GroupQuestRemoveParticipantControls
      busy={busy}
      descriptionId={descriptionId}
      error={error}
      isConfirming={isConfirming}
      onConfirm={() => void removeParticipant()}
      onDismiss={() => setIsConfirming(false)}
      onOpen={() => { setError(""); setIsConfirming(true); }}
      openerRef={openerRef}
      participantName={participantName}
      titleId={titleId}
    />
  );
}
