"use client";

import { useRef, useState } from "react";
import { deactivateActiveChallenge } from "@/app/actions";
import AccessibleModalDialog from "@/components/accessible-modal-dialog";
import ChallengeBadge from "@/components/challenge-badge";
import type { Challenge } from "@/lib/challenges";

type DeactivateQuestControlProps = {
  challenge: Challenge;
};

export default function DeactivateQuestControl({ challenge }: DeactivateQuestControlProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const openDeactivateDialogRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button ref={openDeactivateDialogRef} type="button" className="button secondary" onClick={() => setIsConfirming(true)}>
        Deactivate
      </button>

      {isConfirming ? (
        <AccessibleModalDialog
          className="quest-switch-dialog quest-deactivate-dialog"
          labelledBy="quest-deactivate-title"
          describedBy="quest-deactivate-copy"
          onDismiss={() => setIsConfirming(false)}
          returnFocusRef={openDeactivateDialogRef}
        >
          <span className="eyebrow">Deactivate active quest?</span>
          <h2 id="quest-deactivate-title">Stop tracking this quest for now?</h2>
          <p id="quest-deactivate-copy">
            This clears your active quest slot. Your attempts and any earned badge stay saved, but Check latest games will pause until you start a quest again.
          </p>

          <div className="quest-deactivate-crest-card">
            <ChallengeBadge challenge={challenge} size="hero" presentation="art" />
            <strong>{challenge.title}</strong>
            <span>Currently active</span>
          </div>

          <div className="button-row quest-switch-actions">
            <button data-dialog-initial-focus type="button" className="button secondary" onClick={() => setIsConfirming(false)}>
              Keep active
            </button>
            <form action={deactivateActiveChallenge}>
              <input type="hidden" name="challengeId" value={challenge.id} />
              <button type="submit" className="button primary">Deactivate quest</button>
            </form>
          </div>
        </AccessibleModalDialog>
      ) : null}
    </>
  );
}
