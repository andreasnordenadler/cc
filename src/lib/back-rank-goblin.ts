import { Chess } from "chess.js";
import { normalizeLichessMoveTokens } from "./lichess-move-normalizer";

export type BackRankSide = "white" | "black";
export type BackRankResult = BackRankSide | "draw" | "unknown";

export type BackRankGame = {
  id: string;
  playerColor: BackRankSide;
  winner: BackRankResult;
  moves: string[];
  source: "lichess" | "chess.com";
  startedGameAt?: string;
  completedGameAt?: string;
};

export type BackRankVerdict = {
  status: "passed" | "failed" | "pending";
  gameId: string;
  summary: string;
  evidence: string[];
  startedGameAt?: string;
  completedGameAt?: string;
  finalPositionFen?: string;
  lastMoveUci?: string;
  lastMoveSan?: string;
};

type LichessBackRankGame = {
  id?: string;
  moves?: string;
  variant?: string;
  winner?: BackRankSide;
  createdAt?: number;
  lastMoveAt?: number;
  players?: {
    white?: { user?: { name?: string } };
    black?: { user?: { name?: string } };
  };
};

type ChessComPlayer = {
  username?: string;
  result?: string;
};

type ChessComBackRankGame = {
  url?: string;
  uuid?: string;
  end_time?: number;
  pgn?: string;
  rules?: string;
  white?: ChessComPlayer;
  black?: ChessComPlayer;
};

function colorName(color: BackRankSide) {
  return color === "white" ? "White" : "Black";
}

function opposite(color: BackRankSide): BackRankSide {
  return color === "white" ? "black" : "white";
}

function normalizeUsername(value?: string) {
  return value?.trim().toLowerCase() ?? "";
}

function getPlayerColor(whiteName: string | undefined, blackName: string | undefined, username: string): BackRankSide | null {
  const normalizedUsername = normalizeUsername(username);

  if (normalizeUsername(whiteName) === normalizedUsername) return "white";
  if (normalizeUsername(blackName) === normalizedUsername) return "black";
  return null;
}

function chessComResult(game: ChessComBackRankGame): BackRankResult {
  if (game.white?.result === "win") return "white";
  if (game.black?.result === "win") return "black";
  if ([game.white?.result, game.black?.result].some((result) => result === "agreed" || result === "repetition" || result === "stalemate" || result === "50move" || result === "insufficient" || result === "timevsinsufficient")) {
    return "draw";
  }
  return "unknown";
}

function extractSanMoveTokens(pgn: string): string[] {
  const body = pgn.includes("\n\n") ? pgn.split(/\r?\n\r?\n/).slice(1).join("\n") : pgn;

  return body
    .replace(/\{[^}]*\}/g, " ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\$\d+/g, " ")
    .replace(/\d+\.\.\./g, " ")
    .replace(/\d+\./g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token) => !["1-0", "0-1", "1/2-1/2", "*"].includes(token));
}

function getChessComStartedGameAt(game: ChessComBackRankGame): string | undefined {
  const pgn = game.pgn ?? "";
  const date = pgn.match(/\[UTCDate "([^"?]+)"\]/)?.[1] ?? pgn.match(/\[Date "([^"?]+)"\]/)?.[1];
  const time = pgn.match(/\[UTCTime "([^"?]+)"\]/)?.[1] ?? pgn.match(/\[StartTime "([^"?]+)"\]/)?.[1] ?? "00:00:00";

  if (!date) return undefined;

  const parsed = Date.parse(`${date}T${time}Z`);
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : undefined;
}

function getChessComCompletedGameAt(game: ChessComBackRankGame): string | undefined {
  return typeof game.end_time === "number" ? new Date(game.end_time * 1000).toISOString() : undefined;
}

function findKingSquare(chess: Chess, color: BackRankSide): string | null {
  const board = chess.board();

  for (let rankIndex = 0; rankIndex < board.length; rankIndex += 1) {
    for (let fileIndex = 0; fileIndex < board[rankIndex].length; fileIndex += 1) {
      const piece = board[rankIndex][fileIndex];
      if (piece?.type === "k" && piece.color === (color === "white" ? "w" : "b")) {
        return `${"abcdefgh"[fileIndex]}${8 - rankIndex}`;
      }
    }
  }

  return null;
}

function isBackRankSquare(square: string, color: BackRankSide) {
  return square.endsWith(color === "white" ? "1" : "8");
}

function isRookOrQueenMateMove(piece?: string) {
  return piece === "r" || piece === "q";
}

function replayGame(game: BackRankGame): { chess: Chess; lastMove?: { san: string; lan: string; piece: string; color: string; to: string } } | null {
  const chess = new Chess();
  let lastMove: { san: string; lan: string; piece: string; color: string; to: string } | undefined;

  for (const token of game.moves) {
    try {
      const move = /^[a-h][1-8][a-h][1-8][qrbn]?$/i.test(token)
        ? chess.move({ from: token.slice(0, 2), to: token.slice(2, 4), promotion: token.slice(4, 5) || undefined })
        : chess.move(token);

      lastMove = move ? { san: move.san, lan: move.lan, piece: move.piece, color: move.color, to: move.to } : undefined;
    } catch {
      return null;
    }
  }

  return { chess, lastMove };
}

export function evaluateBackRankGoblin(game: BackRankGame): BackRankVerdict {
  const replay = replayGame(game);

  if (!replay) {
    return {
      status: "pending",
      gameId: game.id,
      summary: "Side Quest Chess could not parse the latest game moves for Back Rank Goblin.",
      evidence: ["The provider returned a game, but the move list could not be replayed safely."],
      startedGameAt: game.startedGameAt,
      completedGameAt: game.completedGameAt,
    };
  }

  const { chess, lastMove } = replay;
  const losingColor = game.winner === "white" || game.winner === "black" ? opposite(game.winner) : null;
  const losingKingSquare = losingColor ? findKingSquare(chess, losingColor) : null;
  const evidence = [
    `Result: ${game.winner === "unknown" ? "unknown" : game.winner === "draw" ? "draw" : `${colorName(game.winner)} won`}.`,
    losingKingSquare ? `${colorName(losingColor!)} king ended on ${losingKingSquare}.` : "Could not identify the losing king square.",
    lastMove ? `Final move was ${lastMove.san}.` : "No final move was available.",
  ];

  const passed = Boolean(
    game.winner === game.playerColor &&
      chess.isCheckmate() &&
      losingColor &&
      losingKingSquare &&
      isBackRankSquare(losingKingSquare, losingColor) &&
      lastMove &&
      lastMove.color === (game.playerColor === "white" ? "w" : "b") &&
      isRookOrQueenMateMove(lastMove.piece) &&
      isBackRankSquare(lastMove.to, losingColor),
  );

  if (passed) {
    return {
      status: "passed",
      gameId: game.id,
      summary: "Back Rank Goblin verified: you won by checkmating the enemy king on its back rank with a rook or queen finish.",
      evidence,
      startedGameAt: game.startedGameAt,
      completedGameAt: game.completedGameAt,
      finalPositionFen: chess.fen(),
      lastMoveUci: lastMove?.lan,
      lastMoveSan: lastMove?.san,
    };
  }

  return {
    status: "failed",
    gameId: game.id,
    summary: "Latest game did not satisfy Back Rank Goblin yet. Win with a rook or queen checkmate on the enemy king's back rank.",
    evidence: [
      ...evidence,
      chess.isCheckmate() ? "The game ended in checkmate." : "The game did not end in checkmate.",
      lastMove && isRookOrQueenMateMove(lastMove.piece) ? "The final move was made by a rook or queen." : "The final move was not a rook/queen mate move.",
    ],
    startedGameAt: game.startedGameAt,
    completedGameAt: game.completedGameAt,
    finalPositionFen: chess.fen(),
    lastMoveUci: lastMove?.lan,
    lastMoveSan: lastMove?.san,
  };
}

export function normalizeLichessBackRankGoblinGame(game: LichessBackRankGame, username: string): BackRankGame | null {
  const playerColor = getPlayerColor(game.players?.white?.user?.name, game.players?.black?.user?.name, username);

  if (!game.id || !playerColor || !game.moves || game.variant !== "standard") {
    return null;
  }

  return {
    id: game.id,
    playerColor,
    winner: game.winner ?? "unknown",
    moves: normalizeLichessMoveTokens(game.moves),
    source: "lichess",
    startedGameAt: typeof game.createdAt === "number" ? new Date(game.createdAt).toISOString() : undefined,
    completedGameAt: typeof game.lastMoveAt === "number" ? new Date(game.lastMoveAt).toISOString() : undefined,
  };
}

export async function checkLatestLichessBackRankGoblin(username: string): Promise<BackRankVerdict> {
  if (!username.trim()) {
    return {
      status: "pending",
      gameId: "lichess-username-missing",
      summary: "Add a Lichess username before Side Quest Chess can inspect Back Rank Goblin attempts.",
      evidence: ["No Lichess username is stored."],
    };
  }

  try {
    const response = await fetch(
      `https://lichess.org/api/games/user/${encodeURIComponent(username.trim())}?max=5&moves=true&perfType=bullet,blitz,rapid,classical&opening=false&clocks=false&evals=false`,
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
      .map((line) => JSON.parse(line) as LichessBackRankGame)
      .map((item) => normalizeLichessBackRankGoblinGame(item, username))
      .filter((item): item is BackRankGame => Boolean(item));

    if (!games.length) {
      return {
        status: "pending",
        gameId: "lichess-no-standard-games",
        summary: `No recent public standard Lichess games were found for ${username}.`,
        evidence: ["Lichess returned no standard game with replayable moves."],
      };
    }

    return evaluateBackRankGoblin(games[0]);
  } catch {
    return {
      status: "pending",
      gameId: "lichess-latest-error",
      summary: `Side Quest Chess could not inspect latest Lichess games for ${username}.`,
      evidence: ["The Lichess latest-game verifier threw while fetching or parsing games."],
    };
  }
}

export function normalizeChessComBackRankGoblinGame(game: ChessComBackRankGame, username: string): BackRankGame | null {
  const playerColor = getPlayerColor(game.white?.username, game.black?.username, username);

  if (!game.url || !playerColor || !game.pgn || game.rules !== "chess") {
    return null;
  }

  return {
    id: game.url,
    playerColor,
    winner: chessComResult(game),
    moves: extractSanMoveTokens(game.pgn),
    source: "chess.com",
    startedGameAt: getChessComStartedGameAt(game),
    completedGameAt: getChessComCompletedGameAt(game),
  };
}

async function fetchChessComJson<T>(url: string): Promise<T | null> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "cc-verifier/0.1 (+https://sidequestchess.com)",
    },
    cache: "no-store",
  });

  if (!response.ok) return null;
  return response.json() as Promise<T>;
}

export async function checkLatestChessComBackRankGoblin(username: string): Promise<BackRankVerdict> {
  if (!username.trim()) {
    return {
      status: "pending",
      gameId: "chesscom-username-missing",
      summary: "Add a Chess.com username before Side Quest Chess can inspect Back Rank Goblin attempts.",
      evidence: ["No Chess.com username is stored."],
    };
  }

  try {
    const encodedUsername = encodeURIComponent(username.trim().toLowerCase());
    const archiveIndex = await fetchChessComJson<{ archives?: string[] }>(`https://api.chess.com/pub/player/${encodedUsername}/games/archives`);
    const archiveUrls = archiveIndex?.archives?.slice(-2).reverse() ?? [];

    if (!archiveUrls.length) {
      return {
        status: "pending",
        gameId: "chesscom-no-archives",
        summary: `No public Chess.com game archives were found for ${username}.`,
        evidence: ["Chess.com returned no game archive URLs."],
      };
    }

    const games: BackRankGame[] = [];
    for (const archiveUrl of archiveUrls) {
      const archive = await fetchChessComJson<{ games?: ChessComBackRankGame[] }>(archiveUrl);
      games.push(...(archive?.games ?? []).map((item) => normalizeChessComBackRankGoblinGame(item, username)).filter((item): item is BackRankGame => Boolean(item)));
    }

    games.sort((a, b) => Date.parse(b.completedGameAt ?? "0") - Date.parse(a.completedGameAt ?? "0"));

    if (!games.length) {
      return {
        status: "pending",
        gameId: "chesscom-no-standard-games",
        summary: `No recent public standard Chess.com games were found for ${username}.`,
        evidence: ["Chess.com returned no standard game with replayable PGN."],
      };
    }

    return evaluateBackRankGoblin(games[0]);
  } catch {
    return {
      status: "pending",
      gameId: "chesscom-latest-error",
      summary: `Side Quest Chess could not inspect latest Chess.com games for ${username}.`,
      evidence: ["The Chess.com latest-game verifier threw while fetching or parsing games."],
    };
  }
}
