export type EarlyKingWalkSide = "white" | "black";
export type EarlyKingWalkResult = EarlyKingWalkSide | "draw" | "unknown";
export type EarlyKingWalkTimeClass = "bullet" | "blitz" | "rapid" | "classical" | "daily" | "unknown";

type PieceType = "pawn" | "knight" | "bishop" | "rook" | "queen" | "king";

type Piece = {
  color: EarlyKingWalkSide;
  type: PieceType;
};

export type EarlyKingWalkGame = {
  id: string;
  playerColor: EarlyKingWalkSide;
  winner: EarlyKingWalkResult;
  moveCount: number;
  variant?: "standard" | string;
  timeClass?: EarlyKingWalkTimeClass;
  rated?: boolean;
  earlyKingWalkMove?: number;
  castledBeforeKingWalk: boolean;
};

type LichessEarlyKingWalkGame = {
  id?: string;
  rated?: boolean;
  speed?: string;
  perf?: string;
  variant?: string;
  winner?: EarlyKingWalkSide;
  moves?: string;
  players?: {
    white?: { user?: { name?: string } };
    black?: { user?: { name?: string } };
  };
};

export type EarlyKingWalkVerdict = {
  status: "passed" | "failed" | "pending";
  gameId: string;
  summary: string;
  evidence: string[];
};

const ALLOWED_TIME_CLASSES = new Set<EarlyKingWalkTimeClass>(["bullet", "blitz", "rapid", "unknown"]);

function colorName(color: EarlyKingWalkSide) {
  return color === "white" ? "White" : "Black";
}

function normalizeTimeClass(value?: string): EarlyKingWalkTimeClass {
  const normalized = value?.toLowerCase();
  return normalized === "bullet" || normalized === "blitz" || normalized === "rapid" || normalized === "classical" || normalized === "daily"
    ? normalized
    : "unknown";
}

function buildInitialBoard() {
  const board = new Map<string, Piece>();
  const backRank: PieceType[] = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

  files.forEach((file, index) => {
    board.set(`${file}1`, { color: "white", type: backRank[index] });
    board.set(`${file}2`, { color: "white", type: "pawn" });
    board.set(`${file}7`, { color: "black", type: "pawn" });
    board.set(`${file}8`, { color: "black", type: backRank[index] });
  });

  return board;
}

function isCastlingMove(piece: Piece | undefined, from: string, to: string) {
  return piece?.type === "king" && ((from === "e1" && (to === "g1" || to === "c1")) || (from === "e8" && (to === "g8" || to === "c8")));
}

function applyCastlingRookMove(board: Map<string, Piece>, piece: Piece | undefined, from: string, to: string) {
  if (piece?.type === "king" && from === "e1" && to === "g1") {
    const rook = board.get("h1");
    board.delete("h1");
    if (rook) board.set("f1", rook);
  } else if (piece?.type === "king" && from === "e1" && to === "c1") {
    const rook = board.get("a1");
    board.delete("a1");
    if (rook) board.set("d1", rook);
  } else if (piece?.type === "king" && from === "e8" && to === "g8") {
    const rook = board.get("h8");
    board.delete("h8");
    if (rook) board.set("f8", rook);
  } else if (piece?.type === "king" && from === "e8" && to === "c8") {
    const rook = board.get("a8");
    board.delete("a8");
    if (rook) board.set("d8", rook);
  }
}

function trackEarlyKingWalkFromUciMoves(moves: string[], playerColor: EarlyKingWalkSide) {
  const board = buildInitialBoard();
  let playerMoveNumber = 0;
  let earlyKingWalkMove: number | undefined;
  let castledBeforeKingWalk = false;

  for (const move of moves) {
    const from = move.slice(0, 2);
    const to = move.slice(2, 4);
    const promotion = move.slice(4, 5);
    const piece = board.get(from);
    const castling = isCastlingMove(piece, from, to);

    if (piece?.color === playerColor) {
      playerMoveNumber += 1;

      if (piece.type === "king" && castling && earlyKingWalkMove === undefined) {
        castledBeforeKingWalk = true;
      }

      if (piece.type === "king" && !castling && earlyKingWalkMove === undefined) {
        earlyKingWalkMove = playerMoveNumber;
      }
    }

    board.delete(from);

    if (piece) {
      const promotedType: PieceType | null =
        promotion === "q" ? "queen" : promotion === "r" ? "rook" : promotion === "b" ? "bishop" : promotion === "n" ? "knight" : null;
      board.set(to, { color: piece.color, type: promotedType ?? piece.type });
    }

    applyCastlingRookMove(board, piece, from, to);
  }

  return { earlyKingWalkMove, castledBeforeKingWalk };
}

export function normalizeLichessEarlyKingWalkGame(
  game: LichessEarlyKingWalkGame,
  username: string,
): EarlyKingWalkGame | null {
  const normalizedUsername = username.trim().toLowerCase();
  const whiteName = game.players?.white?.user?.name?.trim().toLowerCase();
  const blackName = game.players?.black?.user?.name?.trim().toLowerCase();
  const playerColor = whiteName === normalizedUsername ? "white" : blackName === normalizedUsername ? "black" : null;

  if (!game.id || !playerColor || !game.moves) {
    return null;
  }

  const moves = game.moves.trim().split(/\s+/).filter(Boolean);
  const kingWalk = trackEarlyKingWalkFromUciMoves(moves, playerColor);

  return {
    id: game.id,
    playerColor,
    winner: game.winner ?? "unknown",
    moveCount: Math.ceil(moves.length / 2),
    variant: game.variant ?? "standard",
    timeClass: normalizeTimeClass(game.perf ?? game.speed),
    rated: game.rated,
    ...kingWalk,
  };
}

export async function checkLatestLichessEarlyKingWalk(username: string): Promise<EarlyKingWalkVerdict> {
  if (!username.trim()) {
    return {
      status: "pending",
      gameId: "lichess-username-missing",
      summary: "Add a Lichess username before Side Quest Chess can inspect latest royal strolls.",
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
      .map((line) => JSON.parse(line) as LichessEarlyKingWalkGame)
      .map((game) => normalizeLichessEarlyKingWalkGame(game, username))
      .filter((game): game is EarlyKingWalkGame => Boolean(game));

    if (!games.length) {
      return {
        status: "pending",
        gameId: "lichess-no-recent-games",
        summary: `No recent public bullet/blitz/rapid Lichess games were found for ${username}.`,
        evidence: ["The latest-games adapter returned no normalizable games."],
      };
    }

    return evaluateEarlyKingWalk(games[0]);
  } catch {
    return {
      status: "pending",
      gameId: "lichess-latest-error",
      summary: `Lichess latest-game lookup could not complete for ${username}.`,
      evidence: ["Network or NDJSON parsing failed."],
    };
  }
}

export function evaluateEarlyKingWalk(game: EarlyKingWalkGame): EarlyKingWalkVerdict {
  if (game.variant && game.variant !== "standard") {
    return {
      status: "failed",
      gameId: game.id,
      summary: "Variants may contain royal weirdness, but Early King Walk only counts standard chess games.",
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
      summary: "Early King Walk only counts if the walking-king player wins.",
      evidence: [`Winner was ${game.winner === "draw" ? "draw" : colorName(game.winner as EarlyKingWalkSide)}.`],
    };
  }

  if (!game.earlyKingWalkMove || game.earlyKingWalkMove >= 12) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "The monarch did not take a non-castling walk before player move 12.",
      evidence: [
        game.earlyKingWalkMove
          ? `The first non-castling king move was player move ${game.earlyKingWalkMove}.`
          : "No non-castling king move was detected.",
        game.castledBeforeKingWalk ? "Castling happened, but castling does not count as the walk." : "Castling was not counted as a king walk.",
      ],
    };
  }

  return {
    status: "passed",
    gameId: game.id,
    summary: "Early king walk confirmed: the king moved before move 12, castling did not get fake credit, and the player won.",
    evidence: [
      `${colorName(game.playerColor)} moved the king on player move ${game.earlyKingWalkMove}.`,
      `${colorName(game.playerColor)} won after ${game.moveCount} moves.`,
    ],
  };
}

export const earlyKingWalkFixtures: EarlyKingWalkGame[] = [
  {
    id: "fixture-early-king-walk-win",
    playerColor: "white",
    winner: "white",
    moveCount: 28,
    variant: "standard",
    timeClass: "rapid",
    rated: true,
    earlyKingWalkMove: 5,
    castledBeforeKingWalk: false,
  },
  {
    id: "fixture-castling-is-not-walk",
    playerColor: "white",
    winner: "white",
    moveCount: 31,
    variant: "standard",
    timeClass: "blitz",
    rated: false,
    castledBeforeKingWalk: true,
  },
  {
    id: "fixture-king-walk-loss",
    playerColor: "black",
    winner: "white",
    moveCount: 26,
    variant: "standard",
    timeClass: "blitz",
    rated: true,
    earlyKingWalkMove: 6,
    castledBeforeKingWalk: false,
  },
];
