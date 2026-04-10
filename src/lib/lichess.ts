type LichessPlayer = {
  user?: {
    name?: string;
  };
};

type LichessGame = {
  id?: string;
  status?: string;
  winner?: "white" | "black";
  players?: {
    white?: LichessPlayer;
    black?: LichessPlayer;
  };
};

export type LichessVerificationVerdict = {
  status: "passed" | "failed" | "pending";
  summary: string;
};

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

export async function verifyFinishAnyGameAttempt({
  gameId,
  lichessUsername,
}: {
  gameId: string;
  lichessUsername: string;
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

    return {
      status: "passed",
      summary: `Verified ${gameId}. ${lichessUsername} appears in a finished Lichess game, so this challenge passed.`,
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

    if (whiteName !== normalizedUsername) {
      return {
        status: "failed",
        summary: `Submitted ${gameId}, but ${lichessUsername} played Black in that finished game, so it does not satisfy Win as White.`,
      };
    }

    if (game.winner !== "white") {
      return {
        status: "failed",
        summary: `Submitted ${gameId}. ${lichessUsername} finished the game as White, but White did not win.`,
      };
    }

    return {
      status: "passed",
      summary: `Verified ${gameId}. ${lichessUsername} won that finished Lichess game as White, so this challenge passed.`,
    };
  } catch {
    return {
      status: "pending",
      summary: `Submitted ${gameId}, but Lichess verification could not complete right now. Try again later if this stays pending.`,
    };
  }
}
