"use client";

import { useState } from "react";
import { copyGroupQuestInviteKey } from "@/lib/group-quest-share";

export default function GroupQuestInviteKeyControl({ inviteKey }: { inviteKey: string }) {
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <section className="sqc-native-card sqc-multiplayer-native-card" aria-label="Private Multiplayer invite code">
      <span className="sqc-card-eyebrow">Private invite</span>
      <h2>Invite code</h2>
      <div className="sqc-multiplayer-rule-row">
        <span>Share only with players you want in.</span>
        <strong>{inviteKey}</strong>
      </div>
      <button
        type="button"
        className="sqc-detail-secondary-button"
        aria-label="Copy private invite code"
        disabled={busy}
        onClick={async () => {
          setStatus(null);
          setBusy(true);
          try {
            const result = await copyGroupQuestInviteKey(inviteKey, navigator);
            setStatus(result.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Copying…" : "Copy invite code"}
      </button>
      {status ? <small role="status" aria-live="polite">{status}</small> : null}
    </section>
  );
}
