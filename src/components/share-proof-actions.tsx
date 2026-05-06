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

export default function ShareProofActions({
  copy,
  challengeTitle,
  sharePath = "/result",
  shareLabel = "Share quest",
  idleCopy = "Copies the current result text plus this proof-card link. No PGN upload, no homework.",
  imagePath,
  imageFileName = "side-quest-chess-proof.png",
}: ShareProofActionsProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "shared" | "failed">("idle");
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return sharePath;
    return `${window.location.origin}${sharePath}`;
  }, [sharePath]);
  const imageUrl = useMemo(() => {
    if (!imagePath) return null;
    if (typeof window === "undefined") return imagePath;
    return `${window.location.origin}${imagePath}`;
  }, [imagePath]);

  async function copyFallback() {
    try {
      await navigator.clipboard.writeText(`${copy}\n${shareUrl}`);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  }

  async function buildShareFile() {
    if (!imageUrl) return null;

    const response = await fetch(imageUrl);
    if (!response.ok) return null;

    const blob = await response.blob();
    return new File([blob], imageFileName, { type: blob.type || "image/png" });
  }

  async function shareReceipt() {
    if (!navigator.share) {
      await copyFallback();
      return;
    }

    try {
      const file = await buildShareFile();
      const filePayload = file ? { files: [file] } : {};
      const canShareFile = file && navigator.canShare?.(filePayload);

      await navigator.share({
        title: `Side Quest Chess: ${challengeTitle}`,
        text: copy,
        url: shareUrl,
        ...(canShareFile ? filePayload : {}),
      });
      setStatus("shared");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      await copyFallback();
    }
  }

  return (
    <div className="share-actions" aria-live="polite">
      <div className="button-row">
        <button type="button" className="button primary" onClick={shareReceipt}>{shareLabel}</button>
      </div>
      <p className="microcopy">
        {status === "copied"
          ? "Share text copied with the Side Quest Chess link."
          : status === "shared"
            ? "Share sheet opened with the victory scroll."
            : status === "failed"
              ? "Could not open sharing here."
              : idleCopy}
      </p>
    </div>
  );
}
