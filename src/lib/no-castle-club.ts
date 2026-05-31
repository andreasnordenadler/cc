import { Chess } from "chess.js";
import { normalizeLichessMoveTokens } from "./lichess-move-normalizer";
export type NoCastleSide = "white" | "black";
export type NoCastleResult = "white" | "black" | "draw" | "unknown";
export type NoCastleTimeClass = "bullet" | "blitz" | "rapid" | "classical" | "daily" | "unknown";

export type NoCastleGame = {
  id: string;
  playerColor: NoCastleSide;
  winner: NoCastleResult;
  moveCount: number;
  variant?: "standard" | string;
  timeClass?: NoCastleTimeClass;
  rated?: boolean;
  startedGameAt?: string;
  completedGameAt?: string;
  castling: Array<{
    ply: number;
    color: NoCastleSide;
    side: "kingside" | "queenside";
    uci?: string;
    san?: string;
    fenAfter?: string;
  }>;
  normalizedMoves?: string[];
};

type LichessNoCastleGame = {
  id?: string;
  rated?: boolean;
  speed?: string;
  perf?: string;
  variant?: string;
  winner?: NoCastleSide;
  moves?: string;
  createdAt?: number;
  lastMoveAt?: number;
  players?: {
    white?: { user?: { name?: string } };
    black?: { user?: { name?: string } };
  };
};

export type NoCastleVerdict = {
  status: "passed" | "failed" | "pending";
  gameId: string;
  summary: string;
  evidence: string[];
  startedGameAt?: string;
  completedGameAt?: string;
  finalPositionFen?: string;
  lastMoveUci?: string;
  lastMoveSan?: string;
  failureDiagnostic?: {
    label?: string;
    explanation?: string;
    moveNumber?: number;
    ply?: number;
    san?: string;
    uci?: string;
    fenAtBreak?: string;
  };
};

const ALLOWED_TIME_CLASSES = new Set<NoCastleTimeClass>(["bullet", "blitz", "rapid", "unknown"]);

function colorName(color: NoCastleSide) {
  return color === "white" ? "White" : "Black";
}

function normalizeTimeClass(value?: string): NoCastleTimeClass {
  const normalized = value?.toLowerCase();
  return normalized === "bullet" || normalized === "blitz" || normalized === "rapid" || normalized === "classical" || normalized === "daily"
    ? normalized
    : "unknown";
}

function castlingFromUci(move: string, ply: number) {
  if (move === "e1g1") return { ply, color: "white" as const, side: "kingside" as const };
  if (move === "e1c1") return { ply, color: "white" as const, side: "queenside" as const };
  if (move === "e8g8") return { ply, color: "black" as const, side: "kingside" as const };
  if (move === "e8c8") return { ply, color: "black" as const, side: "queenside" as const };
  return null;
}

function applyUciMove(chess: Chess, uci: string) {
  const match = uci.match(/^([a-h][1-8])([a-h][1-8])([qrbn])?$/i);
  if (!match) return null;
  try {
    return chess.move({ from: match[1], to: match[2], promotion: match[3]?.toLowerCase() });
  } catch {
    return null;
  }
}

function enrichCastlingEvents(moves: string[]) {
  const chess = new Chess();
  const events: Array<{ ply: number; color: NoCastleSide; side: "kingside" | "queenside"; uci?: string; san?: string; fenAfter?: string }> = [];

  moves.forEach((move, index) => {
    const ply = index + 1;
    const castling = castlingFromUci(move, ply);
    const applied = applyUciMove(chess, move);

    if (castling) {
      events.push({ ...castling, uci: move, san: applied?.san, fenAfter: chess.fen() });
    }
  });

  return { events, finalPositionFen: chess.fen(), lastMoveUci: moves.at(-1), lastMoveSan: chess.history().at(-1) };
}

export function normalizeLichessNoCastleClubGame(
  game: LichessNoCastleGame,
  username: string,
): NoCastleGame | null {
  const normalizedUsername = username.trim().toLowerCase();
  const whiteName = game.players?.white?.user?.name?.trim().toLowerCase();
  const blackName = game.players?.black?.user?.name?.trim().toLowerCase();
  const playerColor = whiteName === normalizedUsername ? "white" : blackName === normalizedUsername ? "black" : null;

  if (!game.id || !playerColor || !game.moves) {
    return null;
  }

  const moves = normalizeLichessMoveTokens(game.moves);
  const proofPositions = enrichCastlingEvents(moves);
  const castling = proofPositions.events;

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
    castling,
    normalizedMoves: moves,
  };
}

export async function checkLatestLichessNoCastleClub(username: string): Promise<NoCastleVerdict> {
  if (!username.trim()) {
    return {
      status: "pending",
      gameId: "lichess-username-missing",
      summary: "Add a Lichess username before Side Quest Chess can inspect latest no-castle attempts.",
      evidence: ["No Lichess username is stored."],
    };
  }

  try {
    const response = await fetch(
      `https://lichess.org/api/games/user/${encodeURIComponent(username.trim())}?max=5&moves=true&perfType=bullet,blitz,rapid&opening=false&clocks=false&evals=false`,
      {
        headers: {
          Accept: "application/x-ndjson",
          "User-Agent": "cc-verifier/0.1 (+https://sidequestchess.com)",
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
      .map((line) => JSON.parse(line) as LichessNoCastleGame)
      .map((game) => normalizeLichessNoCastleClubGame(game, username))
      .filter((game): game is NoCastleGame => Boolean(game));

    if (!games.length) {
      return {
        status: "pending",
        gameId: "lichess-no-recent-games",
        summary: `No recent public bullet/blitz/rapid Lichess games were found for ${username}.`,
        evidence: ["The latest-games adapter returned no normalizable games."],
      };
    }

    return { ...evaluateNoCastleClub(games[0]), startedGameAt: games[0].startedGameAt, completedGameAt: games[0].completedGameAt };
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

export function evaluateNoCastleClub(game: NoCastleGame): NoCastleVerdict {
  const playerCastling = game.castling.find((event) => event.color === game.playerColor);
  const opponentCastling = game.castling.find((event) => event.color !== game.playerColor);
  const evidence: string[] = [];

  if (game.variant && game.variant !== "standard") {
    return {
      status: "failed",
      gameId: game.id,
      summary: "Variants are fun, but No Castle Club only counts standard chess games.",
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

  if (game.winner !== game.playerColor) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "No Castle Club only counts if the uncastled player still wins.",
      evidence: [`Winner was ${game.winner === "draw" ? "draw" : colorName(game.winner as NoCastleSide)}.`],
    };
  }

  if (playerCastling) {
    const moveNumber = moveNumberFromPly(playerCastling.ply);
    return {
      status: "failed",
      gameId: game.id,
      summary: `The king took the sensible ${playerCastling.side} castle. Club membership denied.`,
      evidence: [`${colorName(game.playerColor)} castled ${playerCastling.side} on move ${moveNumber}.`],
      finalPositionFen: playerCastling.fenAfter,
      lastMoveUci: playerCastling.uci,
      lastMoveSan: playerCastling.san,
      failureDiagnostic: {
        label: "Castling broke the condition",
        explanation: `${colorName(game.playerColor)} castled ${playerCastling.side} on move ${moveNumber}.`,
        moveNumber,
        ply: playerCastling.ply,
        san: playerCastling.san,
        uci: playerCastling.uci,
        fenAtBreak: playerCastling.fenAfter,
      },
    };
  }

  evidence.push(`${colorName(game.playerColor)} never castled in the normalized move feed.`);
  evidence.push(`${colorName(game.playerColor)} won after ${game.moveCount} moves.`);
  evidence.push(
    opponentCastling
      ? `${colorName(opponentCastling.color)} castled ${opponentCastling.side}; opponent shelter is allowed.`
      : "No castling by either side was detected.",
  );

  return {
    status: "passed",
    gameId: game.id,
    summary: "Win confirmed with zero player castling. The king stayed uninsured and somehow survived.",
    evidence,
  };
}

export const noCastleClubFixtures: NoCastleGame[] = [
  {
    id: "fixture-no-castle-win",
    playerColor: "white",
    winner: "white",
    moveCount: 24,
    variant: "standard",
    timeClass: "blitz",
    rated: true,
    castling: [{ ply: 12, color: "black", side: "kingside" }],
  },
  {
    id: "fixture-player-castled",
    playerColor: "white",
    winner: "white",
    moveCount: 28,
    variant: "standard",
    timeClass: "rapid",
    rated: false,
    castling: [{ ply: 11, color: "white", side: "kingside" }],
  },
  {
    id: "fixture-uncastled-loss",
    playerColor: "black",
    winner: "white",
    moveCount: 31,
    variant: "standard",
    timeClass: "blitz",
    rated: true,
    castling: [],
  },
];
