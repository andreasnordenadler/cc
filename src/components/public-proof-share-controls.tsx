"use client";

import { useState } from "react";
import {
  buildPublicProofSharePayload,
  sharePublicProof,
} from "@/lib/public-proof-share";

export default function PublicProofShareControls({
  token,
  challengeTitle,
  badgeName,
}: {
  token: string;
  challengeTitle: string;
  badgeName: string;
}) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function run(action: "share" | "copy") {
    setBusy(true);
    setStatus(null);
    try {
      const payload = buildPublicProofSharePayload({
        token,
        challengeTitle,
        badgeName,
        origin: window.location.origin,
      });
      const result = await sharePublicProof(
        payload,
        action === "share"
          ? { share: navigator.share?.bind(navigator), clipboard: navigator.clipboard }
          : { clipboard: navigator.clipboard },
      );
      setStatus(result.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="sqc-community-share-actions">
      <button
        type="button"
        className="sqc-secondary-action full sqc-share-action"
        aria-label="Share public proof link"
        disabled={busy}
        onClick={() => void run("share")}
      >
        Share proof link
      </button>
      <button
        type="button"
        className="sqc-detail-quiet-button"
        aria-label="Copy public proof link"
        disabled={busy}
        onClick={() => void run("copy")}
      >
        Copy proof link
      </button>
      {status ? <small role="status" aria-live="polite">{status}</small> : null}
    </div>
  );
}
