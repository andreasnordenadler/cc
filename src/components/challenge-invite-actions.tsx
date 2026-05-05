"use client";

import { useMemo, useState } from "react";

type ChallengeInviteActionsProps = {
  challengeTitle: string;
  challengeObjective: string;
  challengePath: string;
  reward: number;
  badgeName: string;
};

export default function ChallengeInviteActions({
  challengeTitle,
  challengeObjective,
  challengePath,
}: ChallengeInviteActionsProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "shared" | "failed">("idle");
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return challengePath;
    return `${window.location.origin}${challengePath}`;
  }, [challengePath]);
  const inviteCopy = `Try this quest “${challengeTitle}” on Side Quest Chess: ${challengeObjective}`;

  async function copyInvite() {
    try {
      await navigator.clipboard.writeText(`${inviteCopy}\n${shareUrl}`);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  }

  async function shareInvite() {
    if (!navigator.share) {
      await copyInvite();
      return;
    }

    try {
      await navigator.share({
        title: `Side Quest Chess quest: ${challengeTitle}`,
        text: inviteCopy,
        url: shareUrl,
      });
      setStatus("shared");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setStatus("failed");
    }
  }

  return (
    <div className="share-actions" aria-live="polite">
      <div className="button-row">
        <button type="button" className="button primary" onClick={copyInvite}>Copy friend quest</button>
        <button type="button" className="button secondary" onClick={shareInvite}>Share quest</button>
      </div>
      <p className="microcopy">
        {status === "copied"
          ? "Quest copied — now make one friend question your chess judgment."
          : status === "shared"
            ? "Share sheet opened. This is how bad ideas become tournaments."
            : status === "failed"
              ? "Could not access sharing here, but the quest text above is ready to select manually."
              : "Copies a quest-specific link, not a generic homepage pitch."}
      </p>
    </div>
  );
}
