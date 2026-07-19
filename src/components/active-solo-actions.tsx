"use client";

import { useActionState, useState } from "react";
import { checkActiveChallengeWithResult } from "@/app/actions";
import type { SoloCheckResult } from "@/lib/solo-check-result";
import { SoloCompletionCelebration } from "./solo-completion-celebration";

const initialState: SoloCheckResult = { status: "checked", completion: null };

function Submit({ pending }: { pending: boolean }) {
  return (
    <button className={pending ? "sqc-refresh spinning" : "sqc-refresh"} type="submit" disabled={pending} aria-label="Refresh active Solo Side Quest">
      <svg className="sqc-refresh-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4a8 8 0 1 0 7.73 10h-2.08A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35Z" />
      </svg>
    </button>
  );
}

export default function ActiveSoloActions() {
  const [state, formAction, pending] = useActionState(checkActiveChallengeWithResult, initialState);
  const [dismissedCompletionId, setDismissedCompletionId] = useState<string | null>(null);
  const completion = state.status === "completed" && state.completion.challengeId !== dismissedCompletionId
    ? state.completion
    : null;

  return (
    <>
      <form className="sqc-refresh-form" action={formAction}><Submit pending={pending} /></form>
      {completion ? (
        <SoloCompletionCelebration
          completion={completion}
          onClose={() => setDismissedCompletionId(completion.challengeId)}
        />
      ) : null}
    </>
  );
}
