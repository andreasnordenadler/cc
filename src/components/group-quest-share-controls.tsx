"use client";

import { useState } from "react";
import {
  buildGroupQuestSharePayload,
  copyGroupQuestLink,
  shareGroupQuest,
} from "@/lib/group-quest-share";

export default function GroupQuestShareControls({
  id,
  title,
  isOwner = false,
}: {
  id: string;
  title: string;
  isOwner?: boolean;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function payload() {
    return buildGroupQuestSharePayload({ id, title, origin: window.location.origin });
  }

  return (
    <div className="sqc-multiplayer-share-actions">
      <button
        type="button"
        className="sqc-primary-action"
        aria-label="Share Multiplayer Side Quest invite"
        disabled={busy}
        onClick={async () => {
          setStatus(null);
          setBusy(true);
          try {
            const result = await shareGroupQuest(payload(), navigator);
            setStatus(result.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {isOwner ? "Share invite" : "Share Side Quest"}
      </button>
      <button
        type="button"
        className="sqc-quiet-button"
        aria-label="Copy Multiplayer Side Quest invite link"
        disabled={busy}
        onClick={async () => {
          setStatus(null);
          setBusy(true);
          try {
            const result = await copyGroupQuestLink(payload().url, navigator);
            setStatus(result.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        Copy invite link
      </button>
      {status ? <small role="status" aria-live="polite">{status}</small> : null}
    </div>
  );
}
