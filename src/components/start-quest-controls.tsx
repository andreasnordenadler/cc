"use client";

import { useState } from "react";
import { startChallenge } from "@/app/actions";
import ChallengeBadge from "@/components/challenge-badge";
import type { Challenge } from "@/lib/challenges";

type StartQuestControlsProps = {
  challenge: Challenge;
  activeChallenge?: Challenge | null;
  variant?: "primary" | "secondary";
  label?: string;
};

export default function StartQuestControls({
  challenge,
  activeChallenge,
  variant = "primary",
  label = "Start quest",
}: StartQuestControlsProps) {
  const [isConfirmingSwitch, setIsConfirmingSwitch] = useState(false);
  const shouldConfirmSwitch = Boolean(activeChallenge && activeChallenge.id !== challenge.id);
  const buttonClassName = `button ${variant}`;

  if (!shouldConfirmSwitch) {
    return (
      <form action={startChallenge}>
        <input type="hidden" name="challengeId" value={challenge.id} />
        <button type="submit" className={buttonClassName}>{label}</button>
      </form>
    );
  }

  return (
    <>
      <button type="button" className={buttonClassName} onClick={() => setIsConfirmingSwitch(true)}>
        {label}
      </button>

      {isConfirmingSwitch ? (
        <div className="quest-switch-dialog-backdrop" role="presentation" onClick={() => setIsConfirmingSwitch(false)}>
          <section
            className="quest-switch-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quest-switch-title"
            aria-describedby="quest-switch-copy"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="eyebrow">Switch active quest?</span>
            <h2 id="quest-switch-title">You already have an unfinished quest active.</h2>
            <p id="quest-switch-copy">
              Starting a new quest will replace your active run. Your old quest stays available, but the checker will focus on the new one.
            </p>

            <div className="quest-switch-crests" aria-label="Current and new quest coats of arms">
              <div className="quest-switch-crest-card old">
                <span>Current active</span>
                {activeChallenge ? <ChallengeBadge challenge={activeChallenge} size="hero" presentation="art" /> : null}
                <strong>{activeChallenge?.title}</strong>
              </div>
              <div className="quest-switch-arrow" aria-hidden="true">→</div>
              <div className="quest-switch-crest-card new">
                <span>Switch to</span>
                <ChallengeBadge challenge={challenge} size="hero" presentation="art" />
                <strong>{challenge.title}</strong>
              </div>
            </div>

            <div className="button-row quest-switch-actions">
              <button type="button" className="button secondary" onClick={() => setIsConfirmingSwitch(false)}>
                Keep current quest
              </button>
              <form action={startChallenge}>
                <input type="hidden" name="challengeId" value={challenge.id} />
                <button type="submit" className="button primary">Switch quest</button>
              </form>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
