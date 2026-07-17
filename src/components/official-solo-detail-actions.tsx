"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { checkActiveChallenge, startChallenge, submitChallengeAttempt } from "@/app/actions";

type StartControlProps = {
  challengeId: string;
  activeChallengeTitle?: string | null;
};

function StartSubmit({ switching = false }: { switching?: boolean }) {
  const { pending } = useFormStatus();
  const idleLabel = switching ? "Switch Side Quest" : "Start this Side Quest";

  return (
    <button type="submit" className="sqc-primary-action" disabled={pending} aria-disabled={pending}>
      {pending ? "Starting Side Quest…" : idleLabel}
    </button>
  );
}

function CheckSubmit() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="sqc-primary-action" disabled={pending} aria-disabled={pending}>
      {pending ? "Checking latest game…" : "Check my latest game"}
    </button>
  );
}

function ExactGameSubmit() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="sqc-secondary-action" disabled={pending} aria-disabled={pending}>
      {pending ? "Checking…" : "Submit game/link"}
    </button>
  );
}

export function OfficialSoloExactGameForm({
  challengeId,
  action,
}: {
  challengeId: string;
  action: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <form className="sqc-exact-game-form" aria-label="Submit specific game proof" action={action}>
      <input type="hidden" name="challengeId" value={challengeId} />
      <label className="sqc-form-row">
        <span>Specific proof game</span>
        <input
          name="gameId"
          placeholder="Lichess game ID or Chess.com URL"
          autoCapitalize="none"
          autoCorrect="off"
          required
        />
      </label>
      <p>Optional: paste a finished public game to check that exact proof instead of only the latest game.</p>
      <ExactGameSubmit />
    </form>
  );
}

export function OfficialSoloExactGameControl({ challengeId }: { challengeId: string }) {
  return <OfficialSoloExactGameForm challengeId={challengeId} action={submitChallengeAttempt} />;
}

export function OfficialSoloStartControl({ challengeId, activeChallengeTitle }: StartControlProps) {
  const [isConfirmingSwitch, setIsConfirmingSwitch] = useState(false);

  if (!activeChallengeTitle) {
    return (
      <form action={startChallenge}>
        <input type="hidden" name="challengeId" value={challengeId} />
        <StartSubmit />
      </form>
    );
  }

  return (
    <>
      <button type="button" className="sqc-primary-action" onClick={() => setIsConfirmingSwitch(true)}>
        Start this Side Quest
      </button>
      {isConfirmingSwitch ? (
        <div className="quest-switch-dialog-backdrop" role="presentation" onClick={() => setIsConfirmingSwitch(false)}>
          <section
            className="quest-switch-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="official-solo-switch-title"
            aria-describedby="official-solo-switch-copy"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="eyebrow">Switch active Side Quest?</span>
            <h2 id="official-solo-switch-title">Replace {activeChallengeTitle}?</h2>
            <p id="official-solo-switch-copy">
              Starting this Side Quest changes which rules SQC checks after your next public game. Your existing quest stays available.
            </p>
            <div className="sqc-action-pair">
              <button type="button" className="sqc-secondary-action" onClick={() => setIsConfirmingSwitch(false)}>
                Keep current Side Quest
              </button>
              <form action={startChallenge}>
                <input type="hidden" name="challengeId" value={challengeId} />
                <StartSubmit switching />
              </form>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

export function OfficialSoloCheckControl() {
  return (
    <form action={checkActiveChallenge}>
      <CheckSubmit />
    </form>
  );
}

export default function OfficialSoloDetailActions({
  mode,
  challengeId,
  activeChallengeTitle,
}: StartControlProps & { mode: "start" | "check" }) {
  return mode === "check"
    ? <OfficialSoloCheckControl />
    : <OfficialSoloStartControl challengeId={challengeId} activeChallengeTitle={activeChallengeTitle} />;
}
