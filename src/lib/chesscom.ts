export type ChessComVerificationVerdict = {
  status: "passed" | "failed" | "pending";
  summary: string;
};

type ChessComNoCastleGame = {
  id: string;
  playerColor: "white" | "black";
  winner: "white" | "black" | "draw" | "unknown";
  moveCount: number;
  variant?: "standard" | string;
  timeClass?: "bullet" | "blitz" | "rapid" | "classical" | "daily" | "unknown";
  castling: Array<{
    ply: number;
    color: "white" | "black";
    side: "kingside" | "queenside";
  }>;
};

type ChessComNoCastleVerdict = {
  status: "passed" | "failed" | "pending";
  gameId: string;
  summary: string;
  evidence: string[];
};

type ChessComKnightsBeforeCoffeeGame = {
  id: string;
  playerColor: "white" | "black";
  winner: "white" | "black" | "draw" | "unknown";
  moveCount: number;
  variant?: "standard" | string;
  timeClass?: "bullet" | "blitz" | "rapid" | "classical" | "daily" | "unknown";
  firstFourPlayerMovePieces: Array<"pawn" | "knight" | "bishop" | "rook" | "queen" | "king">;
};

type ChessComKnightsBeforeCoffeeVerdict = {
  status: "passed" | "failed" | "pending";
  gameId: string;
  summary: string;
  evidence: string[];
};

type ChessComBishopFieldTripGame = {
  id: string;
  playerColor: "white" | "black";
  winner: "white" | "black" | "draw" | "unknown";
  moveCount: number;
  variant?: "standard" | string;
  timeClass?: "bullet" | "blitz" | "rapid" | "classical" | "daily" | "unknown";
  bothBishopsMovedBeforeQueen: boolean;
  movedBishopHomeSquaresBeforeQueen: string[];
  queenMovedOnPlayerMove?: number;
};

type ChessComBishopFieldTripVerdict = {
  status: "passed" | "failed" | "pending";
  gameId: string;
  summary: string;
  evidence: string[];
};

type ChessComPlayer = {
  username?: string;
  result?: string;
};

export type ChessComGame = {
  url?: string;
  uuid?: string;
  end_time?: number;
  pgn?: string;
  rules?: string;
  time_class?: string;
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
      "User-Agent": "side-quest-chess-verifier/0.1 (+https://sidequestchess.com)",
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
      "User-Agent": "side-quest-chess-verifier/0.1 (+https://sidequestchess.com)",
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

function didSideLose(game: ChessComGame, side: "white" | "black"): boolean {
  return didSideWin(game, side === "white" ? "black" : "white");
}

function getWinningSide(game: ChessComGame): "white" | "black" | "draw" | "unknown" {
  const whiteResult = game.white?.result?.toLowerCase();
  const blackResult = game.black?.result?.toLowerCase();

  if (whiteResult === "win") return "white";
  if (blackResult === "win") return "black";
  if (whiteResult && blackResult && DRAW_RESULTS.has(whiteResult) && DRAW_RESULTS.has(blackResult)) return "draw";
  return "unknown";
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

function normalizeChessComTimeClass(value?: string): ChessComNoCastleGame["timeClass"] {
  const normalized = value?.toLowerCase();
  return normalized === "bullet" || normalized === "blitz" || normalized === "rapid" || normalized === "classical" || normalized === "daily"
    ? normalized
    : "unknown";
}

function extractSanMoveTokens(pgn: string): string[] {
  const body = pgn.includes("\n\n") ? pgn.split(/\r?\n\r?\n/).slice(1).join("\n") : pgn;
  let moveText = body.replace(/\{[^}]*\}/g, " ").replace(/;[^\n]*/g, " ");

  // Chess.com public PGNs rarely include variations, but strip simple nesting defensively.
  while (/\([^()]*\)/.test(moveText)) {
    moveText = moveText.replace(/\([^()]*\)/g, " ");
  }

  return moveText
    .replace(/\d+\.(\.\.)?/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token) => !/^\$\d+$/.test(token))
    .filter((token) => !["1-0", "0-1", "1/2-1/2", "*"].includes(token));
}

function chessComCastlingFromSan(token: string, ply: number) {
  const normalized = token.replace(/[+#?!]+$/g, "").replace(/0/g, "O");

  if (normalized !== "O-O" && normalized !== "O-O-O") {
    return null;
  }

  return {
    ply,
    color: ply % 2 === 1 ? ("white" as const) : ("black" as const),
    side: normalized === "O-O" ? ("kingside" as const) : ("queenside" as const),
  };
}

function chessComPieceFromSan(token: string): ChessComKnightsBeforeCoffeeGame["firstFourPlayerMovePieces"][number] {
  const normalized = token
    .replace(/[+#?!]+$/g, "")
    .replace(/^\.{1,3}/, "")
    .replace(/^[KQRBN]?x/, (capture) => capture.slice(0, -1))
    .replace(/=.*$/, "");

  if (normalized.startsWith("N")) return "knight";
  if (normalized.startsWith("B")) return "bishop";
  if (normalized.startsWith("R")) return "rook";
  if (normalized.startsWith("Q")) return "queen";
  if (normalized.startsWith("K") || normalized.replace(/0/g, "O").startsWith("O-O")) return "king";
  return "pawn";
}

function chessComPlayerMovePiecesFromSan(
  sanMoves: string[],
  playerColor: "white" | "black",
): ChessComKnightsBeforeCoffeeGame["firstFourPlayerMovePieces"] {
  return sanMoves
    .filter((_, index) => (playerColor === "white" ? index % 2 === 0 : index % 2 === 1))
    .slice(0, 4)
    .map(chessComPieceFromSan);
}

function chessComTargetSquareFromSan(token: string): string | null {
  const normalized = token
    .replace(/[+#?!]+$/g, "")
    .replace(/^\.{1,3}/, "")
    .replace(/=.*$/, "");
  const match = normalized.match(/([a-h][1-8])$/);
  return match?.[1] ?? null;
}

function chessComSquareShade(square: string): "dark" | "light" {
  const file = square.charCodeAt(0) - "a".charCodeAt(0) + 1;
  const rank = Number(square[1]);
  return (file + rank) % 2 === 0 ? "dark" : "light";
}

function chessComBishopHomeForTargetSquare(playerColor: "white" | "black", targetSquare: string) {
  const shade = chessComSquareShade(targetSquare);

  if (playerColor === "white") {
    return shade === "dark" ? "c1" : "f1";
  }

  return shade === "light" ? "c8" : "f8";
}

function chessComBishopFieldTripFromSan(sanMoves: string[], playerColor: "white" | "black") {
  const movedBishopHomes = new Set<string>();
  let playerMoveNumber = 0;
  let queenMovedOnPlayerMove: number | undefined;

  sanMoves.forEach((token, index) => {
    const isPlayerMove = playerColor === "white" ? index % 2 === 0 : index % 2 === 1;

    if (!isPlayerMove) {
      return;
    }

    playerMoveNumber += 1;
    const piece = chessComPieceFromSan(token);

    if (!queenMovedOnPlayerMove && piece === "bishop") {
      const targetSquare = chessComTargetSquareFromSan(token);
      if (targetSquare) {
        movedBishopHomes.add(chessComBishopHomeForTargetSquare(playerColor, targetSquare));
      }
    }

    if (piece === "queen" && queenMovedOnPlayerMove === undefined) {
      queenMovedOnPlayerMove = playerMoveNumber;
    }
  });

  const homeSquares = playerColor === "white" ? ["c1", "f1"] : ["c8", "f8"];
  const movedBishopHomeSquaresBeforeQueen = homeSquares.filter((square) => movedBishopHomes.has(square));

  return {
    bothBishopsMovedBeforeQueen: movedBishopHomeSquaresBeforeQueen.length === 2,
    movedBishopHomeSquaresBeforeQueen,
    queenMovedOnPlayerMove,
  };
}

function chessComColorName(color: "white" | "black") {
  return color === "white" ? "White" : "Black";
}

function evaluateChessComNoCastleClub(game: ChessComNoCastleGame): ChessComNoCastleVerdict {
  const playerCastling = game.castling.find((event) => event.color === game.playerColor);
  const opponentCastling = game.castling.find((event) => event.color !== game.playerColor);

  if (game.variant && game.variant !== "standard") {
    return {
      status: "failed",
      gameId: game.id,
      summary: "Variants are fun, but No Castle Club only counts standard chess games.",
      evidence: [`Variant was ${game.variant}.`],
    };
  }

  if (!["bullet", "blitz", "rapid", "unknown"].includes(game.timeClass ?? "unknown")) {
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
      evidence: [`Winner was ${game.winner === "draw" ? "draw" : chessComColorName(game.winner as "white" | "black")}.`],
    };
  }

  if (playerCastling) {
    return {
      status: "failed",
      gameId: game.id,
      summary: `The king took the sensible ${playerCastling.side} castle. Club membership denied.`,
      evidence: [`${chessComColorName(game.playerColor)} castled ${playerCastling.side} on move ${Math.ceil(playerCastling.ply / 2)}.`],
    };
  }

  return {
    status: "passed",
    gameId: game.id,
    summary: "Win confirmed with zero player castling. The king stayed uninsured and somehow survived.",
    evidence: [
      `${chessComColorName(game.playerColor)} never castled in the normalized Chess.com PGN move feed.`,
      `${chessComColorName(game.playerColor)} won after ${game.moveCount} moves.`,
      opponentCastling
        ? `${chessComColorName(opponentCastling.color)} castled ${opponentCastling.side}; opponent shelter is allowed.`
        : "No castling by either side was detected.",
    ],
  };
}

export function normalizeChessComNoCastleClubGame(game: ChessComGame, username: string): ChessComNoCastleGame | null {
  const playerColor = getPlayerSideForUsername(game, username);

  if (!game.url || !playerColor || !game.pgn) {
    return null;
  }

  const sanMoves = extractSanMoveTokens(game.pgn);
  const castling = sanMoves
    .map((token, index) => chessComCastlingFromSan(token, index + 1))
    .filter((event): event is NonNullable<ReturnType<typeof chessComCastlingFromSan>> => Boolean(event));

  return {
    id: normalizeChessComGameUrl(game.url),
    playerColor,
    winner: getWinningSide(game),
    moveCount: Math.ceil(sanMoves.length / 2),
    variant: game.rules === "chess" || !game.rules ? "standard" : game.rules,
    timeClass: normalizeChessComTimeClass(game.time_class),
    castling,
  };
}

export async function checkLatestChessComNoCastleClub(username: string): Promise<ChessComNoCastleVerdict> {
  if (!username.trim()) {
    return {
      status: "pending",
      gameId: "chesscom-username-missing",
      summary: "Add a Chess.com username before Side Quest Chess can inspect latest no-castle attempts.",
      evidence: ["No Chess.com username is stored."],
    };
  }

  try {
    const archives = await fetchArchiveMonths(username.trim());

    if (!archives?.length) {
      return {
        status: "pending",
        gameId: "chesscom-no-archives",
        summary: `No public Chess.com archives were found for ${username}.`,
        evidence: ["Chess.com returned no public monthly archives."],
      };
    }

    const recentArchives = archives.slice(-3).reverse();

    for (const archiveUrl of recentArchives) {
      const games = await fetchMonthlyArchive(archiveUrl);

      if (!games?.length) {
        continue;
      }

      const normalizedGames = games
        .slice()
        .sort((a, b) => (b.end_time ?? 0) - (a.end_time ?? 0))
        .map((game) => normalizeChessComNoCastleClubGame(game, username))
        .filter((game): game is ChessComNoCastleGame => Boolean(game));

      if (normalizedGames.length) {
        return evaluateChessComNoCastleClub(normalizedGames[0]);
      }
    }

    return {
      status: "pending",
      gameId: "chesscom-no-normalized-games",
      summary: `No recent public Chess.com games with PGN move text were found for ${username}.`,
      evidence: ["The latest-games adapter returned no normalizable Chess.com games."],
    };
  } catch {
    return {
      status: "pending",
      gameId: "chesscom-latest-error",
      summary: `Chess.com latest-game lookup could not complete for ${username}.`,
      evidence: ["Network, archive, or PGN parsing failed."],
    };
  }
}

function evaluateChessComKnightsBeforeCoffee(game: ChessComKnightsBeforeCoffeeGame): ChessComKnightsBeforeCoffeeVerdict {
  if (game.variant && game.variant !== "standard") {
    return {
      status: "failed",
      gameId: game.id,
      summary: "Variants are fun, but Knights Before Coffee only counts standard chess games.",
      evidence: [`Variant was ${game.variant}.`],
    };
  }

  if (!["bullet", "blitz", "rapid", "unknown"].includes(game.timeClass ?? "unknown")) {
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
      evidence: [`Winner was ${game.winner === "draw" ? "draw" : chessComColorName(game.winner as "white" | "black")}.`],
    };
  }

  if (game.firstFourPlayerMovePieces.length < 4) {
    return {
      status: "pending",
      gameId: game.id,
      summary: "The latest Chess.com game ended before four player moves could be checked.",
      evidence: [`Only ${game.firstFourPlayerMovePieces.length} player moves were available.`],
    };
  }

  const firstNonKnightIndex = game.firstFourPlayerMovePieces.findIndex((piece) => piece !== "knight");

  if (firstNonKnightIndex !== -1) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "The first four player moves were not all knight moves.",
      evidence: [
        `Move ${firstNonKnightIndex + 1} was a ${game.firstFourPlayerMovePieces[firstNonKnightIndex]}.`,
        `First four player moves: ${game.firstFourPlayerMovePieces.join(", ")}.`,
      ],
    };
  }

  return {
    status: "passed",
    gameId: game.id,
    summary: "Horse-first opening confirmed: the first four player moves were knights, and the player won anyway.",
    evidence: [
      `${chessComColorName(game.playerColor)} won the normalized Chess.com game.`,
      "The first four player moves were knight moves.",
    ],
  };
}

export function normalizeChessComKnightsBeforeCoffeeGame(game: ChessComGame, username: string): ChessComKnightsBeforeCoffeeGame | null {
  const playerColor = getPlayerSideForUsername(game, username);

  if (!game.url || !playerColor || !game.pgn) {
    return null;
  }

  const sanMoves = extractSanMoveTokens(game.pgn);

  return {
    id: normalizeChessComGameUrl(game.url),
    playerColor,
    winner: getWinningSide(game),
    moveCount: Math.ceil(sanMoves.length / 2),
    variant: game.rules === "chess" || !game.rules ? "standard" : game.rules,
    timeClass: normalizeChessComTimeClass(game.time_class),
    firstFourPlayerMovePieces: chessComPlayerMovePiecesFromSan(sanMoves, playerColor),
  };
}

export async function checkLatestChessComKnightsBeforeCoffee(username: string): Promise<ChessComKnightsBeforeCoffeeVerdict> {
  if (!username.trim()) {
    return {
      status: "pending",
      gameId: "chesscom-username-missing",
      summary: "Add a Chess.com username before Side Quest Chess can inspect latest horse-first attempts.",
      evidence: ["No Chess.com username is stored."],
    };
  }

  try {
    const archives = await fetchArchiveMonths(username.trim());

    if (!archives?.length) {
      return {
        status: "pending",
        gameId: "chesscom-no-archives",
        summary: `No public Chess.com archives were found for ${username}.`,
        evidence: ["Chess.com returned no public monthly archives."],
      };
    }

    const recentArchives = archives.slice(-3).reverse();

    for (const archiveUrl of recentArchives) {
      const games = await fetchMonthlyArchive(archiveUrl);

      if (!games?.length) {
        continue;
      }

      const normalizedGames = games
        .slice()
        .sort((a, b) => (b.end_time ?? 0) - (a.end_time ?? 0))
        .map((game) => normalizeChessComKnightsBeforeCoffeeGame(game, username))
        .filter((game): game is ChessComKnightsBeforeCoffeeGame => Boolean(game));

      if (normalizedGames.length) {
        return evaluateChessComKnightsBeforeCoffee(normalizedGames[0]);
      }
    }

    return {
      status: "pending",
      gameId: "chesscom-no-normalized-games",
      summary: `No recent public Chess.com games with PGN move text were found for ${username}.`,
      evidence: ["The latest-games adapter returned no normalizable Chess.com games."],
    };
  } catch {
    return {
      status: "pending",
      gameId: "chesscom-latest-error",
      summary: `Chess.com latest-game lookup could not complete for ${username}.`,
      evidence: ["Network, archive, or PGN parsing failed."],
    };
  }
}
function evaluateChessComBishopFieldTrip(game: ChessComBishopFieldTripGame): ChessComBishopFieldTripVerdict {
  if (game.variant && game.variant !== "standard") {
    return {
      status: "failed",
      gameId: game.id,
      summary: "Variants are fun, but Bishop Field Trip only counts standard chess games.",
      evidence: [`Variant was ${game.variant}.`],
    };
  }

  if (!["bullet", "blitz", "rapid", "unknown"].includes(game.timeClass ?? "unknown")) {
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
      evidence: [`Winner was ${game.winner === "draw" ? "draw" : chessComColorName(game.winner as "white" | "black")}.`],
    };
  }

  if (!game.bothBishopsMovedBeforeQueen) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "Both original bishops need to leave home before the queen gets involved.",
      evidence: [
        `Moved bishop homes before queen: ${game.movedBishopHomeSquaresBeforeQueen.length ? game.movedBishopHomeSquaresBeforeQueen.join(", ") : "none"}.`,
        game.queenMovedOnPlayerMove
          ? `Queen first moved on player move ${game.queenMovedOnPlayerMove}.`
          : "The player queen did not move in the normalized Chess.com PGN.",
      ],
    };
  }

  return {
    status: "passed",
    gameId: game.id,
    summary: "Bishop field trip confirmed: both original bishops left home before the queen moved, and the player won anyway.",
    evidence: [
      `${chessComColorName(game.playerColor)} won the normalized Chess.com game.`,
      `Original bishop homes moved before queen: ${game.movedBishopHomeSquaresBeforeQueen.join(", ")}.`,
      game.queenMovedOnPlayerMove
        ? `Queen first moved on player move ${game.queenMovedOnPlayerMove}.`
        : "The queen never moved, which still keeps the bishop field trip valid.",
    ],
  };
}

export function normalizeChessComBishopFieldTripGame(game: ChessComGame, username: string): ChessComBishopFieldTripGame | null {
  const playerColor = getPlayerSideForUsername(game, username);

  if (!game.url || !playerColor || !game.pgn) {
    return null;
  }

  const sanMoves = extractSanMoveTokens(game.pgn);
  const bishopTrip = chessComBishopFieldTripFromSan(sanMoves, playerColor);

  return {
    id: normalizeChessComGameUrl(game.url),
    playerColor,
    winner: getWinningSide(game),
    moveCount: Math.ceil(sanMoves.length / 2),
    variant: game.rules === "chess" || !game.rules ? "standard" : game.rules,
    timeClass: normalizeChessComTimeClass(game.time_class),
    ...bishopTrip,
  };
}

export async function checkLatestChessComBishopFieldTrip(username: string): Promise<ChessComBishopFieldTripVerdict> {
  if (!username.trim()) {
    return {
      status: "pending",
      gameId: "chesscom-username-missing",
      summary: "Add a Chess.com username before Side Quest Chess can inspect latest bishop field trips.",
      evidence: ["No Chess.com username is stored."],
    };
  }

  try {
    const archives = await fetchArchiveMonths(username.trim());

    if (!archives?.length) {
      return {
        status: "pending",
        gameId: "chesscom-no-archives",
        summary: `No public Chess.com archives were found for ${username}.`,
        evidence: ["Chess.com returned no public monthly archives."],
      };
    }

    const recentArchives = archives.slice(-3).reverse();

    for (const archiveUrl of recentArchives) {
      const games = await fetchMonthlyArchive(archiveUrl);

      if (!games?.length) {
        continue;
      }

      const normalizedGames = games
        .slice()
        .sort((a, b) => (b.end_time ?? 0) - (a.end_time ?? 0))
        .map((game) => normalizeChessComBishopFieldTripGame(game, username))
        .filter((game): game is ChessComBishopFieldTripGame => Boolean(game));

      if (normalizedGames.length) {
        return evaluateChessComBishopFieldTrip(normalizedGames[0]);
      }
    }

    return {
      status: "pending",
      gameId: "chesscom-no-normalized-games",
      summary: `No recent public Chess.com games with PGN move text were found for ${username}.`,
      evidence: ["The latest-games adapter returned no normalizable Chess.com games."],
    };
  } catch {
    return {
      status: "pending",
      gameId: "chesscom-latest-error",
      summary: `Chess.com latest-game lookup could not complete for ${username}.`,
      evidence: ["Network, archive, or PGN parsing failed."],
    };
  }
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

export async function verifyChessComDrawAsWhiteAttempt({
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
    passSummary: `Verified Chess.com game. ${chessComUsername} finished a public draw as White, so this challenge passed.`,
    sideMismatchSummary: `Submitted Chess.com game found, but saved username ${chessComUsername} appears as Black instead of White.`,
    resultRequirement: (game) => isDrawGame(game),
    resultMismatchSummary: `Submitted Chess.com game found, and ${chessComUsername} appears as White, but the game did not finish as a draw.`,
  });
}

export async function verifyChessComDrawAsBlackAttempt({
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
    passSummary: `Verified Chess.com game. ${chessComUsername} finished a public draw as Black, so this challenge passed.`,
    sideMismatchSummary: `Submitted Chess.com game found, but saved username ${chessComUsername} appears as White instead of Black.`,
    resultRequirement: (game) => isDrawGame(game),
    resultMismatchSummary: `Submitted Chess.com game found, and ${chessComUsername} appears as Black, but the game did not finish as a draw.`,
  });
}

export async function verifyChessComLoseAnyGameAttempt({
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
    passSummary: `Verified Chess.com game. ${chessComUsername} appears in a finished public loss, so this challenge passed.`,
    sideMismatchSummary: "",
    resultRequirement: (game, playerSide) => didSideLose(game, playerSide),
    resultMismatchSummary: `Submitted Chess.com game found, but it did not finish as a loss for ${chessComUsername}.`,
  });
}

export async function verifyChessComLoseAsWhiteAttempt({
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
    passSummary: `Verified Chess.com game. ${chessComUsername} lost a finished public game as White, so this challenge passed.`,
    sideMismatchSummary: `Submitted Chess.com game found, but saved username ${chessComUsername} appears as Black instead of White.`,
    resultRequirement: (game) => didSideLose(game, "white"),
    resultMismatchSummary: `Submitted Chess.com game found, and ${chessComUsername} appears as White, but White did not lose.`,
  });
}

export async function verifyChessComLoseAsBlackAttempt({
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
    passSummary: `Verified Chess.com game. ${chessComUsername} lost a finished public game as Black, so this challenge passed.`,
    sideMismatchSummary: `Submitted Chess.com game found, but saved username ${chessComUsername} appears as White instead of Black.`,
    resultRequirement: (game) => didSideLose(game, "black"),
    resultMismatchSummary: `Submitted Chess.com game found, and ${chessComUsername} appears as Black, but Black did not lose.`,
  });
}
