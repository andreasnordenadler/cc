"use client";

import { useState } from "react";

type ShareStatus = "idle" | "copied" | "code-copied" | "shared" | "failed";

export default function GroupQuestShareButton({
  questName,
  shareUrl,
  buttonLabel = "Share quest",
  inviteKey,
}: {
  questName: string;
  shareUrl: string;
  buttonLabel?: string;
  inviteKey?: string;
}) {
  const [status, setStatus] = useState<ShareStatus>("idle");

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  }

  async function copyInviteKey() {
    if (!inviteKey) return;

    try {
      await navigator.clipboard.writeText(inviteKey);
      setStatus("code-copied");
    } catch {
      setStatus("failed");
    }
  }

  async function shareQuest() {
    const text = `Join this Side Quest Chess Multiplayer Side Quest: ${questName}`;

    if (!navigator.share) {
      await copyLink();
      return;
    }

    try {
      await navigator.share({
        title: `${questName} · Side Quest Chess`,
        text,
        url: shareUrl,
      });
      setStatus("shared");
    } catch {
      setStatus("idle");
    }
  }

  return (
    <div className="share-actions" aria-live="polite">
      <div className="button-row">
        <button className="button secondary" onClick={shareQuest} type="button">
          {buttonLabel}
        </button>
        <button className="button secondary" onClick={copyLink} type="button">
          {status === "copied" ? "Link copied" : "Copy link"}
        </button>
        {inviteKey ? (
          <button className="button secondary" onClick={copyInviteKey} type="button">
            {status === "code-copied" ? "Host code copied" : "Copy host code"}
          </button>
        ) : null}
      </div>
      <small>
        {status === "shared"
          ? "Quest share sheet opened."
          : status === "copied"
            ? "Quest link copied to clipboard."
            : status === "code-copied"
              ? "Private host code copied to clipboard."
              : status === "failed"
                ? "Could not copy the quest link or host code."
                : shareUrl}
      </small>
    </div>
  );
}
