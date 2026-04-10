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

    if (requiredSide === "either") {
      return {
        status: "passed",
        summary: `Verified ${gameId}. ${lichessUsername} appears in a finished Lichess game, so this challenge passed.`,
      };
    }

    const requiredSideLabel = requiredSide === "white" ? "White" : "Black";
    return {
      status: "passed",
      summary: `Verified ${gameId}. ${lichessUsername} finished that Lichess game as ${requiredSideLabel}, so this challenge passed.`,
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

    if (requiredSide === "either") {
      return {
        status: "passed",
        summary: `Verified ${gameId}. ${lichessUsername} appears in a finished Lichess game with no winning side, so this draw challenge passed.`,
      };
    }

    const requiredSideLabel = requiredSide === "white" ? "White" : "Black";
    return {
      status: "passed",
      summary: `Verified ${gameId}. ${lichessUsername} drew that finished Lichess game as ${requiredSideLabel}, so this challenge passed.`,
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

    return {
      status: "passed",
      summary: `Verified ${gameId}. ${lichessUsername} won that finished Lichess game as ${requiredSideLabel}, so this challenge passed.`,
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
