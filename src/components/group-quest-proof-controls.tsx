"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type InitialProofState = {
  score: number;
  completedQuestIds: string[];
  lastProofSummary?: string | null;
  lastProofAt?: string | null;
};

type QuestSummary = {
  id: string;
  title: string;
  reward: number;
};

type ProofCheck = {
  questId: string;
  status: string;
  summary?: string | null;
  gameId?: string | null;
};

type RefreshResponse = {
  ok?: boolean;
  error?: string;
  completedQuestIds?: string[];
  score?: number;
  checks?: ProofCheck[];
};

function formatProofTime(value?: string | null) {
  if (!value) return "Not checked yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Stockholm",
    timeZoneName: "short",
  }).format(date);
}

function friendlyError(error?: string) {
  if (error === "sign_in_required") return "Sign in to check Multiplayer proof.";
  if (error === "not_joined") return "Join this Multiplayer Side Quest before checking proof.";
  if (error === "not_found") return "This Multiplayer Side Quest could not be found.";
  return "Could not refresh Multiplayer proof right now.";
}

export default function GroupQuestProofControls({ id, quests, initialState }: { id: string; quests: QuestSummary[]; initialState: InitialProofState }) {
  const router = useRouter();
  const [state, setState] = useState(initialState);
  const [checks, setChecks] = useState<ProofCheck[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const completed = new Set(state.completedQuestIds);
  const completedCount = quests.filter((quest) => completed.has(quest.id)).length;

  async function refreshProof() {
    setSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/groupquests/${id}/refresh`, { method: "POST" });
      const payload = (await response.json().catch(() => null)) as RefreshResponse | null;

      if (!response.ok || !payload?.ok) {
        setError(friendlyError(payload?.error));
        return;
      }

      const completedQuestIds = payload.completedQuestIds ?? [];
      setState({
        score: payload.score ?? 0,
        completedQuestIds,
        lastProofSummary: payload.checks?.at(-1)?.summary ?? "Proof refreshed.",
        lastProofAt: new Date().toISOString(),
      });
      setChecks(payload.checks ?? []);
      setMessage(completedQuestIds.length === quests.length ? "Proof refreshed — every Side Quest is verified for this Multiplayer run." : "Proof refreshed. Play another fresh public game if a quest still needs work.");
      router.refresh();
    } catch {
      setError("Could not reach the proof checker right now.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mission-card groupquest-proof-controls" aria-label="Multiplayer proof controls">
      <div className="section-head compact">
        <div>
          <span className="eyebrow">Proof controls</span>
          <h2>Refresh your Multiplayer proof.</h2>
          <p>Check your latest public game against this Multiplayer Side Quest window. Solo Coat of Arms proof stays separate.</p>
        </div>
        <button className="button primary" type="button" onClick={refreshProof} disabled={submitting}>
          {submitting ? "Checking…" : "Check latest game"}
        </button>
      </div>

      <div className="groupquest-score-strip groupquest-proof-strip" aria-label="Your proof receipt summary">
        <div>
          <strong>{completedCount} / {quests.length}</strong>
          <span>Verified here</span>
        </div>
        <div>
          <strong>{state.score}</strong>
          <span>Multiplayer pts</span>
        </div>
        <div>
          <strong>{formatProofTime(state.lastProofAt)}</strong>
          <span>Last check</span>
        </div>
        <div>
          <strong>{state.lastProofSummary || "Fresh game needed"}</strong>
          <span>Latest receipt</span>
        </div>
      </div>

      <div className="groupquest-proof-checks" aria-label="Quest proof checklist">
        {quests.map((quest) => {
          const check = checks.find((entry) => entry.questId === quest.id);
          const isComplete = completed.has(quest.id);
          return (
            <article className={isComplete ? "groupquest-proof-check passed" : "groupquest-proof-check"} key={quest.id}>
              <span className="badge green">{isComplete ? "Verified" : check?.status === "failed" ? "Needs another game" : "Open"}</span>
              <strong>{quest.title}</strong>
              <small>{check?.summary ?? (isComplete ? "Already counted for this Multiplayer Side Quest." : `${quest.reward} pts available inside this run.`)}</small>
            </article>
          );
        })}
      </div>

      {message ? <p className="groupquest-proof-message" role="status">{message}</p> : null}
      {error ? <p className="groupquest-proof-error" role="alert">{error}</p> : null}
    </section>
  );
}
