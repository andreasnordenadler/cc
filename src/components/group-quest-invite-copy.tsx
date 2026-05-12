"use client";

import { useState } from "react";

const storagePrefix = "sqc-groupquest-draft:";

type StoredGroupQuestDraft = {
  inviteCopy?: unknown;
};

function readStoredInviteCopy(id: string, fallback: string) {
  if (typeof window === "undefined") return fallback;

  try {
    const stored = window.localStorage.getItem(`${storagePrefix}${id}`);
    if (!stored) return fallback;
    const draft = JSON.parse(stored) as StoredGroupQuestDraft;
    if (typeof draft.inviteCopy === "string" && draft.inviteCopy.trim()) {
      return draft.inviteCopy.trim();
    }
  } catch {
    // Keep the server-rendered default copy if local preview data is missing or malformed.
  }

  return fallback;
}

export default function GroupQuestInviteCopy({ id, fallback }: { id: string; fallback: string }) {
  const [copy] = useState(() => readStoredInviteCopy(id, fallback));

  return <p className="hero-copy">{copy}</p>;
}
