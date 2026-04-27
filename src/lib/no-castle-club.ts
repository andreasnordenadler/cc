export type NoCastleSide = "white" | "black";
export type NoCastleResult = "white" | "black" | "draw" | "unknown";
export type NoCastleTimeClass = "bullet" | "blitz" | "rapid" | "classical" | "daily" | "unknown";

export type NoCastleGame = {
  id: string;
  playerColor: NoCastleSide;
  winner: NoCastleResult;
  moveCount: number;
  variant?: "standard" | string;
  timeClass?: NoCastleTimeClass;
  rated?: boolean;
  castling: Array<{
    ply: number;
    color: NoCastleSide;
    side: "kingside" | "queenside";
  }>;
};

type LichessNoCastleGame = {
  id?: string;
  rated?: boolean;
  speed?: string;
  perf?: string;
  variant?: string;
  winner?: NoCastleSide;
  moves?: string;
  players?: {
    white?: { user?: { name?: string } };
    black?: { user?: { name?: string } };
  };
};

export type NoCastleVerdict = {
  status: "passed" | "failed" | "pending";
  gameId: string;
  summary: string;
  evidence: string[];
};

const ALLOWED_TIME_CLASSES = new Set<NoCastleTimeClass>(["bullet", "blitz", "rapid", "unknown"]);

function colorName(color: NoCastleSide) {
  return color === "white" ? "White" : "Black";
}

function normalizeTimeClass(value?: string): NoCastleTimeClass {
  const normalized = value?.toLowerCase();
  return normalized === "bullet" || normalized === "blitz" || normalized === "rapid" || normalized === "classical" || normalized === "daily"
    ? normalized
    : "unknown";
}

function castlingFromUci(move: string, ply: number) {
  if (move === "e1g1") return { ply, color: "white" as const, side: "kingside" as const };
  if (move === "e1c1") return { ply, color: "white" as const, side: "queenside" as const };
  if (move === "e8g8") return { ply, color: "black" as const, side: "kingside" as const };
  if (move === "e8c8") return { ply, color: "black" as const, side: "queenside" as const };
  return null;
}

export function normalizeLichessNoCastleClubGame(
  game: LichessNoCastleGame,
  username: string,
): NoCastleGame | null {
  const normalizedUsername = username.trim().toLowerCase();
  const whiteName = game.players?.white?.user?.name?.trim().toLowerCase();
  const blackName = game.players?.black?.user?.name?.trim().toLowerCase();
  const playerColor = whiteName === normalizedUsername ? "white" : blackName === normalizedUsername ? "black" : null;

  if (!game.id || !playerColor || !game.moves) {
    return null;
  }

  const moves = game.moves.trim().split(/\s+/).filter(Boolean);
  const castling = moves
    .map((move, index) => castlingFromUci(move, index + 1))
    .filter((event): event is NonNullable<ReturnType<typeof castlingFromUci>> => Boolean(event));

  return {
    id: game.id,
    playerColor,
    winner: game.winner ?? "unknown",
    moveCount: Math.ceil(moves.length / 2),
    variant: game.variant ?? "standard",
    timeClass: normalizeTimeClass(game.perf ?? game.speed),
    rated: game.rated,
    castling,
  };
}

export async function checkLatestLichessNoCastleClub(username: string): Promise<NoCastleVerdict> {
  if (!username.trim()) {
    return {
      status: "pending",
      gameId: "lichess-username-missing",
      summary: "Add a Lichess username before Side Quest Chess can inspect latest no-castle attempts.",
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
      .map((line) => JSON.parse(line) as LichessNoCastleGame)
      .map((game) => normalizeLichessNoCastleClubGame(game, username))
      .filter((game): game is NoCastleGame => Boolean(game));

    if (!games.length) {
      return {
        status: "pending",
        gameId: "lichess-no-recent-games",
        summary: `No recent public bullet/blitz/rapid Lichess games were found for ${username}.`,
        evidence: ["The latest-games adapter returned no normalizable games."],
      };
    }

    return evaluateNoCastleClub(games[0]);
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

export function evaluateNoCastleClub(game: NoCastleGame): NoCastleVerdict {
  const playerCastling = game.castling.find((event) => event.color === game.playerColor);
  const opponentCastling = game.castling.find((event) => event.color !== game.playerColor);
  const evidence: string[] = [];

  if (game.variant && game.variant !== "standard") {
    return {
      status: "failed",
      gameId: game.id,
      summary: "Variants are fun, but No Castle Club only counts standard chess games.",
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
      summary: "The game ended before the minimum 10-move proof threshold.",
      evidence: [`Game length was ${game.moveCount} moves.`],
    };
  }

  if (game.winner !== game.playerColor) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "No Castle Club only counts if the uncastled player still wins.",
      evidence: [`Winner was ${game.winner === "draw" ? "draw" : colorName(game.winner as NoCastleSide)}.`],
    };
  }

  if (playerCastling) {
    return {
      status: "failed",
      gameId: game.id,
      summary: `The king took the sensible ${playerCastling.side} castle. Club membership denied.`,
      evidence: [`${colorName(game.playerColor)} castled ${playerCastling.side} on move ${moveNumberFromPly(playerCastling.ply)}.`],
    };
  }

  evidence.push(`${colorName(game.playerColor)} never castled in the normalized move feed.`);
  evidence.push(`${colorName(game.playerColor)} won after ${game.moveCount} moves.`);
  evidence.push(
    opponentCastling
      ? `${colorName(opponentCastling.color)} castled ${opponentCastling.side}; opponent shelter is allowed.`
      : "No castling by either side was detected.",
  );

  return {
    status: "passed",
    gameId: game.id,
    summary: "Win confirmed with zero player castling. The king stayed uninsured and somehow survived.",
    evidence,
  };
}

export const noCastleClubFixtures: NoCastleGame[] = [
  {
    id: "fixture-no-castle-win",
    playerColor: "white",
    winner: "white",
    moveCount: 24,
    variant: "standard",
    timeClass: "blitz",
    rated: true,
    castling: [{ ply: 12, color: "black", side: "kingside" }],
  },
  {
    id: "fixture-player-castled",
    playerColor: "white",
    winner: "white",
    moveCount: 28,
    variant: "standard",
    timeClass: "rapid",
    rated: false,
    castling: [{ ply: 11, color: "white", side: "kingside" }],
  },
  {
    id: "fixture-uncastled-loss",
    playerColor: "black",
    winner: "white",
    moveCount: 31,
    variant: "standard",
    timeClass: "blitz",
    rated: true,
    castling: [],
  },
];
