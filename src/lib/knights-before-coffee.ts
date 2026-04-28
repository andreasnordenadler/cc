export type KnightsBeforeCoffeeSide = "white" | "black";
export type KnightsBeforeCoffeeResult = KnightsBeforeCoffeeSide | "draw" | "unknown";
export type KnightsBeforeCoffeeTimeClass = "bullet" | "blitz" | "rapid" | "classical" | "daily" | "unknown";

type PieceType = "pawn" | "knight" | "bishop" | "rook" | "queen" | "king";

type Piece = {
  color: KnightsBeforeCoffeeSide;
  type: PieceType;
};

export type KnightsBeforeCoffeeGame = {
  id: string;
  playerColor: KnightsBeforeCoffeeSide;
  winner: KnightsBeforeCoffeeResult;
  moveCount: number;
  variant?: "standard" | string;
  timeClass?: KnightsBeforeCoffeeTimeClass;
  rated?: boolean;
  firstFourPlayerMovePieces: PieceType[];
};

type LichessKnightsBeforeCoffeeGame = {
  id?: string;
  rated?: boolean;
  speed?: string;
  perf?: string;
  variant?: string;
  winner?: KnightsBeforeCoffeeSide;
  moves?: string;
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

function playerPiecesFromUciMoves(moves: string[], playerColor: KnightsBeforeCoffeeSide) {
  const board = buildInitialBoard();
  const playerPieces: PieceType[] = [];

  moves.forEach((move, index) => {
    const from = move.slice(0, 2);
    const to = move.slice(2, 4);
    const promotion = move.slice(4, 5);
    const piece = board.get(from);

    if (piece?.color === playerColor) {
      playerPieces.push(piece.type);
    }

    board.delete(from);

    if (piece) {
      const promotedType: PieceType | null =
        promotion === "q" ? "queen" : promotion === "r" ? "rook" : promotion === "b" ? "bishop" : promotion === "n" ? "knight" : null;
      board.set(to, { color: piece.color, type: promotedType ?? piece.type });
    }

    // Standard UCI castling still needs the rook moved for later piece tracking.
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

    if (index > 80 && playerPieces.length >= 4) return;
  });

  return playerPieces.slice(0, 4);
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

  const moves = game.moves.trim().split(/\s+/).filter(Boolean);

  return {
    id: game.id,
    playerColor,
    winner: game.winner ?? "unknown",
    moveCount: Math.ceil(moves.length / 2),
    variant: game.variant ?? "standard",
    timeClass: normalizeTimeClass(game.perf ?? game.speed),
    rated: game.rated,
    firstFourPlayerMovePieces: playerPiecesFromUciMoves(moves, playerColor),
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

    return evaluateKnightsBeforeCoffee(games[0]);
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
      summary: "Knights Before Coffee only counts if the horse-first player wins.",
      evidence: [`Winner was ${game.winner === "draw" ? "draw" : colorName(game.winner as KnightsBeforeCoffeeSide)}.`],
    };
  }

  if (game.firstFourPlayerMovePieces.length < 4) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "The game ended before four player moves could prove the horse-first ritual.",
      evidence: [`Only ${game.firstFourPlayerMovePieces.length} player moves were found.`],
    };
  }

  const firstNonKnightIndex = game.firstFourPlayerMovePieces.findIndex((piece) => piece !== "knight");

  if (firstNonKnightIndex >= 0) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "The coffee kicked in too early: one of the first four player moves was not a knight move.",
      evidence: [
        `Player move ${firstNonKnightIndex + 1} was a ${pieceName(game.firstFourPlayerMovePieces[firstNonKnightIndex])}.`,
        `First four player move pieces: ${game.firstFourPlayerMovePieces.map(pieceName).join(", ")}.`,
      ],
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
