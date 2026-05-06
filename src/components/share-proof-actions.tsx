"use client";

import { type ReactNode, useMemo, useState } from "react";

type ShareProofActionsProps = {
  copy: string;
  challengeTitle: string;
  sharePath?: string;
  copyLabel?: string;
  shareLabel?: string;
  idleCopy?: string;
  children?: ReactNode;
};

export default function ShareProofActions({
  copy,
  challengeTitle,
  sharePath = "/result",
  copyLabel = "Copy receipt",
  shareLabel = "Share quest",
  idleCopy = "Copies the current result text plus this proof-card link. No PGN upload, no homework.",
  children,
}: ShareProofActionsProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "shared" | "failed">("idle");
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return sharePath;
    return `${window.location.origin}${sharePath}`;
  }, [sharePath]);

  async function copyReceipt() {
    try {
      await navigator.clipboard.writeText(`${copy}\n${shareUrl}`);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  }

  async function shareReceipt() {
    if (!navigator.share) {
      await copyReceipt();
      return;
    }

    try {
      await navigator.share({
        title: `Side Quest Chess: ${challengeTitle}`,
        text: copy,
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
        <button type="button" className="button primary" onClick={copyReceipt}>{copyLabel}</button>
        <button type="button" className="button secondary" onClick={shareReceipt}>{shareLabel}</button>
        {children}
      </div>
      <p className="microcopy">
        {status === "copied"
          ? "Receipt copied — paste it into the group chat and pretend this was a sound strategic plan."
          : status === "shared"
            ? "Share sheet opened. May your opponent never see it coming."
            : status === "failed"
              ? "Could not access sharing here, but the copy above is ready to select manually."
              : idleCopy}
      </p>
    </div>
  );
}
