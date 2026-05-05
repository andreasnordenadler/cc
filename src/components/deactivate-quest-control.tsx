"use client";

import { useState } from "react";
import { deactivateActiveChallenge } from "@/app/actions";
import ChallengeBadge from "@/components/challenge-badge";
import type { Challenge } from "@/lib/challenges";

type DeactivateQuestControlProps = {
  challenge: Challenge;
};

export default function DeactivateQuestControl({ challenge }: DeactivateQuestControlProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  return (
    <>
      <button type="button" className="button secondary" onClick={() => setIsConfirming(true)}>
        Deactivate
      </button>

      {isConfirming ? (
        <div className="quest-switch-dialog-backdrop" role="presentation" onClick={() => setIsConfirming(false)}>
          <section
            className="quest-switch-dialog quest-deactivate-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quest-deactivate-title"
            aria-describedby="quest-deactivate-copy"
            onClick={(event) => event.stopPropagation()}
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
              <button type="button" className="button secondary" onClick={() => setIsConfirming(false)}>
                Keep active
              </button>
              <form action={deactivateActiveChallenge}>
                <input type="hidden" name="challengeId" value={challenge.id} />
                <button type="submit" className="button primary">Deactivate quest</button>
              </form>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
