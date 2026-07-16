"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { leaveGroupQuest } from "@/lib/group-quest-leave";

export default function GroupQuestLeaveAction({ id }: { id: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function leaveSideQuest() {
    setSubmitting(true);
    setError(null);
    try {
      const result = await leaveGroupQuest(id, {
        confirm: (message) => window.confirm(message),
        request: fetch,
        navigate: (destination) => {
          router.push(destination);
          router.refresh();
        },
      });
      if (result.kind === "error") {
        setError(result.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="groupquest-leave-zone" aria-label="Leave this Multiplayer Side Quest">
      <p>Need to leave this Multiplayer Side Quest?</p>
      <button className="groupquest-leave-button" type="button" onClick={leaveSideQuest} disabled={submitting}>
        {submitting ? "Leaving…" : "Leave Side Quest"}
      </button>
      {error ? <small>{error}</small> : null}
    </section>
  );
}
