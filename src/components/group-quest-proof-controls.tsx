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
  finalPositionFen?: string | null;
  lastMoveUci?: string | null;
  lastMoveSan?: string | null;
};

type BoardSquare = {
  square: string;
  piece?: string;
  highlight?: boolean;
};

const PIECES: Record<string, string> = {
  K: "♔",
  Q: "♕",
  R: "♖",
  B: "♗",
  N: "♘",
  P: "♙",
  k: "♚",
  q: "♛",
  r: "♜",
  b: "♝",
  n: "♞",
  p: "♟",
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
  if (error === "finished") return "This Multiplayer Side Quest has ended. Final standings are frozen, so proof checks no longer change the leaderboard.";
  return "Could not refresh Multiplayer proof right now.";
}

function parseFenBoard(fen?: string | null, lastMoveUci?: string | null): BoardSquare[] | null {
  const placement = fen?.trim().split(/\s+/)[0];
  if (!placement) return null;
  const ranks = placement.split("/");
  if (ranks.length !== 8) return null;

  const highlightSquares = new Set<string>();
  if (lastMoveUci && /^[a-h][1-8][a-h][1-8]/.test(lastMoveUci)) {
    highlightSquares.add(lastMoveUci.slice(0, 2));
    highlightSquares.add(lastMoveUci.slice(2, 4));
  }

  const board: BoardSquare[] = [];
  for (const [rankIndex, rank] of ranks.entries()) {
    let fileIndex = 0;
    for (const token of rank) {
      if (/\d/.test(token)) {
        for (let offset = 0; offset < Number(token); offset += 1) {
          const square = `${String.fromCharCode(97 + fileIndex)}${8 - rankIndex}`;
          board.push({ square, highlight: highlightSquares.has(square) });
          fileIndex += 1;
        }
        continue;
      }

      if (!PIECES[token]) return null;
      const square = `${String.fromCharCode(97 + fileIndex)}${8 - rankIndex}`;
      board.push({ square, piece: token, highlight: highlightSquares.has(square) });
      fileIndex += 1;
    }
  }

  return board.length === 64 ? board : null;
}

function MultiplayerProofBoard({ check }: { check: ProofCheck }) {
  const board = parseFenBoard(check.finalPositionFen, check.lastMoveUci);
  if (!board) return null;

  return (
    <div className="groupquest-proof-board" aria-label="Multiplayer proof board">
      <span className="eyebrow">Proof board</span>
      <div className="proof-board-wrap" data-board-state="ready">
        <div className="proof-board" role="img" aria-label="Chess position with last move highlighted">
          {board.map((square) => (
            <span
              key={square.square}
              className={`proof-board-square ${square.highlight ? "highlight" : ""}`}
              aria-label={`${square.square}${square.piece ? ` ${square.piece}` : " empty"}`}
            >
              {square.piece ? PIECES[square.piece] : null}
            </span>
          ))}
        </div>
      </div>
      {check.lastMoveSan || check.lastMoveUci ? <small>Last move: {check.lastMoveSan ?? check.lastMoveUci}</small> : null}
    </div>
  );
}

export default function GroupQuestProofControls({ id, quests, initialState, finished = false }: { id: string; quests: QuestSummary[]; initialState: InitialProofState; finished?: boolean }) {
  const router = useRouter();
  const [state, setState] = useState(initialState);
  const [checks, setChecks] = useState<ProofCheck[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const completed = new Set(state.completedQuestIds);
  const completedCount = quests.filter((quest) => completed.has(quest.id)).length;

  async function refreshProof() {
    if (finished) {
      setMessage(null);
      setError(friendlyError("finished"));
      return;
    }
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
          <h2>Check the table without leaving the page.</h2>
          <p>SQC judges your newest eligible public game for every quest in this Multiplayer run, then writes the receipts below.</p>
        </div>
      </div>

      <div className="proof-check-actions groupquest-proof-actions" aria-label="Multiplayer proof check choices">
        <article className="proof-check-card proof-check-card-primary">
          <span className="eyebrow">Fastest check</span>
          <h3>Judge my latest table game.</h3>
          <p>Use this after you finish a fresh Lichess or Chess.com game inside this Multiplayer window. One check updates your receipts, boards, and leaderboard progress.</p>
          <button className="button primary" type="button" onClick={refreshProof} disabled={submitting || finished}>
            {finished ? "Final standings frozen" : submitting ? "Checking…" : "Check latest game"}
          </button>
        </article>
        <article className="proof-check-card">
          <span className="eyebrow">What SQC checks</span>
          <h3>Same rules, same receipt.</h3>
          <p>The verifier checks the quest objective, provider, finished-game status, and table time window. Passed checks can also add safe proof to your account Trophy Cabinet.</p>
        </article>
      </div>

      <div className="groupquest-progress-strip groupquest-proof-strip" aria-label="Your proof receipt summary">
        <div>
          <strong>{completedCount} / {quests.length}</strong>
          <span>Verified here</span>
        </div>
        <div>
          <strong>{completedCount} / {quests.length}</strong>
          <span>Verified progress</span>
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
              <small>{check?.summary ?? (isComplete ? "Already counted for this Multiplayer Side Quest." : "Available inside this run.")}</small>
              {check ? <MultiplayerProofBoard check={check} /> : null}
            </article>
          );
        })}
      </div>

      {message ? <p className="groupquest-proof-message" role="status">{message}</p> : null}
      {error ? <p className="groupquest-proof-error" role="alert">{error}</p> : null}
    </section>
  );
}
