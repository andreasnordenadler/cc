export type BlunderGambitSide = "white" | "black";
export type BlunderGambitResult = "white" | "black" | "draw" | "unknown";
export type BlunderGambitTimeClass = "bullet" | "blitz" | "rapid" | "classical" | "daily" | "unknown";
export type BlunderGambitPiece = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";

export type BlunderGambitCaptureEvent = {
  ply: number;
  color: BlunderGambitSide;
  from: string;
  to: string;
  capturedColor: BlunderGambitSide;
  capturedPiece: BlunderGambitPiece;
};

export type BlunderGambitGame = {
  id: string;
  playerColor: BlunderGambitSide;
  winner: BlunderGambitResult;
  moveCount: number;
  variant?: "standard" | string;
  timeClass?: BlunderGambitTimeClass;
  rated?: boolean;
  captures: BlunderGambitCaptureEvent[];
};

type LichessBlunderGambitGame = {
  id?: string;
  rated?: boolean;
  speed?: string;
  perf?: string;
  variant?: string;
  winner?: BlunderGambitSide;
  moves?: string;
  players?: {
    white?: { user?: { name?: string } };
    black?: { user?: { name?: string } };
  };
};

export type BlunderGambitVerdict = {
  status: "passed" | "failed" | "pending";
  gameId: string;
  summary: string;
  evidence: string[];
};

const ALLOWED_TIME_CLASSES = new Set<BlunderGambitTimeClass>(["bullet", "blitz", "rapid", "unknown"]);
const BLUNDER_PIECES = new Set<BlunderGambitPiece>(["knight", "bishop", "rook"]);
const PIECE_VALUES: Record<BlunderGambitPiece, number> = { king: 99, queen: 9, rook: 5, bishop: 3, knight: 3, pawn: 1 };

const INITIAL_BOARD: Record<string, `${BlunderGambitSide}:${BlunderGambitPiece}`> = {
  a1: "white:rook", b1: "white:knight", c1: "white:bishop", d1: "white:queen", e1: "white:king", f1: "white:bishop", g1: "white:knight", h1: "white:rook",
  a2: "white:pawn", b2: "white:pawn", c2: "white:pawn", d2: "white:pawn", e2: "white:pawn", f2: "white:pawn", g2: "white:pawn", h2: "white:pawn",
  a7: "black:pawn", b7: "black:pawn", c7: "black:pawn", d7: "black:pawn", e7: "black:pawn", f7: "black:pawn", g7: "black:pawn", h7: "black:pawn",
  a8: "black:rook", b8: "black:knight", c8: "black:bishop", d8: "black:queen", e8: "black:king", f8: "black:bishop", g8: "black:knight", h8: "black:rook",
};

type BoardPiece = (typeof INITIAL_BOARD)[string];

function colorName(color: BlunderGambitSide | BlunderGambitResult) {
  return color === "white" ? "White" : color === "black" ? "Black" : color;
}

function pieceName(piece: BlunderGambitPiece) {
  return piece === "knight" ? "knight" : piece === "bishop" ? "bishop" : piece === "rook" ? "rook" : piece;
}

function normalizeTimeClass(value?: string): BlunderGambitTimeClass {
  const normalized = value?.toLowerCase();
  return normalized === "bullet" || normalized === "blitz" || normalized === "rapid" || normalized === "classical" || normalized === "daily"
    ? normalized
    : "unknown";
}

function splitPiece(value: BoardPiece) {
  const [color, piece] = value.split(":") as [BlunderGambitSide, BlunderGambitPiece];
  return { color, piece };
}

function moveNumberFromPly(ply: number): number {
  return Math.ceil(ply / 2);
}

function applyUciMove(
  board: Record<string, BoardPiece>,
  move: string,
  ply: number,
): BlunderGambitCaptureEvent | null {
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
  let capturedSquare = to;
  let captured = board[to];

  if (movingPiece.piece === "pawn" && from[0] !== to[0] && !captured) {
    capturedSquare = `${to[0]}${from[1]}`;
    captured = board[capturedSquare];
  }

  const captureEvent = captured
    ? (() => {
        const capturedPiece = splitPiece(captured);
        return {
          ply,
          color: movingPiece.color,
          from,
          to,
          capturedColor: capturedPiece.color,
          capturedPiece: capturedPiece.piece,
        };
      })()
    : null;

  if (captured) {
    delete board[capturedSquare];
  }

  delete board[from];
  board[to] = promotion
    ? `${movingPiece.color}:${promotion === "q" ? "queen" : promotion === "r" ? "rook" : promotion === "b" ? "bishop" : "knight"}`
    : moving;

  if (movingPiece.piece === "king" && from === "e1" && to === "g1") { board.f1 = board.h1; delete board.h1; }
  if (movingPiece.piece === "king" && from === "e1" && to === "c1") { board.d1 = board.a1; delete board.a1; }
  if (movingPiece.piece === "king" && from === "e8" && to === "g8") { board.f8 = board.h8; delete board.h8; }
  if (movingPiece.piece === "king" && from === "e8" && to === "c8") { board.d8 = board.a8; delete board.a8; }

  return captureEvent;
}

export function normalizeLichessBlunderGambitGame(
  game: LichessBlunderGambitGame,
  username: string,
): BlunderGambitGame | null {
  const normalizedUsername = username.trim().toLowerCase();
  const whiteName = game.players?.white?.user?.name?.trim().toLowerCase();
  const blackName = game.players?.black?.user?.name?.trim().toLowerCase();
  const playerColor = whiteName === normalizedUsername ? "white" : blackName === normalizedUsername ? "black" : null;

  if (!game.id || !playerColor || !game.moves) {
    return null;
  }

  const board = { ...INITIAL_BOARD };
  const moves = game.moves.trim().split(/\s+/).filter(Boolean);
  const captures = moves
    .map((move, index) => applyUciMove(board, move, index + 1))
    .filter((event): event is BlunderGambitCaptureEvent => Boolean(event));

  return {
    id: game.id,
    playerColor,
    winner: game.winner ?? "unknown",
    moveCount: Math.ceil(moves.length / 2),
    variant: game.variant ?? "standard",
    timeClass: normalizeTimeClass(game.perf ?? game.speed),
    rated: game.rated,
    captures,
  };
}

export async function checkLatestLichessBlunderGambit(username: string): Promise<BlunderGambitVerdict> {
  if (!username.trim()) {
    return {
      status: "pending",
      gameId: "lichess-username-missing",
      summary: "Add a Lichess username before Side Quest Chess can inspect latest Blunder Gambit attempts.",
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
      .map((line) => JSON.parse(line) as LichessBlunderGambitGame)
      .map((game) => normalizeLichessBlunderGambitGame(game, username))
      .filter((game): game is BlunderGambitGame => Boolean(game));

    if (!games.length) {
      return {
        status: "pending",
        gameId: "lichess-no-recent-games",
        summary: `No recent public bullet/blitz/rapid Lichess games were found for ${username}.`,
        evidence: ["The latest-games adapter returned no normalizable games."],
      };
    }

    return evaluateBlunderGambit(games[0]);
  } catch {
    return {
      status: "pending",
      gameId: "lichess-latest-error",
      summary: `Lichess latest-game lookup could not complete for ${username}.`,
      evidence: ["Network or NDJSON parsing failed."],
    };
  }
}

export function evaluateBlunderGambit(game: BlunderGambitGame): BlunderGambitVerdict {
  if (game.variant && game.variant !== "standard") {
    return {
      status: "failed",
      gameId: game.id,
      summary: "Variants are fun, but The Blunder Gambit only counts standard chess games.",
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
      summary: "The game ended before the minimum 15-move PR-recovery threshold.",
      evidence: [`Game length was ${game.moveCount} moves.`],
    };
  }

  if (game.winner !== game.playerColor) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "The Blunder Gambit only counts if the player who hung material still wins.",
      evidence: [`Winner was ${game.winner === "draw" ? "draw" : colorName(game.winner)}.`],
    };
  }

  const earlyPlayerLosses = game.captures.filter(
    (capture) =>
      capture.color !== game.playerColor &&
      capture.capturedColor === game.playerColor &&
      BLUNDER_PIECES.has(capture.capturedPiece) &&
      moveNumberFromPly(capture.ply) <= 10,
  );

  const qualifyingLoss = earlyPlayerLosses.find((loss) => {
    const immediateReply = game.captures.find(
      (capture) => capture.color === game.playerColor && capture.ply === loss.ply + 1,
    );

    return !immediateReply || PIECE_VALUES[immediateReply.capturedPiece] < PIECE_VALUES[loss.capturedPiece];
  });

  if (!qualifyingLoss) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "No early unbalanced piece hang was found. Suspiciously competent chess does not count.",
      evidence: earlyPlayerLosses.length
        ? ["Early piece losses were immediately balanced by equal-or-better material on the next move."]
        : ["No player knight, bishop, or rook was captured by move 10."],
    };
  }

  const evidence = [
    `${colorName(game.playerColor)} lost a ${pieceName(qualifyingLoss.capturedPiece)} on move ${moveNumberFromPly(qualifyingLoss.ply)}.`,
    "No equal-or-better material was won back on the immediate reply.",
    `${colorName(game.playerColor)} still won after ${game.moveCount} moves.`,
  ];

  return {
    status: "passed",
    gameId: game.id,
    summary: "Early material hang confirmed, immediate compensation denied, and the blunder artist still won. Branding saved the opening.",
    evidence,
  };
}

export const blunderGambitFixtures: BlunderGambitGame[] = [
  {
    id: "fixture-hung-bishop-still-won",
    playerColor: "white",
    winner: "white",
    moveCount: 31,
    variant: "standard",
    timeClass: "blitz",
    rated: true,
    captures: [
      { ply: 6, color: "black", from: "f8", to: "c5", capturedColor: "white", capturedPiece: "bishop" },
      { ply: 22, color: "white", from: "d1", to: "d8", capturedColor: "black", capturedPiece: "queen" },
    ],
  },
  {
    id: "fixture-immediate-equal-recapture",
    playerColor: "white",
    winner: "white",
    moveCount: 28,
    variant: "standard",
    timeClass: "rapid",
    rated: false,
    captures: [
      { ply: 8, color: "black", from: "g4", to: "e2", capturedColor: "white", capturedPiece: "knight" },
      { ply: 9, color: "white", from: "d1", to: "e2", capturedColor: "black", capturedPiece: "bishop" },
    ],
  },
  {
    id: "fixture-late-blunder-win",
    playerColor: "black",
    winner: "black",
    moveCount: 26,
    variant: "standard",
    timeClass: "blitz",
    rated: true,
    captures: [
      { ply: 24, color: "white", from: "c4", to: "f7", capturedColor: "black", capturedPiece: "rook" },
    ],
  },
  {
    id: "fixture-blunder-loss",
    playerColor: "black",
    winner: "white",
    moveCount: 24,
    variant: "standard",
    timeClass: "blitz",
    rated: true,
    captures: [
      { ply: 7, color: "white", from: "b5", to: "c6", capturedColor: "black", capturedPiece: "knight" },
    ],
  },
];
