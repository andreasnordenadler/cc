export type OneBishopSide = "white" | "black";
export type OneBishopResult = "white" | "black" | "draw" | "unknown";
export type OneBishopTimeClass = "bullet" | "blitz" | "rapid" | "classical" | "daily" | "unknown";

export type OneBishopGame = {
  id: string;
  playerColor: OneBishopSide;
  winner: OneBishopResult;
  moveCount: number;
  variant?: "standard" | string;
  timeClass?: OneBishopTimeClass;
  rated?: boolean;
  finalMinorPieces: Array<{ kind: "bishop" | "knight"; square: string }>;
};

type LichessOneBishopGame = {
  id?: string;
  rated?: boolean;
  speed?: string;
  perf?: string;
  variant?: string;
  winner?: OneBishopSide;
  moves?: string;
  players?: {
    white?: { user?: { name?: string } };
    black?: { user?: { name?: string } };
  };
};

export type OneBishopVerdict = {
  status: "passed" | "failed" | "pending";
  gameId: string;
  summary: string;
  evidence: string[];
};

type PieceKind = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";
type BoardPiece = {
  color: OneBishopSide;
  kind: PieceKind;
};

const ALLOWED_TIME_CLASSES = new Set<OneBishopTimeClass>(["bullet", "blitz", "rapid", "unknown"]);

const INITIAL_BOARD: Record<string, BoardPiece> = {
  a1: { color: "white", kind: "rook" }, b1: { color: "white", kind: "knight" }, c1: { color: "white", kind: "bishop" }, d1: { color: "white", kind: "queen" }, e1: { color: "white", kind: "king" }, f1: { color: "white", kind: "bishop" }, g1: { color: "white", kind: "knight" }, h1: { color: "white", kind: "rook" },
  a2: { color: "white", kind: "pawn" }, b2: { color: "white", kind: "pawn" }, c2: { color: "white", kind: "pawn" }, d2: { color: "white", kind: "pawn" }, e2: { color: "white", kind: "pawn" }, f2: { color: "white", kind: "pawn" }, g2: { color: "white", kind: "pawn" }, h2: { color: "white", kind: "pawn" },
  a7: { color: "black", kind: "pawn" }, b7: { color: "black", kind: "pawn" }, c7: { color: "black", kind: "pawn" }, d7: { color: "black", kind: "pawn" }, e7: { color: "black", kind: "pawn" }, f7: { color: "black", kind: "pawn" }, g7: { color: "black", kind: "pawn" }, h7: { color: "black", kind: "pawn" },
  a8: { color: "black", kind: "rook" }, b8: { color: "black", kind: "knight" }, c8: { color: "black", kind: "bishop" }, d8: { color: "black", kind: "queen" }, e8: { color: "black", kind: "king" }, f8: { color: "black", kind: "bishop" }, g8: { color: "black", kind: "knight" }, h8: { color: "black", kind: "rook" },
};

function colorName(color: OneBishopSide | "draw" | "unknown") {
  if (color === "white") return "White";
  if (color === "black") return "Black";
  return color;
}

function normalizeTimeClass(value?: string): OneBishopTimeClass {
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

function moveRookForCastle(board: Record<string, BoardPiece>, from: string, to: string) {
  const rook = board[from];
  if (!rook) return;
  delete board[from];
  board[to] = rook;
}

function applyUciMove(board: Record<string, BoardPiece>, move: string) {
  if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(move)) {
    return;
  }

  const from = move.slice(0, 2);
  const to = move.slice(2, 4);
  const promotion = move.slice(4, 5);
  const moving = board[from];

  if (!moving) {
    return;
  }

  if (moving.kind === "pawn" && from[0] !== to[0] && !board[to]) {
    delete board[`${to[0]}${from[1]}`];
  }

  delete board[from];
  board[to] = promotion
    ? { color: moving.color, kind: promoteToKind(promotion) }
    : moving;

  if (moving.kind === "king" && from === "e1" && to === "g1") moveRookForCastle(board, "h1", "f1");
  if (moving.kind === "king" && from === "e1" && to === "c1") moveRookForCastle(board, "a1", "d1");
  if (moving.kind === "king" && from === "e8" && to === "g8") moveRookForCastle(board, "h8", "f8");
  if (moving.kind === "king" && from === "e8" && to === "c8") moveRookForCastle(board, "a8", "d8");
}

function collectFinalMinorPieces(board: Record<string, BoardPiece>, color: OneBishopSide): OneBishopGame["finalMinorPieces"] {
  return Object.entries(board)
    .filter(([, piece]) => piece.color === color && (piece.kind === "bishop" || piece.kind === "knight"))
    .map(([square, piece]) => ({ kind: piece.kind as "bishop" | "knight", square }))
    .sort((a, b) => a.square.localeCompare(b.square));
}

export function normalizeLichessOneBishopToRuleThemAllGame(
  game: LichessOneBishopGame,
  username: string,
): OneBishopGame | null {
  const normalizedUsername = username.trim().toLowerCase();
  const whiteName = game.players?.white?.user?.name?.trim().toLowerCase();
  const blackName = game.players?.black?.user?.name?.trim().toLowerCase();
  const playerColor = whiteName === normalizedUsername ? "white" : blackName === normalizedUsername ? "black" : null;

  if (!game.id || !playerColor || !game.moves) {
    return null;
  }

  const board = Object.fromEntries(Object.entries(INITIAL_BOARD).map(([square, piece]) => [square, { ...piece }]));
  const moves = game.moves.trim().split(/\s+/).filter(Boolean);
  moves.forEach((move) => applyUciMove(board, move));

  return {
    id: game.id,
    playerColor,
    winner: game.winner ?? "unknown",
    moveCount: Math.ceil(moves.length / 2),
    variant: game.variant ?? "standard",
    timeClass: normalizeTimeClass(game.perf ?? game.speed),
    rated: game.rated,
    finalMinorPieces: collectFinalMinorPieces(board, playerColor),
  };
}

export async function checkLatestLichessOneBishopToRuleThemAll(username: string): Promise<OneBishopVerdict> {
  if (!username.trim()) {
    return {
      status: "pending",
      gameId: "lichess-username-missing",
      summary: "Add a Lichess username before Side Quest Chess can inspect latest one-bishop attempts.",
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
      .map((line) => JSON.parse(line) as LichessOneBishopGame)
      .map((game) => normalizeLichessOneBishopToRuleThemAllGame(game, username))
      .filter((game): game is OneBishopGame => Boolean(game));

    if (!games.length) {
      return {
        status: "pending",
        gameId: "lichess-no-recent-games",
        summary: `No recent public bullet/blitz/rapid Lichess games were found for ${username}.`,
        evidence: ["The latest-games adapter returned no normalizable games."],
      };
    }

    return evaluateOneBishopToRuleThemAll(games[0]);
  } catch {
    return {
      status: "pending",
      gameId: "lichess-latest-error",
      summary: `Lichess latest-game lookup could not complete for ${username}.`,
      evidence: ["Network or NDJSON parsing failed."],
    };
  }
}

export function evaluateOneBishopToRuleThemAll(game: OneBishopGame): OneBishopVerdict {
  if (game.variant && game.variant !== "standard") {
    return {
      status: "failed",
      gameId: game.id,
      summary: "Variants are fun, but One Bishop to Rule Them All only counts standard chess games.",
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

  if (game.moveCount < 15) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "The game ended before the minimum 15-move one-bishop proof threshold.",
      evidence: [`Game length was ${game.moveCount} moves.`],
    };
  }

  if (game.winner !== game.playerColor) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "One Bishop to Rule Them All only counts if the lonely diagonal manager also wins.",
      evidence: [`Winner was ${colorName(game.winner)}.`],
    };
  }

  const bishops = game.finalMinorPieces.filter((piece) => piece.kind === "bishop");
  const knights = game.finalMinorPieces.filter((piece) => piece.kind === "knight");

  if (bishops.length !== 1 || knights.length !== 0 || game.finalMinorPieces.length !== 1) {
    return {
      status: "failed",
      gameId: game.id,
      summary: `Final minor-piece department had ${bishops.length} bishop(s) and ${knights.length} knight(s). That is not lonely enough.`,
      evidence: [
        `${colorName(game.playerColor)} final minor pieces: ${game.finalMinorPieces.map((piece) => `${piece.kind} on ${piece.square}`).join(", ") || "none"}.`,
      ],
    };
  }

  return {
    status: "passed",
    gameId: game.id,
    summary: "Exactly one bishop was the entire minor-piece department at victory. One Bishop to Rule Them All confirmed.",
    evidence: [
      `${colorName(game.playerColor)} won after ${game.moveCount} moves.`,
      `The only final minor piece was a bishop on ${bishops[0].square}.`,
    ],
  };
}

export const oneBishopToRuleThemAllFixtures: OneBishopGame[] = [
  {
    id: "fixture-one-bishop-win",
    playerColor: "white",
    winner: "white",
    moveCount: 31,
    variant: "standard",
    timeClass: "blitz",
    rated: true,
    finalMinorPieces: [{ kind: "bishop", square: "g2" }],
  },
  {
    id: "fixture-too-many-minors",
    playerColor: "white",
    winner: "white",
    moveCount: 28,
    variant: "standard",
    timeClass: "rapid",
    rated: false,
    finalMinorPieces: [
      { kind: "bishop", square: "c4" },
      { kind: "knight", square: "f3" },
    ],
  },
  {
    id: "fixture-one-bishop-loss",
    playerColor: "black",
    winner: "white",
    moveCount: 33,
    variant: "standard",
    timeClass: "blitz",
    rated: true,
    finalMinorPieces: [{ kind: "bishop", square: "b7" }],
  },
];
