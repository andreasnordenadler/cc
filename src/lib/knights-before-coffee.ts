import { Chess } from "chess.js";
import { normalizeLichessMoveTokens } from "./lichess-move-normalizer";
export type KnightsBeforeCoffeeSide = "white" | "black";
export type KnightsBeforeCoffeeResult = KnightsBeforeCoffeeSide | "draw" | "unknown";
export type KnightsBeforeCoffeeTimeClass = "bullet" | "blitz" | "rapid" | "classical" | "daily" | "unknown";

type PieceType = "pawn" | "knight" | "bishop" | "rook" | "queen" | "king";

export type KnightsBeforeCoffeeGame = {
  id: string;
  playerColor: KnightsBeforeCoffeeSide;
  winner: KnightsBeforeCoffeeResult;
  moveCount: number;
  variant?: "standard" | string;
  timeClass?: KnightsBeforeCoffeeTimeClass;
  rated?: boolean;
  startedGameAt?: string;
  completedGameAt?: string;
  firstFourPlayerMovePieces: PieceType[];
  finalPositionFen?: string;
  lastMoveUci?: string;
  lastMoveSan?: string;
  firstNonKnightMove?: {
    piece: PieceType;
    moveNumber: number;
    ply: number;
    san?: string;
    uci?: string;
    fenAfter?: string;
  };
};

type LichessKnightsBeforeCoffeeGame = {
  id?: string;
  rated?: boolean;
  speed?: string;
  perf?: string;
  variant?: string;
  winner?: KnightsBeforeCoffeeSide;
  moves?: string;
  createdAt?: number;
  lastMoveAt?: number;
  players?: {
    white?: { user?: { name?: string } };
    black?: { user?: { name?: string } };
  };
};

export type KnightsBeforeCoffeeVerdict = {
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
    playerColor?: "white" | "black";
  };
};

const ALLOWED_TIME_CLASSES = new Set<KnightsBeforeCoffeeTimeClass>(["bullet", "blitz", "rapid", "unknown"]);

function colorName(color: KnightsBeforeCoffeeSide) {
  return color === "white" ? "White" : "Black";
}

function pieceName(piece: PieceType) {
  return piece === "knight" ? "knight" : piece;
}

function normalizeTimeClass(value?: string): KnightsBeforeCoffeeTimeClass {
  const normalized = value?.toLowerCase();
  return normalized === "bullet" || normalized === "blitz" || normalized === "rapid" || normalized === "classical" || normalized === "daily"
    ? normalized
    : "unknown";
}

function pieceTypeFromChessJs(piece?: string): PieceType | null {
  if (piece === "n") return "knight";
  if (piece === "b") return "bishop";
  if (piece === "r") return "rook";
  if (piece === "q") return "queen";
  if (piece === "k") return "king";
  if (piece === "p") return "pawn";
  return null;
}

function analyzeUciMoves(moves: string[], playerColor: KnightsBeforeCoffeeSide) {
  const chess = new Chess();
  const playerPieces: PieceType[] = [];
  let firstNonKnightMove: KnightsBeforeCoffeeGame["firstNonKnightMove"];
  let lastMoveUci: string | undefined;
  let lastMoveSan: string | undefined;

  for (const token of moves) {
    const move = chess.move({ from: token.slice(0, 2), to: token.slice(2, 4), promotion: token.slice(4, 5) || undefined });
    lastMoveUci = move.lan;
    lastMoveSan = move.san;

    if (move.color === (playerColor === "white" ? "w" : "b")) {
      const piece = pieceTypeFromChessJs(move.piece);
      if (piece && playerPieces.length < 4) {
        playerPieces.push(piece);
        if (!firstNonKnightMove && piece !== "knight") {
          firstNonKnightMove = {
            piece,
            moveNumber: playerPieces.length,
            ply: chess.history().length,
            san: move.san,
            uci: move.lan,
            fenAfter: chess.fen(),
          };
        }
      }
    }
  }

  return { firstFourPlayerMovePieces: playerPieces, finalPositionFen: chess.fen(), lastMoveUci, lastMoveSan, firstNonKnightMove };
}

export function normalizeLichessKnightsBeforeCoffeeGame(
  game: LichessKnightsBeforeCoffeeGame,
  username: string,
): KnightsBeforeCoffeeGame | null {
  const normalizedUsername = username.trim().toLowerCase();
  const whiteName = game.players?.white?.user?.name?.trim().toLowerCase();
  const blackName = game.players?.black?.user?.name?.trim().toLowerCase();
  const playerColor = whiteName === normalizedUsername ? "white" : blackName === normalizedUsername ? "black" : null;

  if (!game.id || !playerColor || !game.moves) {
    return null;
  }

  const moves = normalizeLichessMoveTokens(game.moves);
  const analysis = analyzeUciMoves(moves, playerColor);

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
    firstFourPlayerMovePieces: analysis.firstFourPlayerMovePieces,
    finalPositionFen: analysis.finalPositionFen,
    lastMoveUci: analysis.lastMoveUci,
    lastMoveSan: analysis.lastMoveSan,
    firstNonKnightMove: analysis.firstNonKnightMove,
  };
}

export async function checkLatestLichessKnightsBeforeCoffee(username: string): Promise<KnightsBeforeCoffeeVerdict> {
  if (!username.trim()) {
    return {
      status: "pending",
      gameId: "lichess-username-missing",
      summary: "Add a Lichess username before Side Quest Chess can inspect latest horse-first attempts.",
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
      .map((line) => JSON.parse(line) as LichessKnightsBeforeCoffeeGame)
      .map((game) => normalizeLichessKnightsBeforeCoffeeGame(game, username))
      .filter((game): game is KnightsBeforeCoffeeGame => Boolean(game));

    if (!games.length) {
      return {
        status: "pending",
        gameId: "lichess-no-recent-games",
        summary: `No recent public bullet/blitz/rapid Lichess games were found for ${username}.`,
        evidence: ["The latest-games adapter returned no normalizable games."],
      };
    }

    return { ...evaluateKnightsBeforeCoffee(games[0]), startedGameAt: games[0].startedGameAt, completedGameAt: games[0].completedGameAt };
  } catch {
    return {
      status: "pending",
      gameId: "lichess-latest-error",
      summary: `Lichess latest-game lookup could not complete for ${username}.`,
      evidence: ["Network or NDJSON parsing failed."],
    };
  }
}

export function evaluateKnightsBeforeCoffee(game: KnightsBeforeCoffeeGame): KnightsBeforeCoffeeVerdict {
  if (game.variant && game.variant !== "standard") {
    return {
      status: "failed",
      gameId: game.id,
      summary: "Variants are wonderful chaos, but Knights Before Coffee only counts standard chess games.",
      evidence: [`Variant was ${game.variant}.`],
      finalPositionFen: game.finalPositionFen,
      lastMoveUci: game.lastMoveUci,
      lastMoveSan: game.lastMoveSan,
    };
  }

  if (!ALLOWED_TIME_CLASSES.has(game.timeClass ?? "unknown")) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "This game was outside the v1 bullet/blitz/rapid eligibility window.",
      evidence: [`Time class was ${game.timeClass}.`],
      finalPositionFen: game.finalPositionFen,
      lastMoveUci: game.lastMoveUci,
      lastMoveSan: game.lastMoveSan,
    };
  }

  if (game.winner !== game.playerColor) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "Knights Before Coffee only counts if the horse-first player wins.",
      evidence: [`Winner was ${game.winner === "draw" ? "draw" : colorName(game.winner as KnightsBeforeCoffeeSide)}.`],
      finalPositionFen: game.finalPositionFen,
      lastMoveUci: game.lastMoveUci,
      lastMoveSan: game.lastMoveSan,
    };
  }

  if (game.firstFourPlayerMovePieces.length < 4) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "The game ended before four player moves could prove the horse-first ritual.",
      evidence: [`Only ${game.firstFourPlayerMovePieces.length} player moves were found.`],
      finalPositionFen: game.finalPositionFen,
      lastMoveUci: game.lastMoveUci,
      lastMoveSan: game.lastMoveSan,
    };
  }

  const firstNonKnightIndex = game.firstFourPlayerMovePieces.findIndex((piece) => piece !== "knight");

  if (firstNonKnightIndex >= 0) {
    const breaker = game.firstNonKnightMove;
    return {
      status: "failed",
      gameId: game.id,
      summary: "The coffee kicked in too early: one of the first four player moves was not a knight move.",
      evidence: [
        `Player move ${firstNonKnightIndex + 1} was a ${pieceName(game.firstFourPlayerMovePieces[firstNonKnightIndex])}.`,
        `First four player move pieces: ${game.firstFourPlayerMovePieces.map(pieceName).join(", ")}.`,
      ],
      finalPositionFen: game.finalPositionFen,
      lastMoveUci: game.lastMoveUci,
      lastMoveSan: game.lastMoveSan,
      failureDiagnostic: {
        label: "First non-knight move",
        explanation: `Player move ${firstNonKnightIndex + 1} was a ${pieceName(game.firstFourPlayerMovePieces[firstNonKnightIndex])}, not a knight.`,
        moveNumber: breaker?.moveNumber ?? firstNonKnightIndex + 1,
        ply: breaker?.ply,
        san: breaker?.san,
        uci: breaker?.uci,
        fenAtBreak: breaker?.fenAfter ?? game.finalPositionFen,
        playerColor: game.playerColor,
      },
    };
  }

  return {
    status: "passed",
    gameId: game.id,
    summary: "Horse-first opening confirmed: the first four player moves were knights, and the player won anyway.",
    evidence: [
      `${colorName(game.playerColor)} moved only knights for the first four player moves.`,
      `${colorName(game.playerColor)} won after ${game.moveCount} moves.`,
    ],
    finalPositionFen: game.finalPositionFen,
    lastMoveUci: game.lastMoveUci,
    lastMoveSan: game.lastMoveSan,
  };
}

export const knightsBeforeCoffeeFixtures: KnightsBeforeCoffeeGame[] = [
  {
    id: "fixture-horse-first-win",
    playerColor: "white",
    winner: "white",
    moveCount: 25,
    variant: "standard",
    timeClass: "blitz",
    rated: true,
    firstFourPlayerMovePieces: ["knight", "knight", "knight", "knight"],
  },
  {
    id: "fixture-pawn-before-coffee",
    playerColor: "white",
    winner: "white",
    moveCount: 24,
    variant: "standard",
    timeClass: "rapid",
    rated: false,
    firstFourPlayerMovePieces: ["knight", "pawn", "knight", "knight"],
  },
  {
    id: "fixture-horse-first-loss",
    playerColor: "black",
    winner: "white",
    moveCount: 31,
    variant: "standard",
    timeClass: "blitz",
    rated: true,
    firstFourPlayerMovePieces: ["knight", "knight", "knight", "knight"],
  },
];
