"use client";

import { useState } from "react";
import {
  buildCommunitySoloSharePayload,
  shareCommunitySoloQuest,
} from "@/lib/community-solo-share";

export default function CommunitySoloShareControls({ id, title }: { id: string; title: string }) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  function payload() {
    return buildCommunitySoloSharePayload({ id, title, origin: window.location.origin });
  }

  async function run(action: "share" | "copy") {
    setBusy(true);
    setStatus(null);
    try {
      const result = await shareCommunitySoloQuest(
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
        className="sqc-detail-secondary-button"
        aria-label="Share Community Solo Side Quest"
        disabled={busy}
        onClick={() => void run("share")}
      >
        Share public link
      </button>
      <button
        type="button"
        className="sqc-detail-quiet-button"
        aria-label="Copy Community Solo Side Quest public link"
        disabled={busy}
        onClick={() => void run("copy")}
      >
        Copy public link
      </button>
      {status ? <small role="status" aria-live="polite">{status}</small> : null}
    </div>
  );
}
