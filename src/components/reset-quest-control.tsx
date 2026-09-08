"use client";

import { useState } from "react";
import { resetCompletedChallenge } from "@/app/actions";
import ChallengeBadge from "@/components/challenge-badge";
import type { Challenge } from "@/lib/challenges";
import AccessibleModalDialog from "@/components/accessible-modal-dialog";

type ResetQuestControlProps = {
  challenge: Challenge;
};

export default function ResetQuestControl({ challenge }: ResetQuestControlProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  return (
    <>
      <button type="button" className="button danger" onClick={() => setIsConfirming(true)}>
        Reset quest
      </button>

      {isConfirming ? (
        <AccessibleModalDialog
          className="quest-switch-dialog quest-reset-dialog"
          labelledBy="quest-reset-title"
          describedBy="quest-reset-copy"
          onDismiss={() => setIsConfirming(false)}
        >
          <span className="eyebrow">Reset completed quest?</span>
          <h2 id="quest-reset-title">Undo this completion?</h2>
          <p id="quest-reset-copy">
            This removes the saved completion, proof receipt, and Coat of Arms unlock for this quest so you can do it again. This cannot be undone.
          </p>

          <div className="quest-deactivate-crest-card quest-reset-crest-card">
            <ChallengeBadge challenge={challenge} size="hero" presentation="art" earned />
            <strong>{challenge.title}</strong>
            <span>Completion will be removed</span>
          </div>

          <div className="button-row quest-switch-actions">
            <button data-dialog-initial-focus type="button" className="button secondary" onClick={() => setIsConfirming(false)}>
              Keep completion
            </button>
            <form action={resetCompletedChallenge}>
              <input type="hidden" name="challengeId" value={challenge.id} />
              <button type="submit" className="button danger">Yes, reset permanently</button>
            </form>
          </div>
        </AccessibleModalDialog>
      ) : null}
    </>
  );
}
