import ShareProofActions from "@/components/share-proof-actions";
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
  challengeTitle: string;
  badgeName: string;
  reward: number;
  sharePath: string;
};

export default function ProofPositionBoard({
  attempt,
  challengeTitle,
  badgeName,
  reward,
  sharePath,
}: ProofPositionBoardProps) {
  const board = attempt?.finalPositionFen ? parseFenBoard(attempt.finalPositionFen, attempt.lastMoveUci) : null;
  const lastMove = attempt?.lastMoveSan ?? attempt?.lastMoveUci ?? null;
  const providerLabel = formatProvider(attempt?.provider);
  const gameLabel = attempt?.gameId ? `${providerLabel} game ${attempt.gameId}` : `${providerLabel} proof accepted`;
  const proofSummary = attempt?.summary ?? "The verifier accepted this quest and saved the completed proof receipt.";
  const shareCopy = `I completed “${challengeTitle}” on Side Quest Chess. ${badgeName} unlocked. +${reward} points. Proof accepted: ${proofSummary}`;

  return (
    <article className="note-card proof-position-card" aria-label="Victory proof receipt">
      <div className="proof-position-copy">
        <span className="eyebrow">Victory proof</span>
        <h3>{board ? "Final position captured." : "Quest proof accepted."}</h3>
        <p>
          {board
            ? "The verifier saved the final board position and last move, so this completed quest has a visual receipt ready to share."
            : "This quest is complete and the verifier accepted the receipt. Final-board data was not captured for this proof, so the receipt leads with the accepted verifier summary instead of showing an empty board."}
        </p>
        <div className="proof-receipt-facts" aria-label="Proof receipt details">
          <span><strong>Quest</strong>{challengeTitle}</span>
          <span><strong>Receipt</strong>{gameLabel}</span>
          <span><strong>Last move</strong>{lastMove ?? "Not captured for this proof"}</span>
        </div>
        <ShareProofActions
          copy={shareCopy}
          challengeTitle={challengeTitle}
          sharePath={sharePath}
          copyLabel="Copy victory proof"
          shareLabel="Share victory proof"
          idleCopy="Copies the accepted proof summary plus this quest-specific proof link."
        />
      </div>
      <div className="proof-board-wrap" data-board-state={board ? "ready" : "receipt"}>
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
          <div className="proof-receipt-seal" role="img" aria-label="Accepted proof receipt without final board data">
            <span>Proof accepted</span>
          </div>
        )}
      </div>
    </article>
  );
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
