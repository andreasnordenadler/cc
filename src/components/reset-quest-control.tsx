"use client";

import { useState } from "react";
import { resetCompletedChallenge } from "@/app/actions";
import ChallengeBadge from "@/components/challenge-badge";
import type { Challenge } from "@/lib/challenges";

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
        <div className="quest-switch-dialog-backdrop" role="presentation" onClick={() => setIsConfirming(false)}>
          <section
            className="quest-switch-dialog quest-reset-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quest-reset-title"
            aria-describedby="quest-reset-copy"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="eyebrow">Reset completed quest?</span>
            <h2 id="quest-reset-title">Undo this completion?</h2>
            <p id="quest-reset-copy">
              This removes the saved completion, proof receipt, coat of arms unlock, and points for this quest so you can do it again. This cannot be undone.
            </p>

            <div className="quest-deactivate-crest-card quest-reset-crest-card">
              <ChallengeBadge challenge={challenge} size="hero" presentation="art" earned />
              <strong>{challenge.title}</strong>
              <span>Completion will be removed</span>
            </div>

            <div className="button-row quest-switch-actions">
              <button type="button" className="button secondary" onClick={() => setIsConfirming(false)}>
                Keep completion
              </button>
              <form action={resetCompletedChallenge}>
                <input type="hidden" name="challengeId" value={challenge.id} />
                <button type="submit" className="button danger">Yes, reset permanently</button>
              </form>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
