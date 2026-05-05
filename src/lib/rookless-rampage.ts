export type RooklessSide = "white" | "black";
export type RooklessResult = "white" | "black" | "draw" | "unknown";
export type RooklessTimeClass = "bullet" | "blitz" | "rapid" | "classical" | "daily" | "unknown";

export type RooklessLossEvent = {
  ply: number;
  color: RooklessSide;
  origin: "a1" | "h1" | "a8" | "h8";
  square: string;
  capturedBy: RooklessSide;
};

export type RooklessGame = {
  id: string;
  playerColor: RooklessSide;
  winner: RooklessResult;
  moveCount: number;
  variant?: "standard" | string;
  timeClass?: RooklessTimeClass;
  rated?: boolean;
  rookLosses: RooklessLossEvent[];
};

type LichessRooklessGame = {
  id?: string;
  rated?: boolean;
  speed?: string;
  perf?: string;
  variant?: string;
  winner?: RooklessSide;
  moves?: string;
  players?: {
    white?: { user?: { name?: string } };
    black?: { user?: { name?: string } };
  };
};

export type RooklessVerdict = {
  status: "passed" | "failed" | "pending";
  gameId: string;
  summary: string;
  evidence: string[];
};

type PieceKind = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";
type BoardPiece = {
  color: RooklessSide;
  kind: PieceKind;
  origin?: RooklessLossEvent["origin"];
};

const ALLOWED_TIME_CLASSES = new Set<RooklessTimeClass>(["bullet", "blitz", "rapid", "unknown"]);

const INITIAL_BOARD: Record<string, BoardPiece> = {
  a1: { color: "white", kind: "rook", origin: "a1" }, b1: { color: "white", kind: "knight" }, c1: { color: "white", kind: "bishop" }, d1: { color: "white", kind: "queen" }, e1: { color: "white", kind: "king" }, f1: { color: "white", kind: "bishop" }, g1: { color: "white", kind: "knight" }, h1: { color: "white", kind: "rook", origin: "h1" },
  a2: { color: "white", kind: "pawn" }, b2: { color: "white", kind: "pawn" }, c2: { color: "white", kind: "pawn" }, d2: { color: "white", kind: "pawn" }, e2: { color: "white", kind: "pawn" }, f2: { color: "white", kind: "pawn" }, g2: { color: "white", kind: "pawn" }, h2: { color: "white", kind: "pawn" },
  a7: { color: "black", kind: "pawn" }, b7: { color: "black", kind: "pawn" }, c7: { color: "black", kind: "pawn" }, d7: { color: "black", kind: "pawn" }, e7: { color: "black", kind: "pawn" }, f7: { color: "black", kind: "pawn" }, g7: { color: "black", kind: "pawn" }, h7: { color: "black", kind: "pawn" },
  a8: { color: "black", kind: "rook", origin: "a8" }, b8: { color: "black", kind: "knight" }, c8: { color: "black", kind: "bishop" }, d8: { color: "black", kind: "queen" }, e8: { color: "black", kind: "king" }, f8: { color: "black", kind: "bishop" }, g8: { color: "black", kind: "knight" }, h8: { color: "black", kind: "rook", origin: "h8" },
};

function colorName(color: RooklessSide | "draw" | "unknown") {
  if (color === "white") return "White";
  if (color === "black") return "Black";
  return color;
}

function normalizeTimeClass(value?: string): RooklessTimeClass {
  const normalized = value?.toLowerCase();
  return normalized === "bullet" || normalized === "blitz" || normalized === "rapid" || normalized === "classical" || normalized === "daily"
    ? normalized
    : "unknown";
}

function promoteToKind(value: string): PieceKind {
  if (value === "q") return "queen";
  if (value === "r") return "rook";
  if (value === "b") return "bishop";
  return "knight";
}

function clonePiece(piece: BoardPiece): BoardPiece {
  return { ...piece };
}

function recordCapture(captured: BoardPiece | undefined, capturedAt: string, mover: BoardPiece, ply: number): RooklessLossEvent | null {
  if (captured?.kind !== "rook" || !captured.origin) {
    return null;
  }

  return {
    ply,
    color: captured.color,
    origin: captured.origin,
    square: capturedAt,
    capturedBy: mover.color,
  };
}

function moveRookForCastle(board: Record<string, BoardPiece>, from: string, to: string) {
  const rook = board[from];
  if (!rook) return;
  delete board[from];
  board[to] = rook;
}

function applyUciMove(
  board: Record<string, BoardPiece>,
  move: string,
  ply: number,
): RooklessLossEvent | null {
  if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(move)) {
    return null;
  }

  const from = move.slice(0, 2);
  const to = move.slice(2, 4);
  const promotion = move.slice(4, 5);
  const moving = board[from];

  if (!moving) {
    return null;
  }

  let loss = recordCapture(board[to], to, moving, ply);

  if (moving.kind === "pawn" && from[0] !== to[0] && !board[to]) {
    const enPassantSquare = `${to[0]}${from[1]}`;
    loss = loss ?? recordCapture(board[enPassantSquare], enPassantSquare, moving, ply);
    delete board[enPassantSquare];
  }

  delete board[from];
  board[to] = promotion
    ? { color: moving.color, kind: promoteToKind(promotion) }
    : moving;

  if (moving.kind === "king" && from === "e1" && to === "g1") moveRookForCastle(board, "h1", "f1");
  if (moving.kind === "king" && from === "e1" && to === "c1") moveRookForCastle(board, "a1", "d1");
  if (moving.kind === "king" && from === "e8" && to === "g8") moveRookForCastle(board, "h8", "f8");
  if (moving.kind === "king" && from === "e8" && to === "c8") moveRookForCastle(board, "a8", "d8");

  return loss;
}

export function normalizeLichessRooklessRampageGame(
  game: LichessRooklessGame,
  username: string,
): RooklessGame | null {
  const normalizedUsername = username.trim().toLowerCase();
  const whiteName = game.players?.white?.user?.name?.trim().toLowerCase();
  const blackName = game.players?.black?.user?.name?.trim().toLowerCase();
  const playerColor = whiteName === normalizedUsername ? "white" : blackName === normalizedUsername ? "black" : null;

  if (!game.id || !playerColor || !game.moves) {
    return null;
  }

  const board = Object.fromEntries(Object.entries(INITIAL_BOARD).map(([square, piece]) => [square, clonePiece(piece)]));
  const moves = game.moves.trim().split(/\s+/).filter(Boolean);
  const rookLosses = moves
    .map((move, index) => applyUciMove(board, move, index + 1))
    .filter((event): event is RooklessLossEvent => Boolean(event));

  return {
    id: game.id,
    playerColor,
    winner: game.winner ?? "unknown",
    moveCount: Math.ceil(moves.length / 2),
    variant: game.variant ?? "standard",
    timeClass: normalizeTimeClass(game.perf ?? game.speed),
    rated: game.rated,
    rookLosses,
  };
}

export async function checkLatestLichessRooklessRampage(username: string): Promise<RooklessVerdict> {
  if (!username.trim()) {
    return {
      status: "pending",
      gameId: "lichess-username-missing",
      summary: "Add a Lichess username before Side Quest Chess can inspect latest rookless rampage attempts.",
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
      .map((line) => JSON.parse(line) as LichessRooklessGame)
      .map((game) => normalizeLichessRooklessRampageGame(game, username))
      .filter((game): game is RooklessGame => Boolean(game));

    if (!games.length) {
      return {
        status: "pending",
        gameId: "lichess-no-recent-games",
        summary: `No recent public bullet/blitz/rapid Lichess games were found for ${username}.`,
        evidence: ["The latest-games adapter returned no normalizable games."],
      };
    }

    return evaluateRooklessRampage(games[0]);
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

export function evaluateRooklessRampage(game: RooklessGame): RooklessVerdict {
  const evidence: string[] = [];

  if (game.variant && game.variant !== "standard") {
    return {
      status: "failed",
      gameId: game.id,
      summary: "Variants are fun, but Rookless Rampage only counts standard chess games.",
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

  if (game.rated !== true) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "Rookless Rampage is Absurd-tier now, so it only counts in rated games.",
      evidence: [game.rated === false ? "Game was casual/unrated." : "Rated status was unavailable."],
    };
  }

  if (game.moveCount < 20) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "The game ended before the minimum 20-move demolition-proof threshold.",
      evidence: [`Game length was ${game.moveCount} moves.`],
    };
  }

  if (game.winner !== game.playerColor) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "Rookless Rampage only counts if the player loses both towers and still wins.",
      evidence: [`Winner was ${colorName(game.winner)}.`],
    };
  }

  const targetOrigins = game.playerColor === "white" ? ["a1", "h1"] : ["a8", "h8"];
  const earlyLosses = game.rookLosses.filter(
    (loss) => loss.color === game.playerColor && targetOrigins.includes(loss.origin) && moveNumberFromPly(loss.ply) <= 20,
  );
  const lostOrigins = Array.from(new Set(earlyLosses.map((loss) => loss.origin))).sort();

  if (lostOrigins.length < 2) {
    return {
      status: "failed",
      gameId: game.id,
      summary: `Only ${lostOrigins.length}/2 original rooks disappeared before move 20. The towers are not demolished enough yet.`,
      evidence: [
        `${colorName(game.playerColor)} lost ${lostOrigins.length}/2 original rooks before move 20.`,
        lostOrigins.length ? `Lost rook origins: ${lostOrigins.join(", ")}.` : "No early original-rook losses were detected.",
      ],
    };
  }

  evidence.push(`${colorName(game.playerColor)} lost both original rooks before move 20.`);
  evidence.push(`Lost rook origins: ${lostOrigins.join(", ")}.`);
  evidence.push(`${colorName(game.playerColor)} still won after ${game.moveCount} moves.`);

  return {
    status: "passed",
    gameId: game.id,
    summary: "Both rooks disappeared early and the wreckage still turned into a win. Rookless Rampage confirmed.",
    evidence,
  };
}

export const rooklessRampageFixtures: RooklessGame[] = [
  {
    id: "fixture-two-rooks-gone-win",
    playerColor: "white",
    winner: "white",
    moveCount: 31,
    variant: "standard",
    timeClass: "blitz",
    rated: true,
    rookLosses: [
      { ply: 6, color: "white", origin: "a1", square: "a3", capturedBy: "black" },
      { ply: 8, color: "white", origin: "h1", square: "h3", capturedBy: "black" },
    ],
  },
  {
    id: "fixture-one-rook-survived",
    playerColor: "white",
    winner: "white",
    moveCount: 28,
    variant: "standard",
    timeClass: "rapid",
    rated: true,
    rookLosses: [
      { ply: 12, color: "white", origin: "a1", square: "a4", capturedBy: "black" },
    ],
  },
  {
    id: "fixture-unrated-two-rooks-gone-win",
    playerColor: "white",
    winner: "white",
    moveCount: 31,
    variant: "standard",
    timeClass: "blitz",
    rated: false,
    rookLosses: [
      { ply: 6, color: "white", origin: "a1", square: "a3", capturedBy: "black" },
      { ply: 8, color: "white", origin: "h1", square: "h3", capturedBy: "black" },
    ],
  },
  {
    id: "fixture-rookless-loss",
    playerColor: "black",
    winner: "white",
    moveCount: 33,
    variant: "standard",
    timeClass: "blitz",
    rated: true,
    rookLosses: [
      { ply: 5, color: "black", origin: "a8", square: "a6", capturedBy: "white" },
      { ply: 17, color: "black", origin: "h8", square: "h6", capturedBy: "white" },
    ],
  },
];
