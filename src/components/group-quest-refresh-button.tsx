"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { buildMultiplayerCompletion, type MultiplayerCompletionQuestDetail } from "@/lib/multiplayer-completion-celebration";
import { SoloCompletionCelebration } from "./solo-completion-celebration";

export default function GroupQuestRefreshButton({
  id,
  finished = false,
  className,
  label = "Check my latest games",
  questDetails = [],
}: {
  id: string;
  finished?: boolean;
  className?: string;
  label?: string;
  questDetails?: MultiplayerCompletionQuestDetail[];
}) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [completion, setCompletion] = useState<ReturnType<typeof buildMultiplayerCompletion>>(null);

  return (
    <>
      <button
        className={className ?? "button secondary groupquest-refresh-button"}
        type="button"
        aria-label="Refresh checks"
        disabled={refreshing || finished}
        onClick={async () => {
          if (finished) {
            setStatus("Final standings are frozen for this Multiplayer Side Quest.");
            return;
          }
          setRefreshing(true);
          setStatus(null);
          try {
            const response = await fetch(`/api/groupquests/${id}/refresh`, { method: "POST" });
            const payload = await response.json().catch(() => null);
            if (!response.ok) {
              setStatus(payload?.error === "not_joined"
                ? "Join this Multiplayer Side Quest before refreshing checks."
                : payload?.error === "sign_in_required"
                  ? "Sign in to refresh Multiplayer Side Quest checks."
                  : payload?.error === "finished"
                    ? "Final standings are frozen for this Multiplayer Side Quest."
                    : "Could not refresh checks right now.");
            } else if (Array.isArray(payload?.checks)) {
              const passed = payload.checks.filter((check: { status?: string }) => check.status === "passed").length;
              setStatus(`${passed} of ${payload.checks.length} Side Quests verified from your latest public games.`);
              setCompletion(buildMultiplayerCompletion({
                newlyPassedQuestIds: Array.isArray(payload.newlyPassedQuestIds) ? payload.newlyPassedQuestIds : [],
                questDetails,
              }));
            }
          } finally {
            router.refresh();
            setTimeout(() => setRefreshing(false), 700);
          }
        }}
      >
        {finished ? "Final standings frozen" : refreshing ? "Checking…" : label}
      </button>
      {status ? <small role="status" aria-live="polite">{status}</small> : null}
      {completion ? (
        <SoloCompletionCelebration
          completion={completion.completion}
          mode="multiplayer"
          extraCompletedCount={completion.extraCompletedCount}
          onClose={() => setCompletion(null)}
        />
      ) : null}
    </>
  );
}
