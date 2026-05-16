"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GroupQuestLeaveAction({ id }: { id: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function leaveSideQuest() {
    const confirmed = window.confirm(
      "Leave this Multiplayer Side Quest? Your participant entry will be removed from this quest, but you can rejoin later if it is still open."
    );

    if (!confirmed) return;

    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/groupquests/${id}/leave`, { method: "POST" });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.error === "not_joined" ? "You are not currently joined to this quest." : "Could not leave this quest right now.");
        return;
      }
      router.push(`/groupquests/${id}`);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="groupquest-leave-zone" aria-label="Leave this Multiplayer Side Quest">
      <p>Need to leave this Multiplayer Side Quest?</p>
      <button className="groupquest-leave-button" type="button" onClick={leaveSideQuest} disabled={submitting}>
        {submitting ? "Leaving…" : "Leave quest"}
      </button>
      {error ? <small>{error}</small> : null}
    </section>
  );
}
