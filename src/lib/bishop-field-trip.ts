export type BishopFieldTripSide = "white" | "black";
export type BishopFieldTripResult = BishopFieldTripSide | "draw" | "unknown";
export type BishopFieldTripTimeClass = "bullet" | "blitz" | "rapid" | "classical" | "daily" | "unknown";

type PieceType = "pawn" | "knight" | "bishop" | "rook" | "queen" | "king";

type Piece = {
  color: BishopFieldTripSide;
  type: PieceType;
  homeSquare?: string;
};

export type BishopFieldTripGame = {
  id: string;
  playerColor: BishopFieldTripSide;
  winner: BishopFieldTripResult;
  moveCount: number;
  variant?: "standard" | string;
  timeClass?: BishopFieldTripTimeClass;
  rated?: boolean;
  bothBishopsMovedBeforeQueen: boolean;
  movedBishopHomeSquaresBeforeQueen: string[];
  queenMovedOnPlayerMove?: number;
};

type LichessBishopFieldTripGame = {
  id?: string;
  rated?: boolean;
  speed?: string;
  perf?: string;
  variant?: string;
  winner?: BishopFieldTripSide;
  moves?: string;
  players?: {
    white?: { user?: { name?: string } };
    black?: { user?: { name?: string } };
  };
};

export type BishopFieldTripVerdict = {
  status: "passed" | "failed" | "pending";
  gameId: string;
  summary: string;
  evidence: string[];
};

const ALLOWED_TIME_CLASSES = new Set<BishopFieldTripTimeClass>(["bullet", "blitz", "rapid", "unknown"]);

function colorName(color: BishopFieldTripSide) {
  return color === "white" ? "White" : "Black";
}

function normalizeTimeClass(value?: string): BishopFieldTripTimeClass {
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
    const whiteSquare = `${file}1`;
    const blackSquare = `${file}8`;
    board.set(whiteSquare, { color: "white", type: backRank[index], homeSquare: whiteSquare });
    board.set(`${file}2`, { color: "white", type: "pawn", homeSquare: `${file}2` });
    board.set(`${file}7`, { color: "black", type: "pawn", homeSquare: `${file}7` });
    board.set(blackSquare, { color: "black", type: backRank[index], homeSquare: blackSquare });
  });

  return board;
}

function trackBishopFieldTripFromUciMoves(moves: string[], playerColor: BishopFieldTripSide) {
  const board = buildInitialBoard();
  const bishopHomeSquares = playerColor === "white" ? ["c1", "f1"] : ["c8", "f8"];
  const movedBishopHomes = new Set<string>();
  let playerMoveNumber = 0;
  let queenMovedOnPlayerMove: number | undefined;

  for (const move of moves) {
    const from = move.slice(0, 2);
    const to = move.slice(2, 4);
    const promotion = move.slice(4, 5);
    const piece = board.get(from);

    if (piece?.color === playerColor) {
      playerMoveNumber += 1;

      if (!queenMovedOnPlayerMove && piece.type === "bishop" && piece.homeSquare && bishopHomeSquares.includes(piece.homeSquare)) {
        movedBishopHomes.add(piece.homeSquare);
      }

      if (piece.type === "queen" && queenMovedOnPlayerMove === undefined) {
        queenMovedOnPlayerMove = playerMoveNumber;
      }
    }

    board.delete(from);

    if (piece) {
      const promotedType: PieceType | null =
        promotion === "q" ? "queen" : promotion === "r" ? "rook" : promotion === "b" ? "bishop" : promotion === "n" ? "knight" : null;
      board.set(to, { ...piece, type: promotedType ?? piece.type });
    }

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

  const movedBishopHomeSquaresBeforeQueen = bishopHomeSquares.filter((square) => movedBishopHomes.has(square));

  return {
    bothBishopsMovedBeforeQueen: movedBishopHomeSquaresBeforeQueen.length === 2,
    movedBishopHomeSquaresBeforeQueen,
    queenMovedOnPlayerMove,
  };
}

export function normalizeLichessBishopFieldTripGame(
  game: LichessBishopFieldTripGame,
  username: string,
): BishopFieldTripGame | null {
  const normalizedUsername = username.trim().toLowerCase();
  const whiteName = game.players?.white?.user?.name?.trim().toLowerCase();
  const blackName = game.players?.black?.user?.name?.trim().toLowerCase();
  const playerColor = whiteName === normalizedUsername ? "white" : blackName === normalizedUsername ? "black" : null;

  if (!game.id || !playerColor || !game.moves) {
    return null;
  }

  const moves = game.moves.trim().split(/\s+/).filter(Boolean);
  const bishopTrip = trackBishopFieldTripFromUciMoves(moves, playerColor);

  return {
    id: game.id,
    playerColor,
    winner: game.winner ?? "unknown",
    moveCount: Math.ceil(moves.length / 2),
    variant: game.variant ?? "standard",
    timeClass: normalizeTimeClass(game.perf ?? game.speed),
    rated: game.rated,
    ...bishopTrip,
  };
}

export async function checkLatestLichessBishopFieldTrip(username: string): Promise<BishopFieldTripVerdict> {
  if (!username.trim()) {
    return {
      status: "pending",
      gameId: "lichess-username-missing",
      summary: "Add a Lichess username before Side Quest Chess can inspect latest bishop field trips.",
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
      .map((line) => JSON.parse(line) as LichessBishopFieldTripGame)
      .map((game) => normalizeLichessBishopFieldTripGame(game, username))
      .filter((game): game is BishopFieldTripGame => Boolean(game));

    if (!games.length) {
      return {
        status: "pending",
        gameId: "lichess-no-recent-games",
        summary: `No recent public bullet/blitz/rapid Lichess games were found for ${username}.`,
        evidence: ["The latest-games adapter returned no normalizable games."],
      };
    }

    return evaluateBishopFieldTrip(games[0]);
  } catch {
    return {
      status: "pending",
      gameId: "lichess-latest-error",
      summary: `Lichess latest-game lookup could not complete for ${username}.`,
      evidence: ["Network or NDJSON parsing failed."],
    };
  }
}

export function evaluateBishopFieldTrip(game: BishopFieldTripGame): BishopFieldTripVerdict {
  if (game.variant && game.variant !== "standard") {
    return {
      status: "failed",
      gameId: game.id,
      summary: "Variants are delightful nonsense, but Bishop Field Trip only counts standard chess games.",
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
      summary: "Bishop Field Trip only counts if the bishop-tour player wins.",
      evidence: [`Winner was ${game.winner === "draw" ? "draw" : colorName(game.winner as BishopFieldTripSide)}.`],
    };
  }

  if (!game.bothBishopsMovedBeforeQueen) {
    const missingCount = 2 - game.movedBishopHomeSquaresBeforeQueen.length;

    return {
      status: "failed",
      gameId: game.id,
      summary: "The queen got attention before both bishops completed their field trip.",
      evidence: [
        `${game.movedBishopHomeSquaresBeforeQueen.length} original bishop${game.movedBishopHomeSquaresBeforeQueen.length === 1 ? "" : "s"} moved before the queen; ${missingCount} still needed a field trip.`,
        game.queenMovedOnPlayerMove
          ? `The queen first moved on player move ${game.queenMovedOnPlayerMove}.`
          : "The queen never moved, but both original bishops still were not both developed.",
      ],
    };
  }

  return {
    status: "passed",
    gameId: game.id,
    summary: "Bishop field trip confirmed: both bishops moved before the queen, and the player won anyway.",
    evidence: [
      `${colorName(game.playerColor)} moved both original bishops before the queen moved.`,
      `${colorName(game.playerColor)} won after ${game.moveCount} moves.`,
    ],
  };
}

export const bishopFieldTripFixtures: BishopFieldTripGame[] = [
  {
    id: "fixture-bishops-before-queen-win",
    playerColor: "white",
    winner: "white",
    moveCount: 24,
    variant: "standard",
    timeClass: "rapid",
    rated: true,
    bothBishopsMovedBeforeQueen: true,
    movedBishopHomeSquaresBeforeQueen: ["c1", "f1"],
    queenMovedOnPlayerMove: 7,
  },
  {
    id: "fixture-queen-too-soon",
    playerColor: "white",
    winner: "white",
    moveCount: 23,
    variant: "standard",
    timeClass: "blitz",
    rated: false,
    bothBishopsMovedBeforeQueen: false,
    movedBishopHomeSquaresBeforeQueen: ["f1"],
    queenMovedOnPlayerMove: 4,
  },
  {
    id: "fixture-bishop-trip-loss",
    playerColor: "black",
    winner: "white",
    moveCount: 29,
    variant: "standard",
    timeClass: "blitz",
    rated: true,
    bothBishopsMovedBeforeQueen: true,
    movedBishopHomeSquaresBeforeQueen: ["c8", "f8"],
    queenMovedOnPlayerMove: 8,
  },
];
