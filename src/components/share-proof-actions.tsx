"use client";

import { useMemo, useState } from "react";

type ShareProofActionsProps = {
  copy: string;
  challengeTitle: string;
  sharePath?: string;
  shareLabel?: string;
  idleCopy?: string;
  imagePath?: string;
  imageFileName?: string;
};

type ShareTarget = {
  label: string;
  href: string;
  tone: "x" | "facebook" | "reddit" | "whatsapp" | "telegram" | "linkedin";
};

export default function ShareProofActions({
  copy,
  challengeTitle,
  sharePath = "/result",
  idleCopy = "Pick a place to share the proof link, or copy it and paste wherever the chess goblins gather.",
  imagePath,
  imageFileName = "side-quest-chess-proof.png",
}: ShareProofActionsProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "imageCopied" | "downloaded" | "failed">("idle");
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return sharePath;
    return `${window.location.origin}${sharePath}`;
  }, [sharePath]);
  const imageUrl = useMemo(() => {
    if (!imagePath) return null;
    if (typeof window === "undefined") return imagePath;

    const url = new URL(imagePath, window.location.origin);
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timeZone) url.searchParams.set("tz", timeZone);

    return url.toString();
  }, [imagePath]);
  const shareText = useMemo(() => `${copy}\n${shareUrl}`, [copy, shareUrl]);
  const socialCopy = useMemo(
    () => `I completed “${challengeTitle}” on Side Quest Chess. Proof + coat of arms unlocked.`,
    [challengeTitle],
  );
  const socialTargets = useMemo<ShareTarget[]>(() => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedSocialCopy = encodeURIComponent(socialCopy);
    const encodedTitle = encodeURIComponent(`Side Quest Chess: ${challengeTitle}`);
    const encodedRedditTitle = encodeURIComponent(`${challengeTitle} completed on Side Quest Chess`);
    const encodedSocialText = encodeURIComponent(`${socialCopy}\n${shareUrl}`);

    return [
      { label: "X", tone: "x", href: `https://twitter.com/intent/tweet?text=${encodedSocialCopy}&url=${encodedUrl}` },
      { label: "Facebook", tone: "facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
      { label: "Reddit", tone: "reddit", href: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedRedditTitle}` },
      { label: "WhatsApp", tone: "whatsapp", href: `https://wa.me/?text=${encodedSocialText}` },
      { label: "Telegram", tone: "telegram", href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedSocialCopy}` },
      { label: "LinkedIn", tone: "linkedin", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}` },
    ];
  }, [challengeTitle, shareUrl, socialCopy]);

  async function copyProofLink() {
    try {
      await navigator.clipboard.writeText(shareText);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  }

  async function copyImageLink() {
    if (!imageUrl) return copyProofLink();

    try {
      await navigator.clipboard.writeText(imageUrl);
      setStatus("imageCopied");
    } catch {
      setStatus("failed");
    }
  }

  async function downloadImage() {
    if (!imageUrl) return;

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error("proof_image_fetch_failed");

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = imageFileName;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
      setStatus("downloaded");
    } catch {
      setStatus("failed");
    }
  }

  return (
    <div className="share-actions social-share-actions" aria-live="polite">
      <div className="social-share-grid" aria-label="Share proof on social media">
        {socialTargets.map((target) => (
          <a
            key={target.label}
            className={`button social-share-button ${target.tone}`}
            href={target.href}
            target="_blank"
            rel="noreferrer"
          >
            {target.label}
          </a>
        ))}
      </div>
      <div className="button-row proof-share-utility-row">
        <button type="button" className="button secondary" onClick={copyProofLink}>Copy proof link</button>
        {imageUrl ? <button type="button" className="button secondary" onClick={copyImageLink}>Copy image link</button> : null}
        {imageUrl ? <button type="button" className="button secondary" onClick={downloadImage}>Download image</button> : null}
      </div>
      <p className="microcopy">
        {status === "copied"
          ? "Proof link copied. Paste it anywhere — socials will use the victory image preview."
          : status === "imageCopied"
            ? "Direct proof image link copied. Useful for posts that want the raw image."
            : status === "downloaded"
              ? "Proof image downloaded. Upload it anywhere that prefers the actual file."
              : status === "failed"
                ? "Could not copy/download here. Use one of the social buttons above."
                : idleCopy}
      </p>
    </div>
  );
}
