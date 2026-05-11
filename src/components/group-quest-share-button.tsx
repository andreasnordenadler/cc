"use client";

import { useState } from "react";

export default function GroupQuestShareButton({ questName, shareUrl }: { questName: string; shareUrl: string }) {
  const [copied, setCopied] = useState(false);

  function copyInviteText() {
    const inviteText = `Join my Side Quest Chess Multiplayer Side Quest: ${questName} — ${shareUrl}`;
    navigator.clipboard?.writeText(inviteText).then(
      () => setCopied(true),
      () => setCopied(false),
    );
  }

  return (
    <button className="button secondary" onClick={copyInviteText} type="button">
      {copied ? "Invite text copied" : "Copy invite text"}
    </button>
  );
}
