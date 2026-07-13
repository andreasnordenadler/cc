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

  function payload() {
    return buildGroupQuestSharePayload({ id, title, origin: window.location.origin });
  }

  return (
    <div className="sqc-multiplayer-share-actions">
      <button
        type="button"
        className="sqc-primary-action"
        aria-label="Share Multiplayer Side Quest invite"
        onClick={async () => {
          setStatus(null);
          const result = await shareGroupQuest(payload(), navigator);
          setStatus(result.message);
        }}
      >
        {isOwner ? "Share invite" : "Share Side Quest"}
      </button>
      <button
        type="button"
        className="sqc-quiet-button"
        aria-label="Copy Multiplayer Side Quest invite link"
        onClick={async () => {
          setStatus(null);
          const result = await copyGroupQuestLink(payload().url, navigator);
          setStatus(result.message);
        }}
      >
        Copy invite link
      </button>
      {status ? <small role="status" aria-live="polite">{status}</small> : null}
    </div>
  );
}
