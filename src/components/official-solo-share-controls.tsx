"use client";

import { useState } from "react";
import {
  buildOfficialSoloSharePayload,
  shareOfficialSoloQuest,
} from "@/lib/official-solo-share";

export default function OfficialSoloShareControls({ id, title }: { id: string; title: string }) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  function payload() {
    return buildOfficialSoloSharePayload({ id, title, origin: window.location.origin });
  }

  async function run(action: "share" | "copy") {
    setBusy(true);
    setStatus(null);
    try {
      const result = await shareOfficialSoloQuest(
        payload(),
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
        aria-label="Share Solo Side Quest public link"
        disabled={busy}
        onClick={() => void run("share")}
      >
        Share public link
      </button>
      <button
        type="button"
        className="sqc-detail-quiet-button"
        aria-label="Copy Solo Side Quest public link"
        disabled={busy}
        onClick={() => void run("copy")}
      >
        Copy public link
      </button>
      {status ? <small role="status" aria-live="polite">{status}</small> : null}
    </div>
  );
}
