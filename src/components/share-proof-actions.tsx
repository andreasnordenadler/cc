"use client";

import { useMemo, useState } from "react";

type ShareProofActionsProps = {
  copy: string;
  challengeTitle: string;
  sharePath?: string;
  shareLabel?: string;
  idleCopy?: string;
  copiedCopy?: string;
  socialCopy?: string;
  socialTitle?: string;
  shareAriaLabel?: string;
  imagePath?: string;
  imageFileName?: string;
};

type ShareTarget = {
  label: string;
  href: string;
  tone: "x" | "facebook" | "instagram" | "reddit" | "whatsapp" | "telegram" | "linkedin";
};

export default function ShareProofActions({
  copy,
  challengeTitle,
  sharePath = "/result",
  shareLabel = "Copy proof link",
  copiedCopy = "Proof link copied.",
  socialCopy: socialCopyOverride,
  socialTitle,
  shareAriaLabel = "Share proof on social media",
  imagePath,
  imageFileName = "side-quest-chess-proof.png",
}: ShareProofActionsProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "imageCopied" | "downloaded" | "instagramReady" | "failed">("idle");
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
    () => socialCopyOverride || `I completed “${challengeTitle}” on Side Quest Chess. Proof + coat of arms unlocked.`,
    [challengeTitle, socialCopyOverride],
  );
  const socialTargets = useMemo<ShareTarget[]>(() => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedSocialCopy = encodeURIComponent(socialCopy);
    const encodedTitle = encodeURIComponent(socialTitle ?? `Side Quest Chess: ${challengeTitle}`);
    const encodedRedditTitle = encodeURIComponent(socialTitle ?? `${challengeTitle} completed on Side Quest Chess`);
    const encodedSocialText = encodeURIComponent(`${socialCopy}\n${shareUrl}`);

    return [
      { label: "X", tone: "x", href: `https://twitter.com/intent/tweet?text=${encodedSocialCopy}&url=${encodedUrl}` },
      { label: "Facebook", tone: "facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
      { label: "Instagram", tone: "instagram", href: "https://www.instagram.com/" },
      { label: "Reddit", tone: "reddit", href: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedRedditTitle}` },
      { label: "WhatsApp", tone: "whatsapp", href: `https://wa.me/?text=${encodedSocialText}` },
      { label: "Telegram", tone: "telegram", href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedSocialCopy}` },
      { label: "LinkedIn", tone: "linkedin", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}` },
    ];
  }, [challengeTitle, shareUrl, socialCopy, socialTitle]);

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

  async function saveProofImage() {
    if (!imageUrl) return false;

    const response = await fetch(imageUrl);
    if (!response.ok) return false;

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = imageFileName;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
    return true;
  }

  async function downloadImage() {
    try {
      const saved = await saveProofImage();
      setStatus(saved ? "downloaded" : "failed");
    } catch {
      setStatus("failed");
    }
  }

  async function prepareInstagramShare() {
    try {
      const saved = await saveProofImage();
      await navigator.clipboard.writeText(`${socialCopy}
${shareUrl}`);
      setStatus(saved ? "instagramReady" : "copied");
      window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    } catch {
      setStatus("failed");
    }
  }

  return (
    <div className="share-actions social-share-actions" aria-live="polite">
      <div className="social-share-grid" aria-label={shareAriaLabel}>
        {socialTargets.map((target) => (
          target.tone === "instagram" ? (
            <button
              key={target.label}
              type="button"
              className={`social-share-button ${target.tone}`}
              onClick={prepareInstagramShare}
              aria-label="Prepare Instagram post"
              title="Prepare Instagram post"
            >
              <SocialIcon tone={target.tone} />
              <span className="sr-only">Prepare Instagram post</span>
            </button>
          ) : (
            <a
              key={target.label}
              className={`social-share-button ${target.tone}`}
              href={target.href}
              target="_blank"
              rel="noreferrer"
              aria-label={`Share on ${target.label}`}
              title={`Share on ${target.label}`}
            >
              <SocialIcon tone={target.tone} />
              <span className="sr-only">Share on {target.label}</span>
            </a>
          )
        ))}
      </div>
      <div className="button-row proof-share-utility-row">
        <button type="button" className="button secondary" onClick={copyProofLink}>{shareLabel}</button>
        {imageUrl ? <button type="button" className="button secondary" onClick={copyImageLink}>Copy image link</button> : null}
        {imageUrl ? <button type="button" className="button secondary" onClick={downloadImage}>Download image</button> : null}
      </div>
      {status === "idle" ? null : (
        <p className="microcopy">
          {status === "copied"
            ? copiedCopy
            : status === "imageCopied"
              ? "Direct proof image link copied."
              : status === "downloaded"
                ? "Proof image downloaded."
                : status === "instagramReady"
                  ? "Instagram proof image downloaded and caption copied."
                  : "Could not copy/download here."}
        </p>
      )}
    </div>
  );
}

function SocialIcon({ tone }: { tone: ShareTarget["tone"] }) {
  if (tone === "x") {
    return <span className="social-share-glyph" aria-hidden="true">𝕏</span>;
  }

  if (tone === "facebook") {
    return <span className="social-share-glyph facebook-glyph" aria-hidden="true">f</span>;
  }

  if (tone === "linkedin") {
    return <span className="social-share-glyph linkedin-glyph" aria-hidden="true">in</span>;
  }

  if (tone === "instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="social-share-icon">
        <rect x="4" y="4" width="16" height="16" rx="5" fill="none" stroke="currentColor" strokeWidth="2.2" />
        <circle cx="12" cy="12" r="3.4" fill="none" stroke="currentColor" strokeWidth="2.2" />
        <circle cx="16.9" cy="7.1" r="1.2" fill="currentColor" />
      </svg>
    );
  }

  if (tone === "reddit") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="social-share-icon">
        <path d="M14.7 5.2 13 9.1c2.6.2 4.7 1.5 5.5 3.4.3-.2.7-.3 1.1-.3 1.1 0 2 .9 2 2 0 .8-.5 1.5-1.2 1.8v.4c0 3.1-3.7 5.6-8.3 5.6s-8.3-2.5-8.3-5.6V16c-.7-.3-1.2-1-1.2-1.8 0-1.1.9-2 2-2 .4 0 .8.1 1.1.3.8-1.9 2.9-3.2 5.4-3.4l2.1-4.8 4.3 1 .1-.2c.3-.8 1.2-1.2 2-.9.8.3 1.2 1.2.9 2s-1.2 1.2-2 .9c-.5-.2-.9-.6-1-1.1l-2.8-.8Z" fill="currentColor" />
        <circle cx="9" cy="15" r="1.1" fill="#1f0f0a" />
        <circle cx="15" cy="15" r="1.1" fill="#1f0f0a" />
        <path d="M8.8 18.1c1.8 1 4.6 1 6.4 0" fill="none" stroke="#1f0f0a" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }

  if (tone === "whatsapp") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="social-share-icon">
        <path d="M12 2.8a9.1 9.1 0 0 0-7.8 13.8l-1 4.4 4.5-1.1A9.1 9.1 0 1 0 12 2.8Z" fill="currentColor" />
        <path d="M8.7 7.3c-.2 0-.5.1-.7.4-.3.4-.9 1-.9 2.1s.9 2.2 1 2.4c.1.2 1.8 3 4.5 4.1 2.2.9 2.7.7 3.2.7.5-.1 1.6-.7 1.8-1.3.2-.6.2-1.2.1-1.3-.1-.1-.2-.2-.5-.4l-1.8-.9c-.3-.1-.5-.2-.7.2l-.7.9c-.2.2-.4.3-.7.1-.3-.1-1.2-.4-2.2-1.4-.8-.8-1.4-1.7-1.5-2-.2-.3 0-.5.1-.6l.5-.6c.1-.2.2-.3.3-.5.1-.2.1-.4 0-.6l-.8-1.9c-.2-.4-.4-.4-.7-.4h-.3Z" fill="#12351f" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="social-share-icon">
      <path d="M21.4 4.3 18.2 20c-.2.9-.8 1.1-1.6.7l-4.4-3.2-2.1 2c-.2.2-.4.4-.9.4l.3-4.5 8.2-7.4c.4-.3-.1-.5-.5-.2L7.1 14.1l-4.4-1.4c-1-.3-1-1 .2-1.5L20 4.6c.8-.3 1.5.2 1.4-.3Z" fill="currentColor" />
    </svg>
  );
}
