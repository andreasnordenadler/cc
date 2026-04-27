export type PawnStormSide = "white" | "black";
export type PawnStormResult = "white" | "black" | "draw" | "unknown";
export type PawnStormTimeClass = "bullet" | "blitz" | "rapid" | "classical" | "daily" | "unknown";

export type PawnStormMoveEvent = {
  ply: number;
  color: PawnStormSide;
  from: string;
  to: string;
  pawnFile: string;
};

export type PawnStormGame = {
  id: string;
  playerColor: PawnStormSide;
  winner: PawnStormResult;
  moveCount: number;
  variant?: "standard" | string;
  timeClass?: PawnStormTimeClass;
  rated?: boolean;
  pawnMoves: PawnStormMoveEvent[];
};

type LichessPawnStormGame = {
  id?: string;
  rated?: boolean;
  speed?: string;
  perf?: string;
  variant?: string;
  winner?: PawnStormSide;
  moves?: string;
  players?: {
    white?: { user?: { name?: string } };
    black?: { user?: { name?: string } };
  };
};

export type PawnStormVerdict = {
  status: "passed" | "failed" | "pending";
  gameId: string;
  summary: string;
  evidence: string[];
};

const ALLOWED_TIME_CLASSES = new Set<PawnStormTimeClass>(["bullet", "blitz", "rapid", "unknown"]);

const INITIAL_BOARD: Record<string, `${PawnStormSide}:king` | `${PawnStormSide}:queen` | `${PawnStormSide}:rook` | `${PawnStormSide}:bishop` | `${PawnStormSide}:knight` | `${PawnStormSide}:pawn`> = {
  a1: "white:rook", b1: "white:knight", c1: "white:bishop", d1: "white:queen", e1: "white:king", f1: "white:bishop", g1: "white:knight", h1: "white:rook",
  a2: "white:pawn", b2: "white:pawn", c2: "white:pawn", d2: "white:pawn", e2: "white:pawn", f2: "white:pawn", g2: "white:pawn", h2: "white:pawn",
  a7: "black:pawn", b7: "black:pawn", c7: "black:pawn", d7: "black:pawn", e7: "black:pawn", f7: "black:pawn", g7: "black:pawn", h7: "black:pawn",
  a8: "black:rook", b8: "black:knight", c8: "black:bishop", d8: "black:queen", e8: "black:king", f8: "black:bishop", g8: "black:knight", h8: "black:rook",
};

type BoardPiece = (typeof INITIAL_BOARD)[string];

function colorName(color: PawnStormSide) {
  return color === "white" ? "White" : "Black";
}

function normalizeTimeClass(value?: string): PawnStormTimeClass {
  const normalized = value?.toLowerCase();
  return normalized === "bullet" || normalized === "blitz" || normalized === "rapid" || normalized === "classical" || normalized === "daily"
    ? normalized
    : "unknown";
}

function splitPiece(value: BoardPiece) {
  const [color, piece] = value.split(":") as [PawnStormSide, "king" | "queen" | "rook" | "bishop" | "knight" | "pawn"];
  return { color, piece };
}

function applyUciMove(
  board: Record<string, BoardPiece>,
  move: string,
  ply: number,
): PawnStormMoveEvent | null {
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

  const movingPiece = splitPiece(moving);
  const pawnMove = movingPiece.piece === "pawn"
    ? { ply, color: movingPiece.color, from, to, pawnFile: from[0] }
    : null;

  if (movingPiece.piece === "pawn" && from[0] !== to[0] && !board[to]) {
    delete board[`${to[0]}${from[1]}`];
  }

  delete board[from];
  board[to] = promotion
    ? `${movingPiece.color}:${promotion === "q" ? "queen" : promotion === "r" ? "rook" : promotion === "b" ? "bishop" : "knight"}`
    : moving;

  if (movingPiece.piece === "king" && from === "e1" && to === "g1") { board.f1 = board.h1; delete board.h1; }
  if (movingPiece.piece === "king" && from === "e1" && to === "c1") { board.d1 = board.a1; delete board.a1; }
  if (movingPiece.piece === "king" && from === "e8" && to === "g8") { board.f8 = board.h8; delete board.h8; }
  if (movingPiece.piece === "king" && from === "e8" && to === "c8") { board.d8 = board.a8; delete board.a8; }

  return pawnMove;
}

export function normalizeLichessPawnStormManiacGame(
  game: LichessPawnStormGame,
  username: string,
): PawnStormGame | null {
  const normalizedUsername = username.trim().toLowerCase();
  const whiteName = game.players?.white?.user?.name?.trim().toLowerCase();
  const blackName = game.players?.black?.user?.name?.trim().toLowerCase();
  const playerColor = whiteName === normalizedUsername ? "white" : blackName === normalizedUsername ? "black" : null;

  if (!game.id || !playerColor || !game.moves) {
    return null;
  }

  const board = { ...INITIAL_BOARD };
  const moves = game.moves.trim().split(/\s+/).filter(Boolean);
  const pawnMoves = moves
    .map((move, index) => applyUciMove(board, move, index + 1))
    .filter((event): event is PawnStormMoveEvent => Boolean(event));

  return {
    id: game.id,
    playerColor,
    winner: game.winner ?? "unknown",
    moveCount: Math.ceil(moves.length / 2),
    variant: game.variant ?? "standard",
    timeClass: normalizeTimeClass(game.perf ?? game.speed),
    rated: game.rated,
    pawnMoves,
  };
}

export async function checkLatestLichessPawnStormManiac(username: string): Promise<PawnStormVerdict> {
  if (!username.trim()) {
    return {
      status: "pending",
      gameId: "lichess-username-missing",
      summary: "Add a Lichess username before Side Quest Chess can inspect latest pawn-storm attempts.",
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
      .map((line) => JSON.parse(line) as LichessPawnStormGame)
      .map((game) => normalizeLichessPawnStormManiacGame(game, username))
      .filter((game): game is PawnStormGame => Boolean(game));

    if (!games.length) {
      return {
        status: "pending",
        gameId: "lichess-no-recent-games",
        summary: `No recent public bullet/blitz/rapid Lichess games were found for ${username}.`,
        evidence: ["The latest-games adapter returned no normalizable games."],
      };
    }

    return evaluatePawnStormManiac(games[0]);
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

export function evaluatePawnStormManiac(game: PawnStormGame): PawnStormVerdict {
  const evidence: string[] = [];

  if (game.variant && game.variant !== "standard") {
    return {
      status: "failed",
      gameId: game.id,
      summary: "Variants are fun, but Pawn Storm Maniac only counts standard chess games.",
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

  if (game.moveCount < 20) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "The game ended before the minimum 20-move chaos-proof threshold.",
      evidence: [`Game length was ${game.moveCount} moves.`],
    };
  }

  if (game.winner !== game.playerColor) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "Pawn Storm Maniac only counts if the pawn-weather player still wins.",
      evidence: [`Winner was ${game.winner === "draw" ? "draw" : colorName(game.winner as PawnStormSide)}.`],
    };
  }

  const earlyPlayerPawnMoves = game.pawnMoves.filter(
    (move) => move.color === game.playerColor && moveNumberFromPly(move.ply) <= 15,
  );
  const distinctPawnStarts = Array.from(new Set(earlyPlayerPawnMoves.map((move) => move.from))).sort();

  if (distinctPawnStarts.length < 6) {
    return {
      status: "failed",
      gameId: game.id,
      summary: `Only ${distinctPawnStarts.length} different player pawns moved before move 15. The storm was more of a drizzle.`,
      evidence: [
        `${colorName(game.playerColor)} moved ${distinctPawnStarts.length}/6 different pawns before move 15.`,
        distinctPawnStarts.length ? `Pawn starts: ${distinctPawnStarts.join(", ")}.` : "No early player pawn moves were detected.",
      ],
    };
  }

  evidence.push(`${colorName(game.playerColor)} moved ${distinctPawnStarts.length} different pawns before move 15.`);
  evidence.push(`Pawn starts: ${distinctPawnStarts.slice(0, 6).join(", ")}.`);
  evidence.push(`${colorName(game.playerColor)} still won after ${game.moveCount} moves.`);

  return {
    status: "passed",
    gameId: game.id,
    summary: "Six-pawn storm confirmed before move 15, followed by an actual win. Terrible weather, excellent receipt.",
    evidence,
  };
}

export const pawnStormManiacFixtures: PawnStormGame[] = [
  {
    id: "fixture-six-pawn-storm-win",
    playerColor: "white",
    winner: "white",
    moveCount: 27,
    variant: "standard",
    timeClass: "blitz",
    rated: true,
    pawnMoves: [
      { ply: 1, color: "white", from: "a2", to: "a4", pawnFile: "a" },
      { ply: 3, color: "white", from: "b2", to: "b4", pawnFile: "b" },
      { ply: 5, color: "white", from: "c2", to: "c4", pawnFile: "c" },
      { ply: 7, color: "white", from: "d2", to: "d4", pawnFile: "d" },
      { ply: 9, color: "white", from: "e2", to: "e4", pawnFile: "e" },
      { ply: 11, color: "white", from: "f2", to: "f4", pawnFile: "f" },
    ],
  },
  {
    id: "fixture-five-pawn-drizzle",
    playerColor: "white",
    winner: "white",
    moveCount: 31,
    variant: "standard",
    timeClass: "rapid",
    rated: false,
    pawnMoves: [
      { ply: 1, color: "white", from: "a2", to: "a4", pawnFile: "a" },
      { ply: 3, color: "white", from: "b2", to: "b4", pawnFile: "b" },
      { ply: 5, color: "white", from: "c2", to: "c4", pawnFile: "c" },
      { ply: 7, color: "white", from: "d2", to: "d4", pawnFile: "d" },
      { ply: 9, color: "white", from: "e2", to: "e4", pawnFile: "e" },
      { ply: 31, color: "white", from: "f2", to: "f4", pawnFile: "f" },
    ],
  },
  {
    id: "fixture-pawn-storm-loss",
    playerColor: "black",
    winner: "white",
    moveCount: 29,
    variant: "standard",
    timeClass: "blitz",
    rated: true,
    pawnMoves: [
      { ply: 2, color: "black", from: "a7", to: "a5", pawnFile: "a" },
      { ply: 4, color: "black", from: "b7", to: "b5", pawnFile: "b" },
      { ply: 6, color: "black", from: "c7", to: "c5", pawnFile: "c" },
      { ply: 8, color: "black", from: "d7", to: "d5", pawnFile: "d" },
      { ply: 10, color: "black", from: "e7", to: "e5", pawnFile: "e" },
      { ply: 12, color: "black", from: "f7", to: "f5", pawnFile: "f" },
    ],
  },
];
