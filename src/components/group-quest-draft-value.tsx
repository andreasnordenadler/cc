"use client";

import { useState } from "react";

const storagePrefix = "sqc-groupquest-draft:";

type StoredGroupQuestDraft = Record<string, unknown>;

function readStoredString(id: string, field: string, fallback: string) {
  if (typeof window === "undefined") return fallback;

  try {
    const stored = window.localStorage.getItem(`${storagePrefix}${id}`);
    if (!stored) return fallback;
    const draft = JSON.parse(stored) as StoredGroupQuestDraft;
    const value = draft[field];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  } catch {
    // Keep the server-rendered fallback if local preview data is missing or malformed.
  }

  return fallback;
}

export default function GroupQuestDraftValue({
  id,
  field,
  fallback,
}: {
  id: string;
  field: string;
  fallback: string;
}) {
  const [value] = useState(() => readStoredString(id, field, fallback));

  return <>{value}</>;
}
