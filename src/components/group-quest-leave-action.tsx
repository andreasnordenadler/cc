"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState, type RefObject } from "react";
import AccessibleModalDialog from "@/components/accessible-modal-dialog";
import { leaveGroupQuest } from "@/lib/group-quest-leave";

export function GroupQuestLeaveControls({
  descriptionId,
  error,
  isConfirming,
  onConfirm,
  onDismiss,
  onOpen,
  openerRef,
  submitting,
  titleId,
}: {
  descriptionId: string;
  error: string | null;
  isConfirming: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
  onOpen: () => void;
  openerRef: RefObject<HTMLButtonElement | null>;
  submitting: boolean;
  titleId: string;
}) {
  return (
    <section className="groupquest-leave-zone" aria-label="Leave this Multiplayer Side Quest">
      <p>Need to leave this Multiplayer Side Quest?</p>
      <button ref={openerRef} className="groupquest-leave-button" type="button" onClick={onOpen} disabled={submitting}>
        {submitting ? "Leaving…" : "Leave Side Quest"}
      </button>
      {isConfirming ? (
        <AccessibleModalDialog
          className="quest-switch-dialog quest-reset-dialog"
          labelledBy={titleId}
          describedBy={descriptionId}
          onDismiss={() => {
            if (!submitting) onDismiss();
          }}
          returnFocusRef={openerRef}
          role="alertdialog"
        >
          <span className="eyebrow">Leave Multiplayer Side Quest?</span>
          <h2 id={titleId}>Leave this Multiplayer Side Quest?</h2>
          <p id={descriptionId}>Your participant entry will be removed from this quest, but you can rejoin later if it is still open.</p>
          {error ? <p className="groupquest-join-error" role="alert">{error}</p> : null}
          <div className="button-row quest-switch-actions">
            <button data-dialog-initial-focus type="button" className="button secondary" disabled={submitting} onClick={onDismiss}>Stay in Side Quest</button>
            <button type="button" className="button danger" disabled={submitting} onClick={onConfirm}>{submitting ? "Leaving…" : "Leave Side Quest"}</button>
          </div>
        </AccessibleModalDialog>
      ) : null}
    </section>
  );
}

export default function GroupQuestLeaveAction({ id }: { id: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const openerRef = useRef<HTMLButtonElement>(null);
  const dialogId = useId();
  const titleId = `${dialogId}-title`;
  const descriptionId = `${dialogId}-description`;

  async function leaveSideQuest() {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await leaveGroupQuest(id, {
        confirm: () => true,
        request: fetch,
        navigate: (destination) => {
          router.push(destination);
          router.refresh();
        },
      });
      if (result.kind === "error") {
        setError(result.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <GroupQuestLeaveControls
      descriptionId={descriptionId}
      error={error}
      isConfirming={isConfirming}
      onConfirm={() => void leaveSideQuest()}
      onDismiss={() => setIsConfirming(false)}
      onOpen={() => { setError(null); setIsConfirming(true); }}
      openerRef={openerRef}
      submitting={submitting}
      titleId={titleId}
    />
  );
}
