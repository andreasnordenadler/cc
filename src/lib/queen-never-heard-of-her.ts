export type QueenChallengeSide = "white" | "black";
export type QueenChallengeResult = "white" | "black" | "draw" | "unknown";
export type QueenChallengeTimeClass = "bullet" | "blitz" | "rapid" | "classical" | "daily" | "unknown";

export type QueenChallengeCaptureEvent = {
  ply: number;
  capturedPiece: "queen" | "rook" | "bishop" | "knight" | "pawn" | "king";
  capturedColor: QueenChallengeSide;
};

export type QueenChallengeGame = {
  id: string;
  playerColor: QueenChallengeSide;
  winner: QueenChallengeResult;
  moveCount: number;
  variant?: "standard" | string;
  timeClass?: QueenChallengeTimeClass;
  rated?: boolean;
  captures: QueenChallengeCaptureEvent[];
};

export type QueenChallengeVerdict = {
  status: "passed" | "failed" | "pending";
  gameId: string;
  summary: string;
  evidence: string[];
};

const ALLOWED_TIME_CLASSES = new Set<QueenChallengeTimeClass>(["bullet", "blitz", "rapid", "unknown"]);

function colorName(color: QueenChallengeSide) {
  return color === "white" ? "White" : "Black";
}

function opponentOf(color: QueenChallengeSide): QueenChallengeSide {
  return color === "white" ? "black" : "white";
}

export function moveNumberFromPly(ply: number): number {
  return Math.ceil(ply / 2);
}

export function evaluateQueenNeverHeardOfHer(game: QueenChallengeGame): QueenChallengeVerdict {
  const playerColor = game.playerColor;
  const opponentColor = opponentOf(playerColor);
  const playerQueenLoss = game.captures.find(
    (capture) => capture.capturedPiece === "queen" && capture.capturedColor === playerColor,
  );
  const opponentQueenLossBeforePlayerLoss = playerQueenLoss
    ? game.captures.find(
        (capture) =>
          capture.capturedPiece === "queen" &&
          capture.capturedColor === opponentColor &&
          capture.ply <= playerQueenLoss.ply,
      )
    : undefined;
  const evidence: string[] = [];

  if (game.variant && game.variant !== "standard") {
    return {
      status: "failed",
      gameId: game.id,
      summary: "Variants are fun, but this side quest only counts standard chess games.",
      evidence: [`Variant was ${game.variant}.`],
    };
  }

  if (!ALLOWED_TIME_CLASSES.has(game.timeClass ?? "unknown")) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "This game was outside the v1 bullet/blitz/rapid eligibility window.",
      evidence: [`Time class was ${game.timeClass}.`],
    };
  }

  if (game.moveCount < 10) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "The game ended before the minimum 10-move proof threshold.",
      evidence: [`Game length was ${game.moveCount} moves.`],
    };
  }

  if (game.winner !== playerColor) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "The queenless arc only counts if the player still wins afterwards.",
      evidence: [`Winner was ${game.winner === "draw" ? "draw" : colorName(game.winner as QueenChallengeSide)}.`],
    };
  }

  if (!playerQueenLoss) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "No player queen loss was detected, which is annoyingly responsible chess.",
      evidence: [`${colorName(playerColor)} queen stayed on the board in the normalized capture feed.`],
    };
  }

  const queenLossMove = moveNumberFromPly(playerQueenLoss.ply);
  evidence.push(`${colorName(playerColor)} queen was captured on move ${queenLossMove}.`);

  if (queenLossMove >= 15) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "The queen went missing, but too late for this particular bad idea.",
      evidence: [...evidence, "Queen must be lost before move 15."],
    };
  }

  if (opponentQueenLossBeforePlayerLoss) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "Both queens were already off, so the opponent did not still have theirs at the proof moment.",
      evidence: [
        ...evidence,
        `${colorName(opponentColor)} queen was also gone by move ${moveNumberFromPly(opponentQueenLossBeforePlayerLoss.ply)}.`,
      ],
    };
  }

  evidence.push(`${colorName(opponentColor)} queen was still present when the queenless run began.`);
  evidence.push(`${colorName(playerColor)} won after ${game.moveCount} moves.`);

  return {
    status: "passed",
    gameId: game.id,
    summary: "Queen lost before move 15, opponent queen still alive, player still won. Certified queenless nonsense.",
    evidence,
  };
}

export const queenNeverHeardOfHerFixtures: QueenChallengeGame[] = [
  {
    id: "fixture-queenless-win",
    playerColor: "white",
    winner: "white",
    moveCount: 37,
    variant: "standard",
    timeClass: "blitz",
    rated: true,
    captures: [
      { ply: 17, capturedPiece: "queen", capturedColor: "white" },
      { ply: 52, capturedPiece: "queen", capturedColor: "black" },
    ],
  },
  {
    id: "fixture-queen-stayed-home",
    playerColor: "black",
    winner: "black",
    moveCount: 28,
    variant: "standard",
    timeClass: "rapid",
    rated: false,
    captures: [{ ply: 31, capturedPiece: "rook", capturedColor: "black" }],
  },
  {
    id: "fixture-traded-queens-first",
    playerColor: "white",
    winner: "white",
    moveCount: 41,
    variant: "standard",
    timeClass: "blitz",
    rated: true,
    captures: [
      { ply: 11, capturedPiece: "queen", capturedColor: "black" },
      { ply: 12, capturedPiece: "queen", capturedColor: "white" },
    ],
  },
];
