export type PawnOnlyPicnicSide = "white" | "black";
export type PawnOnlyPicnicResult = PawnOnlyPicnicSide | "draw" | "unknown";
export type PawnOnlyPicnicTimeClass = "bullet" | "blitz" | "rapid" | "classical" | "daily" | "unknown";

type PieceType = "pawn" | "knight" | "bishop" | "rook" | "queen" | "king";

export type PawnOnlyPicnicGame = {
  id: string;
  playerColor: PawnOnlyPicnicSide;
  winner: PawnOnlyPicnicResult;
  moveCount: number;
  variant?: "standard" | string;
  timeClass?: PawnOnlyPicnicTimeClass;
  rated?: boolean;
  startedGameAt?: string;
  completedGameAt?: string;
  firstEightPlayerMovePieces: PieceType[];
};

type LichessPawnOnlyPicnicGame = {
  id?: string;
  rated?: boolean;
  speed?: string;
  perf?: string;
  variant?: string;
  winner?: PawnOnlyPicnicSide;
  moves?: string;
  createdAt?: number;
  lastMoveAt?: number;
  players?: {
    white?: { user?: { name?: string } };
    black?: { user?: { name?: string } };
  };
};

export type PawnOnlyPicnicVerdict = {
  status: "passed" | "failed" | "pending";
  gameId: string;
  summary: string;
  evidence: string[];
  startedGameAt?: string;
  completedGameAt?: string;
};

const ALLOWED_TIME_CLASSES = new Set<PawnOnlyPicnicTimeClass>(["bullet", "blitz", "rapid", "unknown"]);

function colorName(color: PawnOnlyPicnicSide) {
  return color === "white" ? "White" : "Black";
}

function pieceName(piece: PieceType) {
  return piece === "pawn" ? "pawn" : piece;
}

function normalizeTimeClass(value?: string): PawnOnlyPicnicTimeClass {
  const normalized = value?.toLowerCase();
  return normalized === "bullet" || normalized === "blitz" || normalized === "rapid" || normalized === "classical" || normalized === "daily"
    ? normalized
    : "unknown";
}

function pieceFromSanMove(move: string): PieceType {
  const cleanMove = move.replace(/[+#?!]+$/g, "");

  if (cleanMove === "O-O" || cleanMove === "O-O-O") return "king";
  if (cleanMove.startsWith("K")) return "king";
  if (cleanMove.startsWith("Q")) return "queen";
  if (cleanMove.startsWith("R")) return "rook";
  if (cleanMove.startsWith("B")) return "bishop";
  if (cleanMove.startsWith("N")) return "knight";

  return "pawn";
}

function playerPiecesFromSanMoves(moves: string[], playerColor: PawnOnlyPicnicSide) {
  const playerOffset = playerColor === "white" ? 0 : 1;

  return moves
    .filter((_, index) => index % 2 === playerOffset)
    .slice(0, 8)
    .map(pieceFromSanMove);
}

export function normalizeLichessPawnOnlyPicnicGame(
  game: LichessPawnOnlyPicnicGame,
  username: string,
): PawnOnlyPicnicGame | null {
  const normalizedUsername = username.trim().toLowerCase();
  const whiteName = game.players?.white?.user?.name?.trim().toLowerCase();
  const blackName = game.players?.black?.user?.name?.trim().toLowerCase();
  const playerColor = whiteName === normalizedUsername ? "white" : blackName === normalizedUsername ? "black" : null;

  if (!game.id || !playerColor || !game.moves) {
    return null;
  }

  const moves = game.moves.trim().split(/\s+/).filter(Boolean);

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
    firstEightPlayerMovePieces: playerPiecesFromSanMoves(moves, playerColor),
  };
}

export async function checkLatestLichessPawnOnlyPicnic(username: string): Promise<PawnOnlyPicnicVerdict> {
  if (!username.trim()) {
    return {
      status: "pending",
      gameId: "lichess-username-missing",
      summary: "Add a Lichess username before Side Quest Chess can inspect latest pawn-picnic attempts.",
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
      .map((line) => JSON.parse(line) as LichessPawnOnlyPicnicGame)
      .map((game) => normalizeLichessPawnOnlyPicnicGame(game, username))
      .filter((game): game is PawnOnlyPicnicGame => Boolean(game));

    if (!games.length) {
      return {
        status: "pending",
        gameId: "lichess-no-recent-games",
        summary: `No recent public bullet/blitz/rapid Lichess games were found for ${username}.`,
        evidence: ["The latest-games adapter returned no normalizable games."],
      };
    }

    return { ...evaluatePawnOnlyPicnic(games[0]), startedGameAt: games[0].startedGameAt, completedGameAt: games[0].completedGameAt };
  } catch {
    return {
      status: "pending",
      gameId: "lichess-latest-error",
      summary: `Lichess latest-game lookup could not complete for ${username}.`,
      evidence: ["Network or NDJSON parsing failed."],
    };
  }
}

export function evaluatePawnOnlyPicnic(game: PawnOnlyPicnicGame): PawnOnlyPicnicVerdict {
  if (game.variant && game.variant !== "standard") {
    return {
      status: "failed",
      gameId: game.id,
      summary: "Variants are delightful, but Pawn-Only Picnic only counts standard chess games.",
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

  if (game.winner !== game.playerColor) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "Pawn-Only Picnic only counts if the pawn-party player wins.",
      evidence: [`Winner was ${game.winner === "draw" ? "draw" : colorName(game.winner as PawnOnlyPicnicSide)}.`],
    };
  }

  if (game.firstEightPlayerMovePieces.length < 8) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "The game ended before eight player moves could prove the pawn-only picnic.",
      evidence: [`Only ${game.firstEightPlayerMovePieces.length} player moves were found.`],
    };
  }

  const firstNonPawnIndex = game.firstEightPlayerMovePieces.findIndex((piece) => piece !== "pawn");

  if (firstNonPawnIndex >= 0) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "A grown-up piece crashed the picnic too early: one of the first eight player moves was not a pawn move.",
      evidence: [
        `Player move ${firstNonPawnIndex + 1} was a ${pieceName(game.firstEightPlayerMovePieces[firstNonPawnIndex])}.`,
        `First eight player move pieces: ${game.firstEightPlayerMovePieces.map(pieceName).join(", ")}.`,
      ],
    };
  }

  return {
    status: "passed",
    gameId: game.id,
    summary: "Pawn-only opening confirmed: the first eight player moves were pawns, and the player won anyway.",
    completedGameAt: game.completedGameAt,
    evidence: [
      `${colorName(game.playerColor)} moved only pawns for the first eight player moves.`,
      `${colorName(game.playerColor)} won after ${game.moveCount} moves.`,
    ],
  };
}

export const pawnOnlyPicnicFixtures: PawnOnlyPicnicGame[] = [
  {
    id: "fixture-pawn-picnic-win",
    playerColor: "white",
    winner: "white",
    moveCount: 25,
    variant: "standard",
    timeClass: "blitz",
    rated: true,
    firstEightPlayerMovePieces: ["pawn", "pawn", "pawn", "pawn", "pawn", "pawn", "pawn", "pawn"],
  },
  {
    id: "fixture-knight-crashes-picnic",
    playerColor: "white",
    winner: "white",
    moveCount: 24,
    variant: "standard",
    timeClass: "rapid",
    rated: false,
    firstEightPlayerMovePieces: ["pawn", "pawn", "knight", "pawn", "pawn", "pawn", "pawn", "pawn"],
  },
  {
    id: "fixture-pawn-picnic-loss",
    playerColor: "black",
    winner: "white",
    moveCount: 31,
    variant: "standard",
    timeClass: "blitz",
    rated: true,
    firstEightPlayerMovePieces: ["pawn", "pawn", "pawn", "pawn", "pawn", "pawn", "pawn", "pawn"],
  },
];
