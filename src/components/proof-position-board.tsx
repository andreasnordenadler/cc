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

export default function ProofPositionBoard({ attempt }: { attempt: ChallengeAttempt | null }) {
  const board = attempt?.finalPositionFen ? parseFenBoard(attempt.finalPositionFen, attempt.lastMoveUci) : null;
  const lastMove = attempt?.lastMoveSan ?? attempt?.lastMoveUci ?? "not captured yet";

  return (
    <article className="note-card proof-position-card" aria-label="Final proof position">
      <div className="proof-position-copy">
        <span className="eyebrow">Final proof position</span>
        <h3>{board ? "Show the receipt, not just the text." : "Chessboard proof slot is ready."}</h3>
        <p>
          {board
            ? "This receipt can show the final board with the last move highlighted, so a completed quest becomes visual proof instead of a wall of verifier text."
            : "Receipts now have a dedicated board slot. Next verifier pass can store final FEN + last move, and completed quests will render the proof board automatically."}
        </p>
        <small>Last move: {lastMove}</small>
      </div>
      <div className="proof-board-wrap" data-board-state={board ? "ready" : "pending"}>
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
          <div className="proof-board proof-board-empty" role="img" aria-label="Pending final chess position capture">
            {Array.from({ length: 64 }, (_, index) => (
              <span key={index} className="proof-board-square" />
            ))}
          </div>
        )}
      </div>
    </article>
  );
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
