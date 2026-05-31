import { Chess } from "chess.js";
import { normalizeLichessMoveTokens } from "./lichess-move-normalizer";
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
  startedGameAt?: string;
  completedGameAt?: string;
  finalPositionFen?: string;
  lastMoveUci?: string;
  lastMoveSan?: string;
  captures: QueenChallengeCaptureEvent[];
};

type LichessQueenChallengeGame = {
  id?: string;
  rated?: boolean;
  speed?: string;
  perf?: string;
  variant?: string;
  winner?: QueenChallengeSide;
  moves?: string;
  createdAt?: number;
  lastMoveAt?: number;
  players?: {
    white?: { user?: { name?: string } };
    black?: { user?: { name?: string } };
  };
};

export type QueenChallengeVerdict = {
  status: "passed" | "failed" | "pending";
  gameId: string;
  summary: string;
  evidence: string[];
  startedGameAt?: string;
  completedGameAt?: string;
  finalPositionFen?: string;
  lastMoveUci?: string;
  lastMoveSan?: string;
};

const ALLOWED_TIME_CLASSES = new Set<QueenChallengeTimeClass>(["bullet", "blitz", "rapid", "unknown"]);

const INITIAL_BOARD: Record<string, `${QueenChallengeSide}:${QueenChallengeCaptureEvent["capturedPiece"]}`> = {
  a1: "white:rook", b1: "white:knight", c1: "white:bishop", d1: "white:queen", e1: "white:king", f1: "white:bishop", g1: "white:knight", h1: "white:rook",
  a2: "white:pawn", b2: "white:pawn", c2: "white:pawn", d2: "white:pawn", e2: "white:pawn", f2: "white:pawn", g2: "white:pawn", h2: "white:pawn",
  a7: "black:pawn", b7: "black:pawn", c7: "black:pawn", d7: "black:pawn", e7: "black:pawn", f7: "black:pawn", g7: "black:pawn", h7: "black:pawn",
  a8: "black:rook", b8: "black:knight", c8: "black:bishop", d8: "black:queen", e8: "black:king", f8: "black:bishop", g8: "black:knight", h8: "black:rook",
};

function colorName(color: QueenChallengeSide) {
  return color === "white" ? "White" : "Black";
}

function opponentOf(color: QueenChallengeSide): QueenChallengeSide {
  return color === "white" ? "black" : "white";
}

function normalizeTimeClass(value?: string): QueenChallengeTimeClass {
  const normalized = value?.toLowerCase();
  return normalized === "bullet" || normalized === "blitz" || normalized === "rapid" || normalized === "classical" || normalized === "daily"
    ? normalized
    : "unknown";
}

function splitPiece(value: `${QueenChallengeSide}:${QueenChallengeCaptureEvent["capturedPiece"]}`) {
  const [color, piece] = value.split(":") as [QueenChallengeSide, QueenChallengeCaptureEvent["capturedPiece"]];
  return { color, piece };
}

function applyUciMove(
  board: Record<string, `${QueenChallengeSide}:${QueenChallengeCaptureEvent["capturedPiece"]}`>,
  move: string,
  ply: number,
): QueenChallengeCaptureEvent | null {
  const from = move.slice(0, 2);
  const to = move.slice(2, 4);
  const promotion = move.slice(4, 5);
  const moving = board[from];

  if (!moving || !/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(move)) {
    return null;
  }

  const movingPiece = splitPiece(moving);
  const captured = board[to];
  let capture: QueenChallengeCaptureEvent | null = captured
    ? {
        ply,
        capturedPiece: splitPiece(captured).piece,
        capturedColor: splitPiece(captured).color,
      }
    : null;

  if (!captured && movingPiece.piece === "pawn" && from[0] !== to[0]) {
    const capturedPawnSquare = `${to[0]}${from[1]}`;
    const enPassantCapture = board[capturedPawnSquare];
    if (enPassantCapture) {
      capture = {
        ply,
        capturedPiece: splitPiece(enPassantCapture).piece,
        capturedColor: splitPiece(enPassantCapture).color,
      };
      delete board[capturedPawnSquare];
    }
  }

  delete board[from];
  board[to] = promotion
    ? `${movingPiece.color}:${promotion === "q" ? "queen" : promotion === "r" ? "rook" : promotion === "b" ? "bishop" : "knight"}`
    : moving;

  if (movingPiece.piece === "king" && from === "e1" && to === "g1") { board.f1 = board.h1; delete board.h1; }
  if (movingPiece.piece === "king" && from === "e1" && to === "c1") { board.d1 = board.a1; delete board.a1; }
  if (movingPiece.piece === "king" && from === "e8" && to === "g8") { board.f8 = board.h8; delete board.h8; }
  if (movingPiece.piece === "king" && from === "e8" && to === "c8") { board.d8 = board.a8; delete board.a8; }

  return capture;
}

function replayUciMovesForProof(moves: string[]) {
  const chess = new Chess();
  let lastMove: { san: string; lan: string } | undefined;
  for (const move of moves) {
    if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/i.test(move)) continue;
    try {
      const applied = chess.move({ from: move.slice(0, 2), to: move.slice(2, 4), promotion: move.slice(4, 5) || undefined });
      if (applied) lastMove = { san: applied.san, lan: applied.lan };
    } catch {
      continue;
    }
  }
  return { finalPositionFen: chess.fen(), lastMoveUci: lastMove?.lan, lastMoveSan: lastMove?.san };
}

function queenProofFields(game: QueenChallengeGame) {
  return { finalPositionFen: game.finalPositionFen, lastMoveUci: game.lastMoveUci, lastMoveSan: game.lastMoveSan };
}

export function normalizeLichessQueenChallengeGame(
  game: LichessQueenChallengeGame,
  username: string,
): QueenChallengeGame | null {
  const normalizedUsername = username.trim().toLowerCase();
  const whiteName = game.players?.white?.user?.name?.trim().toLowerCase();
  const blackName = game.players?.black?.user?.name?.trim().toLowerCase();
  const playerColor = whiteName === normalizedUsername ? "white" : blackName === normalizedUsername ? "black" : null;

  if (!game.id || !playerColor || !game.moves) {
    return null;
  }

  const moves = normalizeLichessMoveTokens(game.moves);
  const board = { ...INITIAL_BOARD };
  const captures = moves
    .map((move, index) => applyUciMove(board, move, index + 1))
    .filter((capture): capture is QueenChallengeCaptureEvent => Boolean(capture));
  const proof = replayUciMovesForProof(moves);

  return {
    id: game.id,
    playerColor,
    winner: game.winner ?? "unknown",
    moveCount: Math.ceil(moves.length / 2),
    variant: game.variant ?? "standard",
    timeClass: normalizeTimeClass(game.perf ?? game.speed),
    rated: game.rated,
    startedGameAt: typeof game.createdAt === "number" ? new Date(game.createdAt).toISOString() : undefined,
    completedGameAt: typeof game.lastMoveAt === "number" ? new Date(game.lastMoveAt).toISOString() : undefined,
    ...proof,
    captures,
  };
}

export async function checkLatestLichessQueenNeverHeardOfHer(username: string): Promise<QueenChallengeVerdict> {
  if (!username.trim()) {
    return {
      status: "pending",
      gameId: "lichess-username-missing",
      summary: "Add a Lichess username before Side Quest Chess can inspect latest queenless attempts.",
      evidence: ["No Lichess username is stored."],
    };
  }

  try {
    const response = await fetch(
      `https://lichess.org/api/games/user/${encodeURIComponent(username.trim())}?max=5&moves=true&perfType=bullet,blitz,rapid&opening=false&clocks=false&evals=false`,
      {
        headers: {
          Accept: "application/x-ndjson",
          "User-Agent": "cc-verifier/0.1 (+https://cc-andreas-nordenadlers-projects.vercel.app)",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return {
        status: "pending",
        gameId: "lichess-latest-unavailable",
        summary: `Lichess latest-game lookup is temporarily unavailable for ${username}.`,
        evidence: [`Lichess returned HTTP ${response.status}.`],
      };
    }

    const games = (await response.text())
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as LichessQueenChallengeGame)
      .map((game) => normalizeLichessQueenChallengeGame(game, username))
      .filter((game): game is QueenChallengeGame => Boolean(game));

    if (!games.length) {
      return {
        status: "pending",
        gameId: "lichess-no-recent-games",
        summary: `No recent public bullet/blitz/rapid Lichess games were found for ${username}.`,
        evidence: ["The latest-games adapter returned no normalizable games."],
      };
    }

    return { ...evaluateQueenNeverHeardOfHer(games[0]), startedGameAt: games[0].startedGameAt, completedGameAt: games[0].completedGameAt };
  } catch {
    return {
      status: "pending",
      gameId: "lichess-latest-error",
      summary: `Lichess latest-game lookup could not complete for ${username}.`,
      evidence: ["Network or NDJSON parsing failed."],
    };
  }
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
      ...queenProofFields(game),
    };
  }

  if (!ALLOWED_TIME_CLASSES.has(game.timeClass ?? "unknown")) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "This game was outside the v1 bullet/blitz/rapid eligibility window.",
      evidence: [`Time class was ${game.timeClass}.`],
      ...queenProofFields(game),
    };
  }

  if (game.moveCount < 10) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "The game ended before the minimum 10-move proof threshold.",
      evidence: [`Game length was ${game.moveCount} moves.`],
      ...queenProofFields(game),
    };
  }

  if (game.winner !== playerColor) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "The queenless arc only counts if the player still wins afterwards.",
      evidence: [`Winner was ${game.winner === "draw" ? "draw" : colorName(game.winner as QueenChallengeSide)}.`],
      ...queenProofFields(game),
    };
  }

  if (!playerQueenLoss) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "No player queen loss was detected, which is annoyingly responsible chess.",
      evidence: [`${colorName(playerColor)} queen stayed on the board in the normalized capture feed.`],
      ...queenProofFields(game),
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
      ...queenProofFields(game),
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
      ...queenProofFields(game),
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
