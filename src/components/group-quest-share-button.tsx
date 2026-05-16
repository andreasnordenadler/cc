"use client";

import { useState } from "react";

export default function GroupQuestShareButton({ questName, shareUrl, buttonLabel = "Share quest" }: { questName: string; shareUrl: string; buttonLabel?: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "shared" | "failed">("idle");

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setStatus("copied");
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
      </div>
      <small>
        {status === "shared"
          ? "Quest share sheet opened."
          : status === "copied"
            ? "Quest link copied to clipboard."
            : status === "failed"
              ? "Could not copy the quest link."
              : shareUrl}
      </small>
    </div>
  );
}
