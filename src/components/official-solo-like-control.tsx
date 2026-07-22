"use client";

import Link from "next/link";
import { useState } from "react";

type OfficialSoloLikeControlProps = {
  targetType?: "solo" | "multiplayer";
  targetId: string;
  count: number;
  likedByViewer: boolean;
  signedIn: boolean;
  returnTo: string;
  label: string;
  onLikeStateChange?: (liked: boolean) => void;
};

export default function OfficialSoloLikeControl({
  targetType = "solo",
  targetId,
  count: initialCount,
  likedByViewer: initiallyLiked,
  signedIn,
  returnTo,
  label,
  onLikeStateChange,
}: OfficialSoloLikeControlProps) {
  const [liked, setLiked] = useState(initiallyLiked);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const countLabel = `${count} like${count === 1 ? "" : "s"}`;
  const actionLabel = signedIn ? (liked ? "Unlike" : "Like") : "Sign in to like";
  const className = `sqc-like-pill${liked ? " liked" : ""}${busy ? " busy" : ""}`;

  if (!signedIn) {
    return (
      <Link
        className={className}
        href={`/sign-in?redirect_url=${encodeURIComponent(returnTo)}`}
        aria-label={`${actionLabel} ${label}. ${countLabel}.`}
      >
        <span className="sqc-like-pill-icon" data-icon="thumb-up-outline" aria-hidden="true" />
        <span>{count}</span>
      </Link>
    );
  }

  async function toggleLike() {
    if (busy) return;
    const previous = { liked, count };
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((value) => Math.max(0, value + (nextLiked ? 1 : -1)));
    onLikeStateChange?.(nextLiked);
    setBusy(true);
    setStatus("");

    try {
      const response = await fetch("/api/community-likes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          targetType,
          targetId,
          intent: nextLiked ? "like" : "unlike",
          returnTo,
        }),
      });
      if (!response.ok) throw new Error("like_update_failed");
      setStatus(nextLiked ? "Side Quest liked." : "Like removed.");
    } catch {
      setLiked(previous.liked);
      setCount(previous.count);
      onLikeStateChange?.(previous.liked);
      setStatus("Could not update your like. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className={className}
        aria-pressed={liked}
        aria-label={`${liked ? "Unlike" : "Like"} ${label}. ${countLabel}.`}
        disabled={busy}
        onClick={toggleLike}
      >
        <span className="sqc-like-pill-icon" data-icon={liked ? "thumb-up" : "thumb-up-outline"} aria-hidden="true" />
        <span>{count}</span>
      </button>
      <span className="sr-only" role="status" aria-live="polite">{status}</span>
    </>
  );
}
