export type ChessComVerificationVerdict = {
  status: "passed" | "failed" | "pending";
  summary: string;
};

type ChessComPlayer = {
  username?: string;
  result?: string;
};

type ChessComGame = {
  url?: string;
  uuid?: string;
  end_time?: number;
  white?: ChessComPlayer;
  black?: ChessComPlayer;
};

type ChessComMonthlyArchive = {
  games?: ChessComGame[];
};

const DRAW_RESULTS = new Set([
  "agreed",
  "repetition",
  "stalemate",
  "50move",
  "timevsinsufficient",
  "insufficient",
]);

const WINNING_RESULTS = new Set([
  "win",
  "checkmated",
  "resigned",
  "timeout",
  "abandoned",
  "lose",
]);

function normalizeChessComUsername(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeChessComGameUrl(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

async function fetchArchiveMonths(chessComUsername: string): Promise<string[] | null> {
  const response = await fetch(`https://api.chess.com/pub/player/${encodeURIComponent(chessComUsername)}/games/archives`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "cc-verifier/0.1 (+https://cc-taupe-kappa.vercel.app)",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { archives?: string[] };
  return Array.isArray(data.archives) ? data.archives : null;
}

async function fetchMonthlyArchive(url: string): Promise<ChessComGame[] | null> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "cc-verifier/0.1 (+https://cc-taupe-kappa.vercel.app)",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as ChessComMonthlyArchive;
  return Array.isArray(data.games) ? data.games : null;
}

function isDrawGame(game: ChessComGame): boolean {
  const whiteResult = game.white?.result?.toLowerCase();
  const blackResult = game.black?.result?.toLowerCase();
  return Boolean(whiteResult && blackResult && DRAW_RESULTS.has(whiteResult) && DRAW_RESULTS.has(blackResult));
}

function isFinishedGame(game: ChessComGame): boolean {
  return Boolean(game.end_time);
}

function didSideWin(game: ChessComGame, side: "white" | "black"): boolean {
  const opponentResult = (side === "white" ? game.black?.result : game.white?.result)?.toLowerCase();
  return Boolean(opponentResult && WINNING_RESULTS.has(opponentResult));
}

function getPlayerSideForUsername(game: ChessComGame, chessComUsername: string): "white" | "black" | null {
  const normalizedUsername = normalizeChessComUsername(chessComUsername);
  const whiteName = normalizeChessComUsername(game.white?.username ?? "");
  const blackName = normalizeChessComUsername(game.black?.username ?? "");

  if (whiteName === normalizedUsername) {
    return "white";
  }

  if (blackName === normalizedUsername) {
    return "black";
  }

  return null;
}

async function findGameByUrl(chessComUsername: string, rawGameUrl: string): Promise<ChessComGame | null | undefined> {
  const normalizedUrl = normalizeChessComGameUrl(rawGameUrl);
  const archives = await fetchArchiveMonths(chessComUsername);

  if (!archives?.length) {
    return null;
  }

  const recentArchives = archives.slice(-3).reverse();

  for (const archiveUrl of recentArchives) {
    const games = await fetchMonthlyArchive(archiveUrl);

    if (!games) {
      continue;
    }

    const match = games.find((game) => normalizeChessComGameUrl(game.url ?? "") === normalizedUrl);
    if (match) {
      return match;
    }
  }

  return undefined;
}

async function verifyChessComFinishedGameWithSideRequirement({
  gameUrl,
  chessComUsername,
  requiredSide,
  passSummary,
  sideMismatchSummary,
  resultRequirement,
  resultMismatchSummary,
}: {
  gameUrl: string;
  chessComUsername: string;
  requiredSide: "white" | "black" | "either";
  passSummary: string;
  sideMismatchSummary: string;
  resultRequirement?: (game: ChessComGame, playerSide: "white" | "black") => boolean;
  resultMismatchSummary?: string;
}): Promise<ChessComVerificationVerdict> {
  if (!chessComUsername) {
    return {
      status: "pending",
      summary:
        "Submitted Chess.com game saved, but no Chess.com username is stored yet. Add it in account settings so verification can finish.",
    };
  }

  try {
    const normalizedUsername = normalizeChessComUsername(chessComUsername);
    const normalizedUrl = normalizeChessComGameUrl(gameUrl);

    if (!/^https?:\/\/(www\.)?chess\.com\/game\//i.test(normalizedUrl)) {
      return {
        status: "failed",
        summary: "That does not look like a Chess.com game URL. Paste the full Chess.com game link.",
      };
    }

    const game = await findGameByUrl(normalizedUsername, normalizedUrl);

    if (game === null) {
      return {
        status: "pending",
        summary: `Submitted Chess.com game, but Chess.com archive lookup is temporarily unavailable for ${chessComUsername}.`,
      };
    }

    if (!game) {
      return {
        status: "pending",
        summary: "Submitted Chess.com game saved, but it is not visible in the recent public archive yet. Try again shortly if the game just finished.",
      };
    }

    const playerSide = getPlayerSideForUsername(game, normalizedUsername);

    if (!playerSide) {
      return {
        status: "failed",
        summary: `Submitted Chess.com game found, but saved username ${chessComUsername} does not appear in that game.`,
      };
    }

    if (!isFinishedGame(game)) {
      return {
        status: "pending",
        summary: "Submitted Chess.com game is not finished yet, so verification is still pending.",
      };
    }

    if (requiredSide !== "either" && playerSide !== requiredSide) {
      return {
        status: "failed",
        summary: sideMismatchSummary,
      };
    }

    if (resultRequirement && !resultRequirement(game, playerSide)) {
      return {
        status: "failed",
        summary: resultMismatchSummary ?? "Submitted Chess.com game found, but it does not satisfy this challenge.",
      };
    }

    return {
      status: "passed",
      summary: passSummary,
    };
  } catch {
    return {
      status: "pending",
      summary: "Submitted Chess.com game, but verification could not complete right now. Try again later if this stays pending.",
    };
  }
}

export async function verifyChessComFinishAnyGameAttempt({
  gameUrl,
  chessComUsername,
}: {
  gameUrl: string;
  chessComUsername: string;
}): Promise<ChessComVerificationVerdict> {
  return verifyChessComFinishedGameWithSideRequirement({
    gameUrl,
    chessComUsername,
    requiredSide: "either",
    passSummary: `Verified Chess.com game. ${chessComUsername} appears in a finished public game, so this challenge passed.`,
    sideMismatchSummary: "",
  });
}

export async function verifyChessComFinishAsWhiteAttempt({
  gameUrl,
  chessComUsername,
}: {
  gameUrl: string;
  chessComUsername: string;
}): Promise<ChessComVerificationVerdict> {
  return verifyChessComFinishedGameWithSideRequirement({
    gameUrl,
    chessComUsername,
    requiredSide: "white",
    passSummary: `Verified Chess.com game. ${chessComUsername} finished a public game as White, so this challenge passed.`,
    sideMismatchSummary: `Submitted Chess.com game found, but saved username ${chessComUsername} appears as Black instead of White.`,
  });
}

export async function verifyChessComFinishAsBlackAttempt({
  gameUrl,
  chessComUsername,
}: {
  gameUrl: string;
  chessComUsername: string;
}): Promise<ChessComVerificationVerdict> {
  return verifyChessComFinishedGameWithSideRequirement({
    gameUrl,
    chessComUsername,
    requiredSide: "black",
    passSummary: `Verified Chess.com game. ${chessComUsername} finished a public game as Black, so this challenge passed.`,
    sideMismatchSummary: `Submitted Chess.com game found, but saved username ${chessComUsername} appears as White instead of Black.`,
  });
}

export async function verifyChessComWinAsWhiteAttempt({
  gameUrl,
  chessComUsername,
}: {
  gameUrl: string;
  chessComUsername: string;
}): Promise<ChessComVerificationVerdict> {
  return verifyChessComFinishedGameWithSideRequirement({
    gameUrl,
    chessComUsername,
    requiredSide: "white",
    passSummary: `Verified Chess.com game. ${chessComUsername} won a finished public game as White, so this challenge passed.`,
    sideMismatchSummary: `Submitted Chess.com game found, but saved username ${chessComUsername} appears as Black instead of White.`,
    resultRequirement: (game) => didSideWin(game, "white"),
    resultMismatchSummary: `Submitted Chess.com game found, and ${chessComUsername} appears as White, but White did not win.`,
  });
}

export async function verifyChessComWinAsBlackAttempt({
  gameUrl,
  chessComUsername,
}: {
  gameUrl: string;
  chessComUsername: string;
}): Promise<ChessComVerificationVerdict> {
  return verifyChessComFinishedGameWithSideRequirement({
    gameUrl,
    chessComUsername,
    requiredSide: "black",
    passSummary: `Verified Chess.com game. ${chessComUsername} won a finished public game as Black, so this challenge passed.`,
    sideMismatchSummary: `Submitted Chess.com game found, but saved username ${chessComUsername} appears as White instead of Black.`,
    resultRequirement: (game) => didSideWin(game, "black"),
    resultMismatchSummary: `Submitted Chess.com game found, and ${chessComUsername} appears as Black, but Black did not win.`,
  });
}

export async function verifyChessComDrawAnyGameAttempt({
  gameUrl,
  chessComUsername,
}: {
  gameUrl: string;
  chessComUsername: string;
}): Promise<ChessComVerificationVerdict> {
  return verifyChessComFinishedGameWithSideRequirement({
    gameUrl,
    chessComUsername,
    requiredSide: "either",
    passSummary: `Verified Chess.com game. ${chessComUsername} appears in a finished public draw, so this challenge passed.`,
    sideMismatchSummary: "",
    resultRequirement: (game) => isDrawGame(game),
    resultMismatchSummary: `Submitted Chess.com game found, but it did not finish as a draw.`,
  });
}
