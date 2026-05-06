type LichessPlayer = {
  user?: {
    name?: string;
  };
};

import { buildProofPositionFromUciMoves, type ProofPosition } from "@/lib/chess-proof";

type LichessGame = {
  id?: string;
  status?: string;
  winner?: "white" | "black";
  moves?: string;
  lastMoveAt?: number;
  createdAt?: number;
  players?: {
    white?: LichessPlayer;
    black?: LichessPlayer;
  };
};

export type LichessVerificationVerdict = {
  status: "passed" | "failed" | "pending";
  summary: string;
  completedGameAt?: string;
} & Partial<ProofPosition>;

const OPEN_GAME_STATUSES = new Set(["created", "started"]);

async function fetchLichessGame(gameId: string): Promise<LichessGame | null> {
  const response = await fetch(`https://lichess.org/game/export/${gameId}?json=1`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "cc-verifier/0.1 (+https://cc-andreas-nordenadlers-projects.vercel.app)",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as LichessGame;
}

function getPlayerNames(game: LichessGame) {
  return {
    whiteName: game.players?.white?.user?.name?.trim().toLowerCase(),
    blackName: game.players?.black?.user?.name?.trim().toLowerCase(),
  };
}

function getCompletedGameAt(game: LichessGame): string | undefined {
  const timestamp = game.lastMoveAt ?? game.createdAt;
  return typeof timestamp === "number" ? new Date(timestamp).toISOString() : undefined;
}

async function verifyFinishAttempt({
  gameId,
  lichessUsername,
  requiredSide,
}: {
  gameId: string;
  lichessUsername: string;
  requiredSide: "white" | "black" | "either";
}): Promise<LichessVerificationVerdict> {
  if (!lichessUsername) {
    return {
      status: "pending",
      summary:
        "Submitted game saved, but no Lichess username is stored yet. Add it in account settings so verification can finish.",
    };
  }

  try {
    const game = await fetchLichessGame(gameId);

    if (!game) {
      return {
        status: "pending",
        summary: `Submitted ${gameId}, but Lichess verification is temporarily unavailable.`,
      };
    }

    const { whiteName, blackName } = getPlayerNames(game);
    const normalizedUsername = lichessUsername.trim().toLowerCase();

    if (whiteName !== normalizedUsername && blackName !== normalizedUsername) {
      return {
        status: "failed",
        summary: `Submitted ${gameId}, but saved username ${lichessUsername} does not appear in that finished game.`,
      };
    }

    if (!game.status || OPEN_GAME_STATUSES.has(game.status)) {
      return {
        status: "pending",
        summary: `Submitted ${gameId}. The Lichess game is not finished yet, so verification is still pending.`,
      };
    }

    const actualSide = whiteName === normalizedUsername ? "white" : "black";

    if (requiredSide !== "either" && actualSide !== requiredSide) {
      const requiredSideLabel = requiredSide === "white" ? "White" : "Black";
      return {
        status: "failed",
        summary: `Submitted ${gameId}, but ${lichessUsername} played ${actualSide === "white" ? "White" : "Black"} in that finished game, so it does not satisfy Finish as ${requiredSideLabel}.`,
      };
    }

    const proofPosition = buildProofPositionFromUciMoves(game.moves);

    if (requiredSide === "either") {
      return {
        status: "passed",
        summary: `Verified ${gameId}. ${lichessUsername} appears in a finished Lichess game, so this quest passed.`,
        completedGameAt: getCompletedGameAt(game),
        ...proofPosition,
      };
    }

    const requiredSideLabel = requiredSide === "white" ? "White" : "Black";
    return {
      status: "passed",
      summary: `Verified ${gameId}. ${lichessUsername} finished that Lichess game as ${requiredSideLabel}, so this quest passed.`,
      completedGameAt: getCompletedGameAt(game),
      ...proofPosition,
    };
  } catch {
    return {
      status: "pending",
      summary: `Submitted ${gameId}, but Lichess verification could not complete right now. Try again later if this stays pending.`,
    };
  }
}

export async function verifyFinishAnyGameAttempt({
  gameId,
  lichessUsername,
}: {
  gameId: string;
  lichessUsername: string;
}): Promise<LichessVerificationVerdict> {
  return verifyFinishAttempt({ gameId, lichessUsername, requiredSide: "either" });
}

export async function verifyFinishAsWhiteAttempt({
  gameId,
  lichessUsername,
}: {
  gameId: string;
  lichessUsername: string;
}): Promise<LichessVerificationVerdict> {
  return verifyFinishAttempt({ gameId, lichessUsername, requiredSide: "white" });
}

export async function verifyFinishAsBlackAttempt({
  gameId,
  lichessUsername,
}: {
  gameId: string;
  lichessUsername: string;
}): Promise<LichessVerificationVerdict> {
  return verifyFinishAttempt({ gameId, lichessUsername, requiredSide: "black" });
}

export async function checkLatestLichessFinishedGame(username: string): Promise<LichessVerificationVerdict & { gameId: string; evidence: string[] }> {
  if (!username.trim()) {
    return {
      status: "pending",
      gameId: "lichess-username-missing",
      summary: "Add a Lichess username before Side Quest Chess can inspect latest finished games.",
      evidence: ["No Lichess username is stored."],
    };
  }

  try {
    const response = await fetch(
      `https://lichess.org/api/games/user/${encodeURIComponent(username.trim())}?max=1&moves=true&opening=false&clocks=false&evals=false`,
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

    const [line] = (await response.text()).split("\n").filter(Boolean);

    if (!line) {
      return {
        status: "pending",
        gameId: "lichess-no-recent-games",
        summary: `No recent public Lichess games were found for ${username}.`,
        evidence: ["The latest-games adapter returned no visible games."],
      };
    }

    const game = JSON.parse(line) as LichessGame;
    const gameId = game.id ?? "lichess-latest-game";

    if (!game.status || OPEN_GAME_STATUSES.has(game.status)) {
      return {
        status: "pending",
        gameId,
        summary: `Found ${gameId}, but the Lichess game is not finished yet.`,
        evidence: [`Lichess status was ${game.status ?? "unknown"}.`],
      };
    }

    const { whiteName, blackName } = getPlayerNames(game);
    const normalizedUsername = username.trim().toLowerCase();

    if (whiteName !== normalizedUsername && blackName !== normalizedUsername) {
      return {
        status: "failed",
        gameId,
        summary: `Found ${gameId}, but saved username ${username} does not appear in that game.`,
        evidence: ["The latest visible game did not match the saved username."],
      };
    }

    const proofPosition = buildProofPositionFromUciMoves(game.moves);

    return {
      status: "passed",
      gameId,
      summary: `Verified ${gameId}. ${username} appears in a finished public Lichess game, so the Any Game Counts passed.`,
      completedGameAt: getCompletedGameAt(game),
      evidence: [`Game status was ${game.status}.`, "Win, loss, draw, color, and time control are accepted for this test quest."],
      ...proofPosition,
    };
  } catch {
    return {
      status: "pending",
      gameId: "lichess-latest-error",
      summary: `Lichess latest-game lookup could not complete for ${username}.`,
      evidence: ["Network or NDJSON parsing failed."],
    };
  }
}

async function verifyDrawAttempt({
  gameId,
  lichessUsername,
  requiredSide,
}: {
  gameId: string;
  lichessUsername: string;
  requiredSide: "white" | "black" | "either";
}): Promise<LichessVerificationVerdict> {
  if (!lichessUsername) {
    return {
      status: "pending",
      summary:
        "Submitted game saved, but no Lichess username is stored yet. Add it in account settings so verification can finish.",
    };
  }

  try {
    const game = await fetchLichessGame(gameId);

    if (!game) {
      return {
        status: "pending",
        summary: `Submitted ${gameId}, but Lichess verification is temporarily unavailable.`,
      };
    }

    const { whiteName, blackName } = getPlayerNames(game);
    const normalizedUsername = lichessUsername.trim().toLowerCase();

    if (whiteName !== normalizedUsername && blackName !== normalizedUsername) {
      return {
        status: "failed",
        summary: `Submitted ${gameId}, but saved username ${lichessUsername} does not appear in that finished game.`,
      };
    }

    if (!game.status || OPEN_GAME_STATUSES.has(game.status)) {
      return {
        status: "pending",
        summary: `Submitted ${gameId}. The Lichess game is not finished yet, so draw verification is still pending.`,
      };
    }

    const actualSide = whiteName === normalizedUsername ? "white" : "black";

    if (requiredSide !== "either" && actualSide !== requiredSide) {
      const requiredSideLabel = requiredSide === "white" ? "White" : "Black";
      return {
        status: "failed",
        summary: `Submitted ${gameId}, but ${lichessUsername} played ${actualSide === "white" ? "White" : "Black"} in that finished game, so it does not satisfy Draw as ${requiredSideLabel}.`,
      };
    }

    if (game.winner) {
      return {
        status: "failed",
        summary: `Submitted ${gameId}. ${lichessUsername} appears in that finished game, but it did not end in a draw.`,
      };
    }

    const proofPosition = buildProofPositionFromUciMoves(game.moves);

    if (requiredSide === "either") {
      return {
        status: "passed",
        summary: `Verified ${gameId}. ${lichessUsername} appears in a finished Lichess game with no winning side, so this draw quest passed.`,
        completedGameAt: getCompletedGameAt(game),
        ...proofPosition,
      };
    }

    const requiredSideLabel = requiredSide === "white" ? "White" : "Black";
    return {
      status: "passed",
      summary: `Verified ${gameId}. ${lichessUsername} drew that finished Lichess game as ${requiredSideLabel}, so this quest passed.`,
      completedGameAt: getCompletedGameAt(game),
      ...proofPosition,
    };
  } catch {
    return {
      status: "pending",
      summary: `Submitted ${gameId}, but Lichess verification could not complete right now. Try again later if this stays pending.`,
    };
  }
}

export async function verifyDrawAnyGameAttempt({
  gameId,
  lichessUsername,
}: {
  gameId: string;
  lichessUsername: string;
}): Promise<LichessVerificationVerdict> {
  return verifyDrawAttempt({ gameId, lichessUsername, requiredSide: "either" });
}

export async function verifyDrawAsWhiteAttempt({
  gameId,
  lichessUsername,
}: {
  gameId: string;
  lichessUsername: string;
}): Promise<LichessVerificationVerdict> {
  return verifyDrawAttempt({ gameId, lichessUsername, requiredSide: "white" });
}

export async function verifyDrawAsBlackAttempt({
  gameId,
  lichessUsername,
}: {
  gameId: string;
  lichessUsername: string;
}): Promise<LichessVerificationVerdict> {
  return verifyDrawAttempt({ gameId, lichessUsername, requiredSide: "black" });
}

async function verifyLoseAttempt({
  gameId,
  lichessUsername,
  requiredSide,
}: {
  gameId: string;
  lichessUsername: string;
  requiredSide: "white" | "black" | "either";
}): Promise<LichessVerificationVerdict> {
  if (!lichessUsername) {
    return {
      status: "pending",
      summary:
        "Submitted game saved, but no Lichess username is stored yet. Add it in account settings so verification can finish.",
    };
  }

  try {
    const game = await fetchLichessGame(gameId);

    if (!game) {
      return {
        status: "pending",
        summary: `Submitted ${gameId}, but Lichess verification is temporarily unavailable.`,
      };
    }

    const { whiteName, blackName } = getPlayerNames(game);
    const normalizedUsername = lichessUsername.trim().toLowerCase();

    if (whiteName !== normalizedUsername && blackName !== normalizedUsername) {
      return {
        status: "failed",
        summary: `Submitted ${gameId}, but saved username ${lichessUsername} does not appear in that finished game.`,
      };
    }

    if (!game.status || OPEN_GAME_STATUSES.has(game.status)) {
      return {
        status: "pending",
        summary: `Submitted ${gameId}. The Lichess game is not finished yet, so loss verification is still pending.`,
      };
    }

    if (!game.winner) {
      return {
        status: "failed",
        summary: `Submitted ${gameId}. ${lichessUsername} appears in that finished game, but it did not end with a winner, so this loss quest failed.`,
      };
    }

    const actualSide = whiteName === normalizedUsername ? "white" : "black";

    const requiredSideLabel = requiredSide === "white" ? "White" : "Black";

    if (requiredSide !== "either" && actualSide !== requiredSide) {
      return {
        status: "failed",
        summary: `Submitted ${gameId}, but ${lichessUsername} played ${actualSide === "white" ? "White" : "Black"} in that finished game, so it does not satisfy Lose as ${requiredSideLabel}.`,
      };
    }

    if (game.winner === actualSide) {
      return {
        status: "failed",
        summary: `Submitted ${gameId}. ${lichessUsername} appears in that finished game, but their side won instead of lost.`,
      };
    }

    const proofPosition = buildProofPositionFromUciMoves(game.moves);

    if (requiredSide === "either") {
      return {
        status: "passed",
        summary: `Verified ${gameId}. ${lichessUsername} appears in a finished Lichess game where the opposite side won, so this loss quest passed.`,
        completedGameAt: getCompletedGameAt(game),
        ...proofPosition,
      };
    }

    return {
      status: "passed",
      summary: `Verified ${gameId}. ${lichessUsername} lost that finished Lichess game as ${requiredSideLabel}, so this quest passed.`,
      completedGameAt: getCompletedGameAt(game),
      ...proofPosition,
    };
  } catch {
    return {
      status: "pending",
      summary: `Submitted ${gameId}, but Lichess verification could not complete right now. Try again later if this stays pending.`,
    };
  }
}

export async function verifyLoseAnyGameAttempt({
  gameId,
  lichessUsername,
}: {
  gameId: string;
  lichessUsername: string;
}): Promise<LichessVerificationVerdict> {
  return verifyLoseAttempt({ gameId, lichessUsername, requiredSide: "either" });
}

export async function verifyLoseAsWhiteAttempt({
  gameId,
  lichessUsername,
}: {
  gameId: string;
  lichessUsername: string;
}): Promise<LichessVerificationVerdict> {
  return verifyLoseAttempt({ gameId, lichessUsername, requiredSide: "white" });
}

export async function verifyLoseAsBlackAttempt({
  gameId,
  lichessUsername,
}: {
  gameId: string;
  lichessUsername: string;
}): Promise<LichessVerificationVerdict> {
  return verifyLoseAttempt({ gameId, lichessUsername, requiredSide: "black" });
}

async function verifyWinAttempt({
  gameId,
  lichessUsername,
  requiredSide,
}: {
  gameId: string;
  lichessUsername: string;
  requiredSide: "white" | "black";
}): Promise<LichessVerificationVerdict> {
  if (!lichessUsername) {
    return {
      status: "pending",
      summary:
        "Submitted game saved, but no Lichess username is stored yet. Add it in account settings so verification can finish.",
    };
  }

  try {
    const game = await fetchLichessGame(gameId);

    if (!game) {
      return {
        status: "pending",
        summary: `Submitted ${gameId}, but Lichess verification is temporarily unavailable.`,
      };
    }

    const { whiteName, blackName } = getPlayerNames(game);
    const normalizedUsername = lichessUsername.trim().toLowerCase();

    if (whiteName !== normalizedUsername && blackName !== normalizedUsername) {
      return {
        status: "failed",
        summary: `Submitted ${gameId}, but saved username ${lichessUsername} does not appear in that game.`,
      };
    }

    if (!game.status || OPEN_GAME_STATUSES.has(game.status)) {
      return {
        status: "pending",
        summary: `Submitted ${gameId}. The Lichess game is not finished yet, so win verification is still pending.`,
      };
    }

    const actualSide = whiteName === normalizedUsername ? "white" : "black";
    const requiredSideLabel = requiredSide === "white" ? "White" : "Black";

    if (actualSide !== requiredSide) {
      return {
        status: "failed",
        summary: `Submitted ${gameId}, but ${lichessUsername} played ${actualSide === "white" ? "White" : "Black"} in that finished game, so it does not satisfy Win as ${requiredSideLabel}.`,
      };
    }

    if (game.winner !== requiredSide) {
      return {
        status: "failed",
        summary: `Submitted ${gameId}. ${lichessUsername} finished the game as ${requiredSideLabel}, but ${requiredSideLabel} did not win.`,
      };
    }

    const proofPosition = buildProofPositionFromUciMoves(game.moves);

    return {
      status: "passed",
      summary: `Verified ${gameId}. ${lichessUsername} won that finished Lichess game as ${requiredSideLabel}, so this quest passed.`,
      completedGameAt: getCompletedGameAt(game),
      ...proofPosition,
    };
  } catch {
    return {
      status: "pending",
      summary: `Submitted ${gameId}, but Lichess verification could not complete right now. Try again later if this stays pending.`,
    };
  }
}

export async function verifyWinAsWhiteAttempt({
  gameId,
  lichessUsername,
}: {
  gameId: string;
  lichessUsername: string;
}): Promise<LichessVerificationVerdict> {
  return verifyWinAttempt({ gameId, lichessUsername, requiredSide: "white" });
}

export async function verifyWinAsBlackAttempt({
  gameId,
  lichessUsername,
}: {
  gameId: string;
  lichessUsername: string;
}): Promise<LichessVerificationVerdict> {
  return verifyWinAttempt({ gameId, lichessUsername, requiredSide: "black" });
}
