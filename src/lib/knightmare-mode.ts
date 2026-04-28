export type KnightmareSide = "white" | "black";
export type KnightmareResult = "white" | "black" | "draw" | "unknown";
export type KnightmareTimeClass = "bullet" | "blitz" | "rapid" | "classical" | "daily" | "unknown";
export type KnightmareEndStatus = "mate" | "resign" | "outoftime" | "draw" | "stalemate" | "unknown" | string;

export type KnightmareFinalMove = {
  ply: number;
  color: KnightmareSide;
  from: string;
  to: string;
  piece: "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";
};

export type KnightmareGame = {
  id: string;
  playerColor: KnightmareSide;
  winner: KnightmareResult;
  status?: KnightmareEndStatus;
  moveCount: number;
  variant?: "standard" | string;
  timeClass?: KnightmareTimeClass;
  rated?: boolean;
  finalMove?: KnightmareFinalMove;
};

type LichessKnightmareGame = {
  id?: string;
  rated?: boolean;
  speed?: string;
  perf?: string;
  variant?: string;
  winner?: KnightmareSide;
  status?: KnightmareEndStatus;
  moves?: string;
  players?: {
    white?: { user?: { name?: string } };
    black?: { user?: { name?: string } };
  };
};

export type KnightmareVerdict = {
  status: "passed" | "failed" | "pending";
  gameId: string;
  summary: string;
  evidence: string[];
};

const ALLOWED_TIME_CLASSES = new Set<KnightmareTimeClass>(["bullet", "blitz", "rapid", "unknown"]);

const INITIAL_BOARD: Record<string, `${KnightmareSide}:king` | `${KnightmareSide}:queen` | `${KnightmareSide}:rook` | `${KnightmareSide}:bishop` | `${KnightmareSide}:knight` | `${KnightmareSide}:pawn`> = {
  a1: "white:rook", b1: "white:knight", c1: "white:bishop", d1: "white:queen", e1: "white:king", f1: "white:bishop", g1: "white:knight", h1: "white:rook",
  a2: "white:pawn", b2: "white:pawn", c2: "white:pawn", d2: "white:pawn", e2: "white:pawn", f2: "white:pawn", g2: "white:pawn", h2: "white:pawn",
  a7: "black:pawn", b7: "black:pawn", c7: "black:pawn", d7: "black:pawn", e7: "black:pawn", f7: "black:pawn", g7: "black:pawn", h7: "black:pawn",
  a8: "black:rook", b8: "black:knight", c8: "black:bishop", d8: "black:queen", e8: "black:king", f8: "black:bishop", g8: "black:knight", h8: "black:rook",
};

type BoardPiece = (typeof INITIAL_BOARD)[string];

function colorName(color: KnightmareSide | "draw" | "unknown") {
  if (color === "white") return "White";
  if (color === "black") return "Black";
  return color;
}

function pieceName(piece?: KnightmareFinalMove["piece"]) {
  if (!piece) return "unknown piece";
  return piece;
}

function normalizeTimeClass(value?: string): KnightmareTimeClass {
  const normalized = value?.toLowerCase();
  return normalized === "bullet" || normalized === "blitz" || normalized === "rapid" || normalized === "classical" || normalized === "daily"
    ? normalized
    : "unknown";
}

function splitPiece(value: BoardPiece) {
  const [color, piece] = value.split(":") as [KnightmareSide, "king" | "queen" | "rook" | "bishop" | "knight" | "pawn"];
  return { color, piece };
}

function applyUciMove(
  board: Record<string, BoardPiece>,
  move: string,
  ply: number,
): KnightmareFinalMove | null {
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
  const event: KnightmareFinalMove = {
    ply,
    color: movingPiece.color,
    from,
    to,
    piece: movingPiece.piece,
  };

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

  return event;
}

export function normalizeLichessKnightmareModeGame(
  game: LichessKnightmareGame,
  username: string,
): KnightmareGame | null {
  const normalizedUsername = username.trim().toLowerCase();
  const whiteName = game.players?.white?.user?.name?.trim().toLowerCase();
  const blackName = game.players?.black?.user?.name?.trim().toLowerCase();
  const playerColor = whiteName === normalizedUsername ? "white" : blackName === normalizedUsername ? "black" : null;

  if (!game.id || !playerColor || !game.moves) {
    return null;
  }

  const board = { ...INITIAL_BOARD };
  const moves = game.moves.trim().split(/\s+/).filter(Boolean);
  const finalMove = moves.reduce<KnightmareFinalMove | null>(
    (_last, move, index) => applyUciMove(board, move, index + 1),
    null,
  );

  return {
    id: game.id,
    playerColor,
    winner: game.winner ?? "unknown",
    status: game.status ?? "unknown",
    moveCount: Math.ceil(moves.length / 2),
    variant: game.variant ?? "standard",
    timeClass: normalizeTimeClass(game.perf ?? game.speed),
    rated: game.rated,
    finalMove: finalMove ?? undefined,
  };
}

export async function checkLatestLichessKnightmareMode(username: string): Promise<KnightmareVerdict> {
  if (!username.trim()) {
    return {
      status: "pending",
      gameId: "lichess-username-missing",
      summary: "Add a Lichess username before Side Quest Chess can inspect latest Knightmare attempts.",
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
      .map((line) => JSON.parse(line) as LichessKnightmareGame)
      .map((game) => normalizeLichessKnightmareModeGame(game, username))
      .filter((game): game is KnightmareGame => Boolean(game));

    if (!games.length) {
      return {
        status: "pending",
        gameId: "lichess-no-recent-games",
        summary: `No recent public bullet/blitz/rapid Lichess games were found for ${username}.`,
        evidence: ["The latest-games adapter returned no normalizable games."],
      };
    }

    return evaluateKnightmareMode(games[0]);
  } catch {
    return {
      status: "pending",
      gameId: "lichess-latest-error",
      summary: `Lichess latest-game lookup could not complete for ${username}.`,
      evidence: ["Network or NDJSON parsing failed."],
    };
  }
}

export function evaluateKnightmareMode(game: KnightmareGame): KnightmareVerdict {
  const evidence: string[] = [];

  if (game.variant && game.variant !== "standard") {
    return {
      status: "failed",
      gameId: game.id,
      summary: "Variants are fun, but Knightmare Mode only counts standard chess games.",
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
      summary: "The game ended before the minimum 10-move Knightmare proof threshold.",
      evidence: [`Game length was ${game.moveCount} moves.`],
    };
  }

  if (game.winner !== game.playerColor) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "Knightmare Mode only counts if the horse-crime player wins.",
      evidence: [`Winner was ${colorName(game.winner)}.`],
    };
  }

  if (game.status !== "mate") {
    return {
      status: "failed",
      gameId: game.id,
      summary: "The latest win did not end by checkmate, so the horse did not get the final paperwork.",
      evidence: [`Game status was ${game.status ?? "unknown"}.`],
    };
  }

  if (!game.finalMove) {
    return {
      status: "pending",
      gameId: game.id,
      summary: "The verifier could not identify the final move from the normalized Lichess move list.",
      evidence: ["No final UCI move was available after normalization."],
    };
  }

  if (game.finalMove.color !== game.playerColor) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "The mating move was not made by the Side Quest Chess player.",
      evidence: [`Final move belonged to ${colorName(game.finalMove.color)}.`],
    };
  }

  if (game.finalMove.piece !== "knight") {
    return {
      status: "failed",
      gameId: game.id,
      summary: `Checkmate happened, but the final blow came from a ${pieceName(game.finalMove.piece)}, not a knight. The horse is filing a complaint.`,
      evidence: [`Final move: ${game.finalMove.from}${game.finalMove.to} by ${pieceName(game.finalMove.piece)}.`],
    };
  }

  evidence.push(`${colorName(game.playerColor)} won by checkmate.`);
  evidence.push(`Final move ${game.finalMove.from}${game.finalMove.to} was made by a knight.`);
  evidence.push(`Game lasted ${game.moveCount} moves.`);

  return {
    status: "passed",
    gameId: game.id,
    summary: "Knight checkmate confirmed. The horse got the final word and Side Quest Chess has the receipt.",
    evidence,
  };
}

export const knightmareModeFixtures: KnightmareGame[] = [
  {
    id: "fixture-knight-mate-win",
    playerColor: "white",
    winner: "white",
    status: "mate",
    moveCount: 22,
    variant: "standard",
    timeClass: "blitz",
    rated: true,
    finalMove: { ply: 43, color: "white", from: "f7", to: "h8", piece: "knight" },
  },
  {
    id: "fixture-bishop-mate-win",
    playerColor: "white",
    winner: "white",
    status: "mate",
    moveCount: 24,
    variant: "standard",
    timeClass: "rapid",
    rated: false,
    finalMove: { ply: 47, color: "white", from: "d3", to: "h7", piece: "bishop" },
  },
  {
    id: "fixture-knight-last-move-resign",
    playerColor: "black",
    winner: "black",
    status: "resign",
    moveCount: 31,
    variant: "standard",
    timeClass: "blitz",
    rated: true,
    finalMove: { ply: 62, color: "black", from: "f2", to: "h1", piece: "knight" },
  },
];
