import ChallengeBadge from "@/components/challenge-badge";
import ShareProofActions from "@/components/share-proof-actions";
import type { Challenge } from "@/lib/challenges";
import type { ChallengeAttempt } from "@/lib/user-metadata";

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

type BoardSquare = {
  square: string;
  piece?: string;
  highlight?: boolean;
};

type ProofPositionBoardProps = {
  attempt: ChallengeAttempt | null;
  challenge: Challenge;
  sharePath: string;
};

export default function ProofPositionBoard({
  attempt,
  challenge,
  sharePath,
}: ProofPositionBoardProps) {
  const board = attempt?.finalPositionFen ? parseFenBoard(attempt.finalPositionFen, attempt.lastMoveUci) : null;
  const lastMove = attempt?.lastMoveSan ?? attempt?.lastMoveUci ?? null;
  const providerLabel = formatProvider(attempt?.provider);
  const gameLabel = attempt?.gameId ? `${providerLabel} game ${attempt.gameId}` : `${providerLabel} proof accepted`;
  const proofSummary = attempt?.summary ?? "The verifier accepted this quest and saved the completed proof receipt.";
  const achievementCopy = buildAchievementCopy(challenge, attempt);
  const scrollDate = formatScrollDate(attempt?.completedGameAt ?? attempt?.checkedAt);
  const shareCopy = `${achievementCopy} ${challenge.badgeIdentity.name} unlocked on Side Quest Chess. +${challenge.reward} points.`;

  return (
    <article className="note-card proof-position-card" aria-label="Victory proof receipt">
      <div className="proof-position-copy">
        <span className="eyebrow">Victory proof</span>
        <h3>{board ? "Final position captured." : "Your victory scroll is ready."}</h3>
        <p>
          {board
            ? "The verifier saved the final board position and last move, so this completed quest has a visual receipt ready to share."
            : "The verifier accepted the quest. Since this receipt does not include final-board data, the shareable proof leads with the unlocked coat of arms, the ridiculous achievement, and the seal of approval."}
        </p>
        <div className="proof-receipt-facts" aria-label="Proof receipt details">
          <span><strong>Quest</strong>{challenge.title}</span>
          <span><strong>Receipt</strong>{gameLabel}</span>
          <span><strong>Last move</strong>{lastMove ?? "Not captured for this proof"}</span>
        </div>
        <ShareProofActions
          copy={shareCopy}
          challengeTitle={challenge.title}
          sharePath={sharePath}
          copyLabel="Copy scroll text"
          shareLabel="Share victory scroll"
          idleCopy="Copies the lightly official good-news scroll text plus this quest-specific proof link."
        />
      </div>
      <div className="proof-board-wrap" data-board-state={board ? "ready" : "scroll"}>
        {board ? (
          <div className="proof-board" role="img" aria-label="Final chess position with last move highlighted">
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
        ) : (
          <div className="victory-scroll proof-victory-scroll" aria-label={`Victory scroll for ${challenge.title}`}>
            <div className="victory-scroll-burn top-left" aria-hidden="true" />
            <div className="victory-scroll-burn top-right" aria-hidden="true" />
            <div className="victory-scroll-crest">
              <ChallengeBadge challenge={challenge} presentation="art" earned />
            </div>
            <span className="victory-scroll-kicker">Side Quest Chess hereby admits</span>
            <h3>{challenge.badgeIdentity.name}</h3>
            <p className="victory-scroll-copy">{achievementCopy}</p>
            <p className="victory-scroll-proof">
              Proof accepted for <strong>{challenge.title}</strong>. {proofSummary}
            </p>
            <div className="victory-scroll-footer">
              <span>{scrollDate}</span>
              <span>+{challenge.reward} pts</span>
            </div>
            <div className="victory-scroll-seal" aria-label="Side Quest Chess seal of approval" />
          </div>
        )}
      </div>
    </article>
  );
}

function buildAchievementCopy(challenge: Challenge, attempt?: ChallengeAttempt | null) {
  const summary = attempt?.summary ?? challenge.objective;

  if (challenge.id === "finish-any-game") {
    return "A public chess game was, against all odds, completed. Win, loss, or draw — the ancient machinery blinked, nodded, and stamped the loop as functional.";
  }

  if (challenge.requirement.result === "win") {
    return `${summary} The bad idea survived contact with reality and still ended in victory, which frankly feels like a paperwork error.`;
  }

  if (challenge.requirement.result === "draw") {
    return `${summary} Nobody won, nobody learned, and yet the scroll department has approved the achievement.`;
  }

  if (challenge.requirement.result === "lose") {
    return `${summary} Losing on purpose-adjacent terms is still proof, and Side Quest Chess respects commitment to the bit.`;
  }

  return `${summary} The verifier accepted the evidence, so the coat of arms may now be displayed with entirely appropriate smugness.`;
}

function formatScrollDate(value?: string) {
  if (!value) return "Recorded by the suspicious little verifier";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recorded by the suspicious little verifier";

  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function formatProvider(provider?: ChallengeAttempt["provider"]): string {
  if (provider === "lichess") return "Lichess";
  if (provider === "chess.com") return "Chess.com";
  if (provider === "fixture") return "Fixture";
  return "Saved";
}

function parseFenBoard(fen: string, lastMoveUci?: string): BoardSquare[] | null {
  const placement = fen.trim().split(/\s+/)[0];
  const ranks = placement.split("/");

  if (ranks.length !== 8) {
    return null;
  }

  const highlightSquares = new Set<string>();
  if (lastMoveUci && /^[a-h][1-8][a-h][1-8]/.test(lastMoveUci)) {
    highlightSquares.add(lastMoveUci.slice(0, 2));
    highlightSquares.add(lastMoveUci.slice(2, 4));
  }

  const board: BoardSquare[] = [];

  ranks.forEach((rank, rankIndex) => {
    let fileIndex = 0;

    for (const token of rank) {
      if (/\d/.test(token)) {
        const emptyCount = Number(token);
        for (let offset = 0; offset < emptyCount; offset += 1) {
          const square = `${String.fromCharCode(97 + fileIndex)}${8 - rankIndex}`;
          board.push({ square, highlight: highlightSquares.has(square) });
          fileIndex += 1;
        }
        continue;
      }

      if (!PIECES[token]) {
        return;
      }

      const square = `${String.fromCharCode(97 + fileIndex)}${8 - rankIndex}`;
      board.push({ square, piece: token, highlight: highlightSquares.has(square) });
      fileIndex += 1;
    }
  });

  return board.length === 64 ? board : null;
}
