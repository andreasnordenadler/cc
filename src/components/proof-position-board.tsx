import VictoryScroll from "@/components/victory-scroll";
import type { Challenge } from "@/lib/challenges";
import { sanitizeAttemptSummary, type ChallengeAttempt } from "@/lib/user-metadata";

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
};

export default function ProofPositionBoard({
  attempt,
  challenge,
}: ProofPositionBoardProps) {
  const board = attempt?.finalPositionFen ? parseFenBoard(attempt.finalPositionFen, attempt.lastMoveUci) : null;
  const proofSummary = sanitizeAttemptSummary(attempt?.summary);
  const achievementCopy = buildAchievementCopy(challenge, attempt);
  const scrollDate = formatScrollDate(attempt?.completedGameAt ?? attempt?.checkedAt);

  return (
    <article className="note-card proof-position-card proof-position-visual-card" aria-label="Victory proof receipt">
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
          <VictoryScroll
            challenge={challenge}
            achievementCopy={achievementCopy}
            proofLine={<>Proof accepted: <strong>{challenge.title}</strong> — {proofSummary}</>}
            dateLabel={scrollDate}
            reward={challenge.reward}
            className="proof-victory-scroll"
          />
        )}
      </div>
    </article>
  );
}

function buildAchievementCopy(challenge: Challenge, attempt?: ChallengeAttempt | null) {
  const summary = sanitizeAttemptSummary(attempt?.summary) ?? challenge.objective;

  if (challenge.id === "finish-any-game") {
    return "A public chess game was, against all odds, completed. Win, loss, or draw — the clerks checked the paperwork and declared this good enough for a coat of arms.";
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
