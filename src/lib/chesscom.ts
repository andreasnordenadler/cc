import type { BlunderGambitCaptureEvent, BlunderGambitGame, BlunderGambitPiece, BlunderGambitVerdict } from "./the-blunder-gambit";
import type { KnightmareFinalMove, KnightmareGame, KnightmareVerdict } from "./knightmare-mode";
import type { OneBishopGame, OneBishopVerdict } from "./one-bishop-to-rule-them-all";
import type { PawnStormGame, PawnStormMoveEvent } from "./pawn-storm-maniac";
import type { RooklessGame, RooklessLossEvent } from "./rookless-rampage";

export type ChessComVerificationVerdict = {
  status: "passed" | "failed" | "pending";
  summary: string;
  completedGameAt?: string;
};

type QueenChallengeSide = "white" | "black";

type QueenChallengeCaptureEvent = {
  ply: number;
  capturedPiece: "queen" | "rook" | "bishop" | "knight" | "pawn" | "king";
  capturedColor: QueenChallengeSide;
};

type QueenChallengeGame = {
  id: string;
  playerColor: QueenChallengeSide;
  winner: "white" | "black" | "draw" | "unknown";
  moveCount: number;
  variant?: "standard" | string;
  timeClass?: "bullet" | "blitz" | "rapid" | "classical" | "daily" | "unknown";
  captures: QueenChallengeCaptureEvent[];
};

type QueenChallengeVerdict = {
  status: "passed" | "failed" | "pending";
  gameId: string;
  summary: string;
  evidence: string[];
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

type ChessComEarlyKingWalkGame = {
  id: string;
  playerColor: "white" | "black";
  winner: "white" | "black" | "draw" | "unknown";
  moveCount: number;
  variant?: "standard" | string;
  timeClass?: "bullet" | "blitz" | "rapid" | "classical" | "daily" | "unknown";
  earlyKingWalkMove?: number;
  castledBeforeKingWalk: boolean;
};

type ChessComEarlyKingWalkVerdict = {
  status: "passed" | "failed" | "pending";
  gameId: string;
  summary: string;
  evidence: string[];
};

type ChessComPawnStormManiacVerdict = {
  status: "passed" | "failed" | "pending";
  gameId: string;
  summary: string;
  evidence: string[];
};

type ChessComRooklessRampageVerdict = {
  status: "passed" | "failed" | "pending";
  gameId: string;
  summary: string;
  evidence: string[];
};

type ChessComKnightmareModeVerdict = KnightmareVerdict;
type ChessComOneBishopVerdict = OneBishopVerdict;
type ChessComBlunderGambitVerdict = BlunderGambitVerdict;

type ChessComPiece = QueenChallengeCaptureEvent["capturedPiece"];

type ChessComBoardPiece = {
  color: QueenChallengeSide;
  piece: ChessComPiece;
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

const INITIAL_CHESSCOM_BOARD: Record<string, ChessComBoardPiece> = {
  a1: { color: "white", piece: "rook" }, b1: { color: "white", piece: "knight" }, c1: { color: "white", piece: "bishop" }, d1: { color: "white", piece: "queen" }, e1: { color: "white", piece: "king" }, f1: { color: "white", piece: "bishop" }, g1: { color: "white", piece: "knight" }, h1: { color: "white", piece: "rook" },
  a2: { color: "white", piece: "pawn" }, b2: { color: "white", piece: "pawn" }, c2: { color: "white", piece: "pawn" }, d2: { color: "white", piece: "pawn" }, e2: { color: "white", piece: "pawn" }, f2: { color: "white", piece: "pawn" }, g2: { color: "white", piece: "pawn" }, h2: { color: "white", piece: "pawn" },
  a7: { color: "black", piece: "pawn" }, b7: { color: "black", piece: "pawn" }, c7: { color: "black", piece: "pawn" }, d7: { color: "black", piece: "pawn" }, e7: { color: "black", piece: "pawn" }, f7: { color: "black", piece: "pawn" }, g7: { color: "black", piece: "pawn" }, h7: { color: "black", piece: "pawn" },
  a8: { color: "black", piece: "rook" }, b8: { color: "black", piece: "knight" }, c8: { color: "black", piece: "bishop" }, d8: { color: "black", piece: "queen" }, e8: { color: "black", piece: "king" }, f8: { color: "black", piece: "bishop" }, g8: { color: "black", piece: "knight" }, h8: { color: "black", piece: "rook" },
};

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

function getChessComCompletedGameAt(game: ChessComGame): string | undefined {
  return typeof game.end_time === "number" ? new Date(game.end_time * 1000).toISOString() : undefined;
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

function cloneChessComBoard() {
  return Object.fromEntries(Object.entries(INITIAL_CHESSCOM_BOARD).map(([square, piece]) => [square, { ...piece }]));
}

function chessComPromotionPieceFromSan(token: string): ChessComPiece | null {
  const match = token.match(/=([QRBN])/);
  if (!match) return null;
  if (match[1] === "Q") return "queen";
  if (match[1] === "R") return "rook";
  if (match[1] === "B") return "bishop";
  return "knight";
}

function chessComSourceHintFromSan(token: string, piece: ChessComPiece): string {
  const normalized = token
    .replace(/[+#?!]+$/g, "")
    .replace(/^\.{1,3}/, "")
    .replace(/=.*$/, "");
  const target = chessComTargetSquareFromSan(normalized);
  if (!target) return "";
  const prefix = normalized.slice(piece === "pawn" ? 0 : 1, normalized.lastIndexOf(target)).replace("x", "");
  return prefix.replace(/[^a-h1-8]/g, "");
}

function chessComCanPieceReach(piece: ChessComPiece, from: string, to: string, color: QueenChallengeSide, board: Record<string, ChessComBoardPiece>) {
  const fileDelta = to.charCodeAt(0) - from.charCodeAt(0);
  const rankDelta = Number(to[1]) - Number(from[1]);
  const absFile = Math.abs(fileDelta);
  const absRank = Math.abs(rankDelta);

  if (piece === "knight") return (absFile === 1 && absRank === 2) || (absFile === 2 && absRank === 1);
  if (piece === "king") return absFile <= 1 && absRank <= 1;

  if (piece === "pawn") {
    const direction = color === "white" ? 1 : -1;
    const startRank = color === "white" ? "2" : "7";
    const targetOccupied = Boolean(board[to]);
    if (absFile === 1 && rankDelta === direction) return true;
    if (fileDelta === 0 && rankDelta === direction && !targetOccupied) return true;
    if (fileDelta === 0 && from[1] === startRank && rankDelta === direction * 2 && !targetOccupied) return true;
    return false;
  }

  const diagonal = absFile === absRank;
  const straight = fileDelta === 0 || rankDelta === 0;
  if (piece === "bishop" && !diagonal) return false;
  if (piece === "rook" && !straight) return false;
  if (piece === "queen" && !diagonal && !straight) return false;

  const fileStep = Math.sign(fileDelta);
  const rankStep = Math.sign(rankDelta);
  let file = from.charCodeAt(0) + fileStep;
  let rank = Number(from[1]) + rankStep;
  while (`${String.fromCharCode(file)}${rank}` !== to) {
    if (board[`${String.fromCharCode(file)}${rank}`]) return false;
    file += fileStep;
    rank += rankStep;
  }
  return true;
}

function applyChessComSanMove(
  board: Record<string, ChessComBoardPiece>,
  token: string,
  ply: number,
): QueenChallengeCaptureEvent | null {
  const color: QueenChallengeSide = ply % 2 === 1 ? "white" : "black";
  const normalized = token.replace(/[+#?!]+$/g, "").replace(/^\.{1,3}/, "").replace(/0/g, "O");

  if (normalized === "O-O" || normalized === "O-O-O") {
    const rank = color === "white" ? "1" : "8";
    const kingFrom = `e${rank}`;
    const kingTo = normalized === "O-O" ? `g${rank}` : `c${rank}`;
    const rookFrom = normalized === "O-O" ? `h${rank}` : `a${rank}`;
    const rookTo = normalized === "O-O" ? `f${rank}` : `d${rank}`;
    board[kingTo] = board[kingFrom];
    board[rookTo] = board[rookFrom];
    delete board[kingFrom];
    delete board[rookFrom];
    return null;
  }

  const to = chessComTargetSquareFromSan(normalized);
  if (!to) return null;

  const movingPiece = chessComPieceFromSan(normalized) as ChessComPiece;
  const sourceHint = chessComSourceHintFromSan(normalized, movingPiece);
  const candidates = Object.entries(board)
    .filter(([, piece]) => piece && piece.color === color && piece.piece === movingPiece)
    .filter(([square]) => !sourceHint || sourceHint.split("").every((hint) => square.includes(hint)))
    .filter(([square]) => chessComCanPieceReach(movingPiece, square, to, color, board));

  const from = candidates[0]?.[0];
  if (!from) return null;

  const captured = board[to];
  let capture: QueenChallengeCaptureEvent | null = captured
    ? { ply, capturedPiece: captured.piece, capturedColor: captured.color }
    : null;

  if (!captured && movingPiece === "pawn" && from[0] !== to[0]) {
    const capturedPawnSquare = `${to[0]}${from[1]}`;
    const enPassantCapture = board[capturedPawnSquare];
    if (enPassantCapture) {
      capture = { ply, capturedPiece: enPassantCapture.piece, capturedColor: enPassantCapture.color };
      delete board[capturedPawnSquare];
    }
  }

  delete board[from];
  board[to] = { color, piece: chessComPromotionPieceFromSan(normalized) ?? movingPiece };
  return capture;
}


function applyChessComSanPawnStormMove(
  board: Record<string, ChessComBoardPiece>,
  token: string,
  ply: number,
): PawnStormMoveEvent | null {
  const color: QueenChallengeSide = ply % 2 === 1 ? "white" : "black";
  const normalized = token.replace(/[+#?!]+$/g, "").replace(/^\.{1,3}/, "").replace(/0/g, "O");

  if (normalized === "O-O" || normalized === "O-O-O") {
    const rank = color === "white" ? "1" : "8";
    const kingFrom = `e${rank}`;
    const kingTo = normalized === "O-O" ? `g${rank}` : `c${rank}`;
    const rookFrom = normalized === "O-O" ? `h${rank}` : `a${rank}`;
    const rookTo = normalized === "O-O" ? `f${rank}` : `d${rank}`;
    board[kingTo] = board[kingFrom];
    board[rookTo] = board[rookFrom];
    delete board[kingFrom];
    delete board[rookFrom];
    return null;
  }

  const to = chessComTargetSquareFromSan(normalized);
  if (!to) return null;

  const movingPiece = chessComPieceFromSan(normalized) as ChessComPiece;
  const sourceHint = chessComSourceHintFromSan(normalized, movingPiece);
  const candidates = Object.entries(board)
    .filter(([, piece]) => piece && piece.color === color && piece.piece === movingPiece)
    .filter(([square]) => !sourceHint || sourceHint.split("").every((hint) => square.includes(hint)))
    .filter(([square]) => chessComCanPieceReach(movingPiece, square, to, color, board));

  const from = candidates[0]?.[0];
  if (!from) return null;

  const pawnMove: PawnStormMoveEvent | null = movingPiece === "pawn"
    ? { ply, color, from, to, pawnFile: from[0] }
    : null;

  if (movingPiece === "pawn" && from[0] !== to[0] && !board[to]) {
    delete board[`${to[0]}${from[1]}`];
  }

  delete board[from];
  board[to] = { color, piece: chessComPromotionPieceFromSan(normalized) ?? movingPiece };
  return pawnMove;
}

function chessComPawnStormMovesFromSan(sanMoves: string[]): PawnStormMoveEvent[] {
  const board = cloneChessComBoard();
  return sanMoves
    .map((token, index) => applyChessComSanPawnStormMove(board, token, index + 1))
    .filter((event): event is PawnStormMoveEvent => Boolean(event));
}


type ChessComRooklessBoardPiece = ChessComBoardPiece & { origin?: RooklessLossEvent["origin"] };

function cloneChessComRooklessBoard(): Record<string, ChessComRooklessBoardPiece> {
  const board = Object.fromEntries(
    Object.entries(INITIAL_CHESSCOM_BOARD).map(([square, piece]) => [square, { ...piece }]),
  ) as Record<string, ChessComRooklessBoardPiece>;

  board.a1.origin = "a1";
  board.h1.origin = "h1";
  board.a8.origin = "a8";
  board.h8.origin = "h8";

  return board;
}

function recordChessComRooklessCapture(
  captured: ChessComRooklessBoardPiece | undefined,
  capturedAt: string,
  mover: ChessComRooklessBoardPiece,
  ply: number,
): RooklessLossEvent | null {
  if (captured?.piece !== "rook" || !captured.origin) {
    return null;
  }

  return {
    ply,
    color: captured.color,
    origin: captured.origin,
    square: capturedAt,
    capturedBy: mover.color,
  };
}

function applyChessComSanRooklessMove(
  board: Record<string, ChessComRooklessBoardPiece>,
  token: string,
  ply: number,
): RooklessLossEvent | null {
  const color: QueenChallengeSide = ply % 2 === 1 ? "white" : "black";
  const normalized = token.replace(/[+#?!]+$/g, "").replace(/^\.{1,3}/, "").replace(/0/g, "O");

  if (normalized === "O-O" || normalized === "O-O-O") {
    const rank = color === "white" ? "1" : "8";
    const kingFrom = `e${rank}`;
    const kingTo = normalized === "O-O" ? `g${rank}` : `c${rank}`;
    const rookFrom = normalized === "O-O" ? `h${rank}` : `a${rank}`;
    const rookTo = normalized === "O-O" ? `f${rank}` : `d${rank}`;
    board[kingTo] = board[kingFrom];
    board[rookTo] = board[rookFrom];
    delete board[kingFrom];
    delete board[rookFrom];
    return null;
  }

  const to = chessComTargetSquareFromSan(normalized);
  if (!to) return null;

  const movingPiece = chessComPieceFromSan(normalized) as ChessComPiece;
  const sourceHint = chessComSourceHintFromSan(normalized, movingPiece);
  const candidates = Object.entries(board)
    .filter(([, piece]) => piece && piece.color === color && piece.piece === movingPiece)
    .filter(([square]) => !sourceHint || sourceHint.split("").every((hint) => square.includes(hint)))
    .filter(([square]) => chessComCanPieceReach(movingPiece, square, to, color, board));

  const from = candidates[0]?.[0];
  if (!from) return null;

  const moving = board[from];
  let loss = recordChessComRooklessCapture(board[to], to, moving, ply);

  if (movingPiece === "pawn" && from[0] !== to[0] && !board[to]) {
    const capturedPawnSquare = `${to[0]}${from[1]}`;
    loss = loss ?? recordChessComRooklessCapture(board[capturedPawnSquare], capturedPawnSquare, moving, ply);
    delete board[capturedPawnSquare];
  }

  delete board[from];
  board[to] = { ...moving, piece: chessComPromotionPieceFromSan(normalized) ?? movingPiece };
  return loss;
}

function chessComRooklessLossesFromSan(sanMoves: string[]): RooklessLossEvent[] {
  const board = cloneChessComRooklessBoard();
  return sanMoves
    .map((token, index) => applyChessComSanRooklessMove(board, token, index + 1))
    .filter((event): event is RooklessLossEvent => Boolean(event));
}

function applyChessComSanFinalMove(
  board: Record<string, ChessComBoardPiece>,
  token: string,
  ply: number,
): KnightmareFinalMove | null {
  const color: QueenChallengeSide = ply % 2 === 1 ? "white" : "black";
  const normalized = token.replace(/[+#?!]+$/g, "").replace(/^\.{1,3}/, "").replace(/0/g, "O");

  if (normalized === "O-O" || normalized === "O-O-O") {
    const rank = color === "white" ? "1" : "8";
    const kingFrom = `e${rank}`;
    const kingTo = normalized === "O-O" ? `g${rank}` : `c${rank}`;
    const rookFrom = normalized === "O-O" ? `h${rank}` : `a${rank}`;
    const rookTo = normalized === "O-O" ? `f${rank}` : `d${rank}`;
    board[kingTo] = board[kingFrom];
    board[rookTo] = board[rookFrom];
    delete board[kingFrom];
    delete board[rookFrom];
    return { ply, color, from: kingFrom, to: kingTo, piece: "king" };
  }

  const to = chessComTargetSquareFromSan(normalized);
  if (!to) return null;

  const movingPiece = chessComPieceFromSan(normalized) as ChessComPiece;
  const sourceHint = chessComSourceHintFromSan(normalized, movingPiece);
  const candidates = Object.entries(board)
    .filter(([, piece]) => piece && piece.color === color && piece.piece === movingPiece)
    .filter(([square]) => !sourceHint || sourceHint.split("").every((hint) => square.includes(hint)))
    .filter(([square]) => chessComCanPieceReach(movingPiece, square, to, color, board));

  const from = candidates[0]?.[0];
  if (!from) return null;

  if (movingPiece === "pawn" && from[0] !== to[0] && !board[to]) {
    delete board[`${to[0]}${from[1]}`];
  }

  delete board[from];
  board[to] = { color, piece: chessComPromotionPieceFromSan(normalized) ?? movingPiece };

  return { ply, color, from, to, piece: movingPiece };
}

function chessComFinalMoveFromSan(sanMoves: string[]): KnightmareFinalMove | undefined {
  const board = cloneChessComBoard();
  let finalMove: KnightmareFinalMove | null = null;

  sanMoves.forEach((token, index) => {
    finalMove = applyChessComSanFinalMove(board, token, index + 1) ?? finalMove;
  });

  return finalMove ?? undefined;
}

function chessComFinalMinorPiecesFromSan(sanMoves: string[], playerColor: QueenChallengeSide): OneBishopGame["finalMinorPieces"] {
  const board = cloneChessComBoard();

  sanMoves.forEach((token, index) => {
    applyChessComSanMove(board, token, index + 1);
  });

  return Object.entries(board)
    .filter(([, piece]) => piece.color === playerColor && (piece.piece === "bishop" || piece.piece === "knight"))
    .map(([square, piece]) => ({ kind: piece.piece as "bishop" | "knight", square }))
    .sort((a, b) => a.square.localeCompare(b.square));
}

function evaluateChessComOneBishopToRuleThemAll(game: OneBishopGame): ChessComOneBishopVerdict {
  if (game.variant && game.variant !== "standard") {
    return { status: "failed", gameId: game.id, summary: "Variants are fun, but One Bishop to Rule Them All only counts standard chess games.", evidence: [`Variant was ${game.variant}.`] };
  }

  if (!["bullet", "blitz", "rapid", "unknown"].includes(game.timeClass ?? "unknown")) {
    return { status: "failed", gameId: game.id, summary: "This game was outside the v1 bullet/blitz/rapid eligibility window.", evidence: [`Time class was ${game.timeClass}.`] };
  }

  if (game.moveCount < 15) {
    return { status: "failed", gameId: game.id, summary: "The game ended before the minimum 15-move one-bishop proof threshold.", evidence: [`Game length was ${game.moveCount} moves.`] };
  }

  if (game.winner !== game.playerColor) {
    return { status: "failed", gameId: game.id, summary: "One Bishop to Rule Them All only counts if the lonely diagonal manager also wins.", evidence: [`Winner was ${chessComColorName(game.winner as QueenChallengeSide)}.`] };
  }

  const bishops = game.finalMinorPieces.filter((piece) => piece.kind === "bishop");
  const knights = game.finalMinorPieces.filter((piece) => piece.kind === "knight");

  if (bishops.length !== 1 || knights.length !== 0 || game.finalMinorPieces.length !== 1) {
    return {
      status: "failed",
      gameId: game.id,
      summary: `Final minor-piece department had ${bishops.length} bishop(s) and ${knights.length} knight(s). That is not lonely enough.`,
      evidence: [`${chessComColorName(game.playerColor)} final minor pieces: ${game.finalMinorPieces.map((piece) => `${piece.kind} on ${piece.square}`).join(", ") || "none"}.`],
    };
  }

  return {
    status: "passed",
    gameId: game.id,
    summary: "Exactly one bishop was the entire minor-piece department at victory. One Bishop to Rule Them All confirmed.",
    evidence: [
      `${chessComColorName(game.playerColor)} won after ${game.moveCount} moves.`,
      `The only final minor piece was a bishop on ${bishops[0].square}.`,
    ],
  };
}

function getChessComEndStatus(game: ChessComGame): KnightmareGame["status"] {
  const whiteResult = game.white?.result?.toLowerCase();
  const blackResult = game.black?.result?.toLowerCase();

  if (whiteResult === "checkmated" || blackResult === "checkmated") return "mate";
  if (whiteResult === "resigned" || blackResult === "resigned") return "resign";
  if (whiteResult === "timeout" || blackResult === "timeout") return "outoftime";
  if (whiteResult === "stalemate" || blackResult === "stalemate") return "stalemate";
  if (whiteResult && blackResult && DRAW_RESULTS.has(whiteResult) && DRAW_RESULTS.has(blackResult)) return "draw";
  return "unknown";
}



function chessComBlunderGambitColorName(color: BlunderGambitGame["winner"]) {
  if (color === "white") return "White";
  if (color === "black") return "Black";
  return color;
}

function chessComBlunderGambitMoveNumberFromPly(ply: number): number {
  return Math.ceil(ply / 2);
}

function evaluateChessComBlunderGambit(game: BlunderGambitGame): ChessComBlunderGambitVerdict {
  if (game.variant && game.variant !== "standard") {
    return { status: "failed", gameId: game.id, summary: "Variants are fun, but The Blunder Gambit only counts standard chess games.", evidence: [`Variant was ${game.variant}.`] };
  }

  if (!["bullet", "blitz", "rapid", "unknown"].includes(game.timeClass ?? "unknown")) {
    return { status: "failed", gameId: game.id, summary: "This game was outside the v1 bullet/blitz/rapid eligibility window.", evidence: [`Time class was ${game.timeClass}.`] };
  }

  if (game.moveCount < 15) {
    return { status: "failed", gameId: game.id, summary: "The game ended before the minimum 15-move PR-recovery threshold.", evidence: [`Game length was ${game.moveCount} moves.`] };
  }

  if (game.winner !== game.playerColor) {
    return { status: "failed", gameId: game.id, summary: "The Blunder Gambit only counts if the player who hung material still wins.", evidence: [`Winner was ${game.winner === "draw" ? "draw" : chessComBlunderGambitColorName(game.winner)}.`] };
  }

  const pieceValues: Record<BlunderGambitPiece, number> = { king: 99, queen: 9, rook: 5, bishop: 3, knight: 3, pawn: 1 };
  const blunderPieces = new Set<BlunderGambitPiece>(["knight", "bishop", "rook"]);
  const earlyPlayerLosses = game.captures.filter(
    (capture) =>
      capture.color !== game.playerColor &&
      capture.capturedColor === game.playerColor &&
      blunderPieces.has(capture.capturedPiece) &&
      chessComBlunderGambitMoveNumberFromPly(capture.ply) <= 10,
  );

  const qualifyingLoss = earlyPlayerLosses.find((loss) => {
    const immediateReply = game.captures.find(
      (capture) => capture.color === game.playerColor && capture.ply === loss.ply + 1,
    );

    return !immediateReply || pieceValues[immediateReply.capturedPiece] < pieceValues[loss.capturedPiece];
  });

  if (!qualifyingLoss) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "No early unbalanced piece hang was found. Suspiciously competent chess does not count.",
      evidence: earlyPlayerLosses.length
        ? ["Early piece losses were immediately balanced by equal-or-better material on the next move."]
        : ["No player knight, bishop, or rook was captured by move 10."],
    };
  }

  return {
    status: "passed",
    gameId: game.id,
    summary: "Early material hang confirmed, immediate compensation denied, and the blunder artist still won. Branding saved the opening.",
    evidence: [
      `${chessComBlunderGambitColorName(game.playerColor)} lost a ${qualifyingLoss.capturedPiece} on move ${chessComBlunderGambitMoveNumberFromPly(qualifyingLoss.ply)}.`,
      "No equal-or-better material was won back on the immediate reply.",
      `${chessComBlunderGambitColorName(game.playerColor)} still won after ${game.moveCount} moves.`,
    ],
  };
}

function applyChessComSanBlunderGambitMove(
  board: Record<string, ChessComBoardPiece>,
  token: string,
  ply: number,
): BlunderGambitCaptureEvent | null {
  const color: QueenChallengeSide = ply % 2 === 1 ? "white" : "black";
  const normalized = token.replace(/[+#?!]+$/g, "").replace(/^\.{1,3}/, "").replace(/0/g, "O");

  if (normalized === "O-O" || normalized === "O-O-O") {
    const rank = color === "white" ? "1" : "8";
    const kingFrom = `e${rank}`;
    const kingTo = normalized === "O-O" ? `g${rank}` : `c${rank}`;
    const rookFrom = normalized === "O-O" ? `h${rank}` : `a${rank}`;
    const rookTo = normalized === "O-O" ? `f${rank}` : `d${rank}`;
    board[kingTo] = board[kingFrom];
    board[rookTo] = board[rookFrom];
    delete board[kingFrom];
    delete board[rookFrom];
    return null;
  }

  const to = chessComTargetSquareFromSan(normalized);
  if (!to) return null;

  const movingPiece = chessComPieceFromSan(normalized) as ChessComPiece;
  const sourceHint = chessComSourceHintFromSan(normalized, movingPiece);
  const candidates = Object.entries(board)
    .filter(([, piece]) => piece && piece.color === color && piece.piece === movingPiece)
    .filter(([square]) => !sourceHint || sourceHint.split("").every((hint) => square.includes(hint)))
    .filter(([square]) => chessComCanPieceReach(movingPiece, square, to, color, board));

  const from = candidates[0]?.[0];
  if (!from) return null;

  let capturedSquare = to;
  let captured = board[to];

  if (movingPiece === "pawn" && from[0] !== to[0] && !captured) {
    capturedSquare = `${to[0]}${from[1]}`;
    captured = board[capturedSquare];
  }

  const captureEvent = captured
    ? {
        ply,
        color,
        from,
        to,
        capturedColor: captured.color,
        capturedPiece: captured.piece as BlunderGambitPiece,
      }
    : null;

  if (captured) {
    delete board[capturedSquare];
  }

  delete board[from];
  board[to] = { color, piece: chessComPromotionPieceFromSan(normalized) ?? movingPiece };

  return captureEvent;
}

function chessComBlunderGambitCapturesFromSan(sanMoves: string[]): BlunderGambitCaptureEvent[] {
  const board = cloneChessComBoard();
  return sanMoves
    .map((token, index) => applyChessComSanBlunderGambitMove(board, token, index + 1))
    .filter((event): event is BlunderGambitCaptureEvent => Boolean(event));
}

export function normalizeChessComBlunderGambitGame(game: ChessComGame, username: string): BlunderGambitGame | null {
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
    captures: chessComBlunderGambitCapturesFromSan(sanMoves),
  };
}

export async function checkLatestChessComBlunderGambit(username: string): Promise<ChessComBlunderGambitVerdict> {
  if (!username.trim()) {
    return {
      status: "pending",
      gameId: "chesscom-username-missing",
      summary: "Add a Chess.com username before Side Quest Chess can inspect latest Blunder Gambit attempts.",
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
        .map((game) => normalizeChessComBlunderGambitGame(game, username))
        .filter((game): game is BlunderGambitGame => Boolean(game));

      if (normalizedGames.length) {
        return evaluateChessComBlunderGambit(normalizedGames[0]);
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

function chessComQueenChallengeCapturesFromSan(sanMoves: string[]): QueenChallengeCaptureEvent[] {
  const board = cloneChessComBoard();
  return sanMoves
    .map((token, index) => applyChessComSanMove(board, token, index + 1))
    .filter((capture): capture is QueenChallengeCaptureEvent => Boolean(capture));
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

function chessComEarlyKingWalkFromSan(sanMoves: string[], playerColor: "white" | "black") {
  let playerMoveNumber = 0;
  let earlyKingWalkMove: number | undefined;
  let castledBeforeKingWalk = false;

  sanMoves.forEach((token, index) => {
    const isPlayerMove = playerColor === "white" ? index % 2 === 0 : index % 2 === 1;

    if (!isPlayerMove) {
      return;
    }

    playerMoveNumber += 1;
    const normalized = token.replace(/[+#?!]+$/g, "").replace(/^\.{1,3}/, "").replace(/0/g, "O");

    if ((normalized === "O-O" || normalized === "O-O-O") && earlyKingWalkMove === undefined) {
      castledBeforeKingWalk = true;
    }

    if (normalized.startsWith("K") && normalized !== "O-O" && normalized !== "O-O-O" && earlyKingWalkMove === undefined) {
      earlyKingWalkMove = playerMoveNumber;
    }
  });

  return { earlyKingWalkMove, castledBeforeKingWalk };
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

function chessComOpponentOf(color: QueenChallengeSide): QueenChallengeSide {
  return color === "white" ? "black" : "white";
}

function chessComMoveNumberFromPly(ply: number): number {
  return Math.ceil(ply / 2);
}

function evaluateChessComQueenNeverHeardOfHer(game: QueenChallengeGame): QueenChallengeVerdict {
  const playerColor = game.playerColor;
  const opponentColor = chessComOpponentOf(playerColor);
  const playerQueenLoss = game.captures.find(
    (capture) => capture.capturedPiece === "queen" && capture.capturedColor === playerColor,
  );
  const opponentQueenLossBeforePlayerLoss = playerQueenLoss
    ? game.captures.find(
        (capture) =>
          capture.capturedPiece === "queen" &&
          capture.capturedColor === opponentColor &&
          capture.ply <= playerQueenLoss.ply,
      )
    : undefined;
  const evidence: string[] = [];

  if (game.variant && game.variant !== "standard") {
    return { status: "failed", gameId: game.id, summary: "Variants are fun, but this side quest only counts standard chess games.", evidence: [`Variant was ${game.variant}.`] };
  }

  if (!["bullet", "blitz", "rapid", "unknown"].includes(game.timeClass ?? "unknown")) {
    return { status: "failed", gameId: game.id, summary: "This game was outside the v1 bullet/blitz/rapid eligibility window.", evidence: [`Time class was ${game.timeClass}.`] };
  }

  if (game.moveCount < 10) {
    return { status: "failed", gameId: game.id, summary: "The game ended before the minimum 10-move proof threshold.", evidence: [`Game length was ${game.moveCount} moves.`] };
  }

  if (game.winner !== playerColor) {
    return { status: "failed", gameId: game.id, summary: "The queenless arc only counts if the player still wins afterwards.", evidence: [`Winner was ${game.winner === "draw" ? "draw" : chessComColorName(game.winner as QueenChallengeSide)}.`] };
  }

  if (!playerQueenLoss) {
    return { status: "failed", gameId: game.id, summary: "No player queen loss was detected, which is annoyingly responsible chess.", evidence: [`${chessComColorName(playerColor)} queen stayed on the board in the normalized capture feed.`] };
  }

  const queenLossMove = chessComMoveNumberFromPly(playerQueenLoss.ply);
  evidence.push(`${chessComColorName(playerColor)} queen was captured on move ${queenLossMove}.`);

  if (queenLossMove >= 15) {
    return { status: "failed", gameId: game.id, summary: "The queen went missing, but too late for this particular bad idea.", evidence: [...evidence, "Queen must be lost before move 15."] };
  }

  if (opponentQueenLossBeforePlayerLoss) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "Both queens were already off, so the opponent did not still have theirs at the proof moment.",
      evidence: [...evidence, `${chessComColorName(opponentColor)} queen was also gone by move ${chessComMoveNumberFromPly(opponentQueenLossBeforePlayerLoss.ply)}.`],
    };
  }

  evidence.push(`${chessComColorName(opponentColor)} queen was still present when the queenless run began.`);
  evidence.push(`${chessComColorName(playerColor)} won after ${game.moveCount} moves.`);

  return { status: "passed", gameId: game.id, summary: "Queen lost before move 15, opponent queen still alive, player still won. Certified queenless nonsense.", evidence };
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

export function normalizeChessComQueenNeverHeardOfHerGame(game: ChessComGame, username: string): QueenChallengeGame | null {
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
    captures: chessComQueenChallengeCapturesFromSan(sanMoves),
  };
}

export async function checkLatestChessComQueenNeverHeardOfHer(username: string): Promise<QueenChallengeVerdict> {
  if (!username.trim()) {
    return {
      status: "pending",
      gameId: "chesscom-username-missing",
      summary: "Add a Chess.com username before Side Quest Chess can inspect latest queenless attempts.",
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
        .map((game) => normalizeChessComQueenNeverHeardOfHerGame(game, username))
        .filter((game): game is QueenChallengeGame => Boolean(game));

      if (normalizedGames.length) {
        return evaluateChessComQueenNeverHeardOfHer(normalizedGames[0]);
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

function evaluateChessComEarlyKingWalk(game: ChessComEarlyKingWalkGame): ChessComEarlyKingWalkVerdict {
  if (game.variant && game.variant !== "standard") {
    return {
      status: "failed",
      gameId: game.id,
      summary: "Variants are fun, but Early King Walk only counts standard chess games.",
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
      summary: "Early King Walk only counts if the walking-king player wins.",
      evidence: [`Winner was ${game.winner === "draw" ? "draw" : chessComColorName(game.winner as "white" | "black")}.`],
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
    summary: "Early king walk confirmed: the Chess.com PGN shows a non-castling king move before move 12, and the player won.",
    evidence: [
      `${chessComColorName(game.playerColor)} moved the king on player move ${game.earlyKingWalkMove}.`,
      `${chessComColorName(game.playerColor)} won after ${game.moveCount} moves.`,
    ],
  };
}

export function normalizeChessComEarlyKingWalkGame(game: ChessComGame, username: string): ChessComEarlyKingWalkGame | null {
  const playerColor = getPlayerSideForUsername(game, username);

  if (!game.url || !playerColor || !game.pgn) {
    return null;
  }

  const sanMoves = extractSanMoveTokens(game.pgn);
  const kingWalk = chessComEarlyKingWalkFromSan(sanMoves, playerColor);

  return {
    id: normalizeChessComGameUrl(game.url),
    playerColor,
    winner: getWinningSide(game),
    moveCount: Math.ceil(sanMoves.length / 2),
    variant: game.rules === "chess" || !game.rules ? "standard" : game.rules,
    timeClass: normalizeChessComTimeClass(game.time_class),
    ...kingWalk,
  };
}

export async function checkLatestChessComEarlyKingWalk(username: string): Promise<ChessComEarlyKingWalkVerdict> {
  if (!username.trim()) {
    return {
      status: "pending",
      gameId: "chesscom-username-missing",
      summary: "Add a Chess.com username before Side Quest Chess can inspect latest royal strolls.",
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
        .map((game) => normalizeChessComEarlyKingWalkGame(game, username))
        .filter((game): game is ChessComEarlyKingWalkGame => Boolean(game));

      if (normalizedGames.length) {
        return evaluateChessComEarlyKingWalk(normalizedGames[0]);
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





function chessComRooklessColorName(color: RooklessGame["winner"]) {
  if (color === "white") return "White";
  if (color === "black") return "Black";
  return color;
}

function evaluateChessComRooklessRampage(game: RooklessGame): ChessComRooklessRampageVerdict {
  if (game.variant && game.variant !== "standard") {
    return { status: "failed", gameId: game.id, summary: "Variants are fun, but Rookless Rampage only counts standard chess games.", evidence: [`Variant was ${game.variant}.`] };
  }

  if (!["bullet", "blitz", "rapid", "unknown"].includes(game.timeClass ?? "unknown")) {
    return { status: "failed", gameId: game.id, summary: "This game was outside the v1 bullet/blitz/rapid eligibility window.", evidence: [`Time class was ${game.timeClass}.`] };
  }

  if (game.moveCount < 20) {
    return { status: "failed", gameId: game.id, summary: "The game ended before the minimum 20-move demolition-proof threshold.", evidence: [`Game length was ${game.moveCount} moves.`] };
  }

  if (game.winner !== game.playerColor) {
    return { status: "failed", gameId: game.id, summary: "Rookless Rampage only counts if the player loses both towers and still wins.", evidence: [`Winner was ${chessComRooklessColorName(game.winner)}.`] };
  }

  const targetOrigins = game.playerColor === "white" ? ["a1", "h1"] : ["a8", "h8"];
  const earlyLosses = game.rookLosses.filter(
    (loss) => loss.color === game.playerColor && targetOrigins.includes(loss.origin) && chessComMoveNumberFromPly(loss.ply) <= 20,
  );
  const lostOrigins = Array.from(new Set(earlyLosses.map((loss) => loss.origin))).sort();

  if (lostOrigins.length < 2) {
    return {
      status: "failed",
      gameId: game.id,
      summary: `Only ${lostOrigins.length}/2 original rooks disappeared before move 20. The towers are not demolished enough yet.`,
      evidence: [
        `${chessComRooklessColorName(game.playerColor)} lost ${lostOrigins.length}/2 original rooks before move 20.`,
        lostOrigins.length ? `Lost rook origins: ${lostOrigins.join(", ")}.` : "No early original-rook losses were detected.",
      ],
    };
  }

  return {
    status: "passed",
    gameId: game.id,
    summary: "Both rooks disappeared early and the wreckage still turned into a win. Rookless Rampage confirmed.",
    evidence: [
      `${chessComRooklessColorName(game.playerColor)} lost both original rooks before move 20.`,
      `Lost rook origins: ${lostOrigins.join(", ")}.`,
      `${chessComRooklessColorName(game.playerColor)} still won after ${game.moveCount} moves.`,
    ],
  };
}

export function normalizeChessComRooklessRampageGame(game: ChessComGame, username: string): RooklessGame | null {
  const playerColor = getPlayerSideForUsername(game, username);
  const sanMoves = game.pgn ? extractSanMoveTokens(game.pgn) : [];

  if (!playerColor || !sanMoves.length) {
    return null;
  }

  return {
    id: game.url ?? game.uuid ?? "chesscom-latest-game",
    playerColor,
    winner: getWinningSide(game),
    moveCount: Math.ceil(sanMoves.length / 2),
    variant: game.rules === "chess" || !game.rules ? "standard" : game.rules,
    timeClass: normalizeChessComTimeClass(game.time_class),
    rookLosses: chessComRooklessLossesFromSan(sanMoves),
  };
}

export function normalizeChessComOneBishopToRuleThemAllGame(game: ChessComGame, username: string): OneBishopGame | null {
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
    finalMinorPieces: chessComFinalMinorPiecesFromSan(sanMoves, playerColor),
  };
}

export async function checkLatestChessComOneBishopToRuleThemAll(username: string): Promise<ChessComOneBishopVerdict> {
  if (!username.trim()) {
    return {
      status: "pending",
      gameId: "chesscom-username-missing",
      summary: "Add a Chess.com username before Side Quest Chess can inspect latest one-bishop attempts.",
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
        .map((game) => normalizeChessComOneBishopToRuleThemAllGame(game, username))
        .filter((game): game is OneBishopGame => Boolean(game));

      if (normalizedGames.length) {
        return evaluateChessComOneBishopToRuleThemAll(normalizedGames[0]);
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

export async function checkLatestChessComRooklessRampage(username: string): Promise<ChessComRooklessRampageVerdict> {
  if (!username.trim()) {
    return {
      status: "pending",
      gameId: "chesscom-username-missing",
      summary: "Add a Chess.com username before Side Quest Chess can inspect latest rookless rampage attempts.",
      evidence: ["No Chess.com username is stored."],
    };
  }

  try {
    const archives = await fetchArchiveMonths(username.trim());

    if (!archives?.length) {
      return {
        status: "pending",
        gameId: "chesscom-archives-unavailable",
        summary: `Chess.com public archives are not available for ${username} yet.`,
        evidence: ["Chess.com did not return any public archive months."],
      };
    }

    const recentArchives = archives.slice(-3).reverse();

    for (const archiveUrl of recentArchives) {
      const games = await fetchMonthlyArchive(archiveUrl);
      const normalizedGames = (games ?? [])
        .filter(isFinishedGame)
        .sort((a, b) => (b.end_time ?? 0) - (a.end_time ?? 0))
        .map((game) => normalizeChessComRooklessRampageGame(game, username))
        .filter((game): game is RooklessGame => Boolean(game));

      if (normalizedGames.length) {
        return evaluateChessComRooklessRampage(normalizedGames[0]);
      }
    }

    return {
      status: "pending",
      gameId: "chesscom-no-recent-games",
      summary: `No recent public bullet/blitz/rapid Chess.com games were found for ${username}.`,
      evidence: ["The latest-games adapter returned no normalizable games with PGN move text."],
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

export function normalizeChessComKnightmareModeGame(game: ChessComGame, username: string): KnightmareGame | null {
  const playerColor = getPlayerSideForUsername(game, username);

  if (!game.url || !playerColor || !game.pgn) {
    return null;
  }

  const sanMoves = extractSanMoveTokens(game.pgn);

  return {
    id: normalizeChessComGameUrl(game.url),
    playerColor,
    winner: getWinningSide(game),
    status: getChessComEndStatus(game),
    moveCount: Math.ceil(sanMoves.length / 2),
    variant: game.rules === "chess" || !game.rules ? "standard" : game.rules,
    timeClass: normalizeChessComTimeClass(game.time_class),
    finalMove: chessComFinalMoveFromSan(sanMoves),
  };
}

function evaluateChessComKnightmareMode(game: KnightmareGame): ChessComKnightmareModeVerdict {
  if (game.variant && game.variant !== "standard") {
    return { status: "failed", gameId: game.id, summary: "Variants are fun, but Knightmare Mode only counts standard chess games.", evidence: [`Variant was ${game.variant}.`] };
  }

  if (!["bullet", "blitz", "rapid", "unknown"].includes(game.timeClass ?? "unknown")) {
    return { status: "failed", gameId: game.id, summary: "This game was outside the v1 bullet/blitz/rapid eligibility window.", evidence: [`Time class was ${game.timeClass}.`] };
  }

  if (game.moveCount < 10) {
    return { status: "failed", gameId: game.id, summary: "The game ended before the minimum 10-move Knightmare proof threshold.", evidence: [`Game length was ${game.moveCount} moves.`] };
  }

  if (game.winner !== game.playerColor) {
    return { status: "failed", gameId: game.id, summary: "Knightmare Mode only counts if the horse-crime player wins.", evidence: [`Winner was ${game.winner}.`] };
  }

  if (game.status !== "mate") {
    return { status: "failed", gameId: game.id, summary: "The latest win did not end by checkmate, so the horse did not get the final paperwork.", evidence: [`Game status was ${game.status ?? "unknown"}.`] };
  }

  if (!game.finalMove) {
    return { status: "pending", gameId: game.id, summary: "The verifier could not identify the final move from the normalized Chess.com PGN.", evidence: ["No final SAN move was available after normalization."] };
  }

  if (game.finalMove.color !== game.playerColor) {
    return { status: "failed", gameId: game.id, summary: "The mating move was not made by the Side Quest Chess player.", evidence: [`Final move belonged to ${game.finalMove.color}.`] };
  }

  if (game.finalMove.piece !== "knight") {
    return {
      status: "failed",
      gameId: game.id,
      summary: `Checkmate happened, but the final blow came from a ${game.finalMove.piece}, not a knight. The horse is filing a complaint.`,
      evidence: [`Final move: ${game.finalMove.from}${game.finalMove.to} by ${game.finalMove.piece}.`],
    };
  }

  return {
    status: "passed",
    gameId: game.id,
    summary: "Knight checkmate confirmed. The horse got the final word and Side Quest Chess has the receipt.",
    evidence: [
      `${chessComColorName(game.playerColor)} won by checkmate.`,
      `Final move ${game.finalMove.from}${game.finalMove.to} was made by a knight.`,
      `Game lasted ${game.moveCount} moves.`,
    ],
  };
}

export async function checkLatestChessComKnightmareMode(username: string): Promise<ChessComKnightmareModeVerdict> {
  if (!username.trim()) {
    return {
      status: "pending",
      gameId: "chesscom-username-missing",
      summary: "Add a Chess.com username before Side Quest Chess can inspect latest Knightmare attempts.",
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
        .map((game) => normalizeChessComKnightmareModeGame(game, username))
        .filter((game): game is KnightmareGame => Boolean(game));

      if (normalizedGames.length) {
        return evaluateChessComKnightmareMode(normalizedGames[0]);
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

function evaluateChessComPawnStormManiac(game: PawnStormGame): ChessComPawnStormManiacVerdict {
  if (game.variant && game.variant !== "standard") {
    return { status: "failed", gameId: game.id, summary: "Variants are fun, but Pawn Storm Maniac only counts standard chess games.", evidence: [`Variant was ${game.variant}.`] };
  }

  if (!["bullet", "blitz", "rapid", "unknown"].includes(game.timeClass ?? "unknown")) {
    return { status: "failed", gameId: game.id, summary: "This game was outside the v1 bullet/blitz/rapid eligibility window.", evidence: [`Time class was ${game.timeClass}.`] };
  }

  if (game.moveCount < 20) {
    return { status: "failed", gameId: game.id, summary: "The game ended before the minimum 20-move chaos-proof threshold.", evidence: [`Game length was ${game.moveCount} moves.`] };
  }

  if (game.winner !== game.playerColor) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "Pawn Storm Maniac only counts if the pawn-weather player still wins.",
      evidence: [`Winner was ${game.winner === "draw" ? "draw" : chessComColorName(game.winner as "white" | "black")}.`],
    };
  }

  const earlyPlayerPawnMoves = game.pawnMoves.filter(
    (move) => move.color === game.playerColor && chessComMoveNumberFromPly(move.ply) <= 15,
  );
  const distinctPawnStarts = Array.from(new Set(earlyPlayerPawnMoves.map((move) => move.from))).sort();

  if (distinctPawnStarts.length < 6) {
    return {
      status: "failed",
      gameId: game.id,
      summary: `Only ${distinctPawnStarts.length} different player pawns moved before move 15. The storm was more of a drizzle.`,
      evidence: [
        `${chessComColorName(game.playerColor)} moved ${distinctPawnStarts.length}/6 different pawns before move 15.`,
        distinctPawnStarts.length ? `Pawn starts: ${distinctPawnStarts.join(", ")}.` : "No early player pawn moves were detected.",
      ],
    };
  }

  return {
    status: "passed",
    gameId: game.id,
    summary: "Six-pawn storm confirmed before move 15, followed by an actual win. Terrible weather, excellent receipt.",
    evidence: [
      `${chessComColorName(game.playerColor)} moved ${distinctPawnStarts.length} different pawns before move 15.`,
      `Pawn starts: ${distinctPawnStarts.slice(0, 6).join(", ")}.`,
      `${chessComColorName(game.playerColor)} still won after ${game.moveCount} moves.`,
    ],
  };
}

export function normalizeChessComPawnStormManiacGame(game: ChessComGame, username: string): PawnStormGame | null {
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
    pawnMoves: chessComPawnStormMovesFromSan(sanMoves),
  };
}

export async function checkLatestChessComPawnStormManiac(username: string): Promise<ChessComPawnStormManiacVerdict> {
  if (!username.trim()) {
    return {
      status: "pending",
      gameId: "chesscom-username-missing",
      summary: "Add a Chess.com username before Side Quest Chess can inspect latest pawn-storm attempts.",
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
        .map((game) => normalizeChessComPawnStormManiacGame(game, username))
        .filter((game): game is PawnStormGame => Boolean(game));

      if (normalizedGames.length) {
        return evaluateChessComPawnStormManiac(normalizedGames[0]);
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
        summary: resultMismatchSummary ?? "Submitted Chess.com game found, but it does not satisfy this quest.",
      };
    }

    return {
      status: "passed",
      summary: passSummary,
      completedGameAt: getChessComCompletedGameAt(game),
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
    passSummary: `Verified Chess.com game. ${chessComUsername} appears in a finished public game, so this quest passed.`,
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
    passSummary: `Verified Chess.com game. ${chessComUsername} finished a public game as White, so this quest passed.`,
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
    passSummary: `Verified Chess.com game. ${chessComUsername} finished a public game as Black, so this quest passed.`,
    sideMismatchSummary: `Submitted Chess.com game found, but saved username ${chessComUsername} appears as White instead of Black.`,
  });
}

export async function checkLatestChessComFinishedGame(username: string): Promise<ChessComVerificationVerdict & { gameId: string; evidence: string[] }> {
  if (!username.trim()) {
    return {
      status: "pending",
      gameId: "chesscom-username-missing",
      summary: "Add a Chess.com username before Side Quest Chess can inspect latest finished games.",
      evidence: ["No Chess.com username is stored."],
    };
  }

  try {
    const archives = await fetchArchiveMonths(username);

    if (!archives?.length) {
      return {
        status: "pending",
        gameId: "chesscom-archives-unavailable",
        summary: `Chess.com archive lookup is temporarily unavailable for ${username}.`,
        evidence: ["No Chess.com public archives were returned."],
      };
    }

    for (const archiveUrl of archives.slice(-3).reverse()) {
      const games = await fetchMonthlyArchive(archiveUrl);

      if (!games?.length) {
        continue;
      }

      const match = games
        .toReversed()
        .find((game) => isFinishedGame(game) && Boolean(getPlayerSideForUsername(game, username)));

      if (match) {
        const gameId = normalizeChessComGameUrl(match.url ?? "chesscom-latest-game");
        return {
          status: "passed",
          gameId,
          summary: `Verified Chess.com game. ${username} appears in a finished public game, so the Proof Loop Test passed.`,
          completedGameAt: getChessComCompletedGameAt(match),
          evidence: ["A finished Chess.com archive game matched the saved username.", "Win, loss, draw, color, and time control are accepted for this test quest."],
        };
      }
    }

    return {
      status: "pending",
      gameId: "chesscom-no-recent-games",
      summary: `No recent public finished Chess.com games were found for ${username}.`,
      evidence: ["Recent Chess.com archives did not include a finished matching game yet."],
    };
  } catch {
    return {
      status: "pending",
      gameId: "chesscom-latest-error",
      summary: `Chess.com latest-game lookup could not complete for ${username}.`,
      evidence: ["Network or archive parsing failed."],
    };
  }
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
    passSummary: `Verified Chess.com game. ${chessComUsername} won a finished public game as White, so this quest passed.`,
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
    passSummary: `Verified Chess.com game. ${chessComUsername} won a finished public game as Black, so this quest passed.`,
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
    passSummary: `Verified Chess.com game. ${chessComUsername} appears in a finished public draw, so this quest passed.`,
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
    passSummary: `Verified Chess.com game. ${chessComUsername} finished a public draw as White, so this quest passed.`,
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
    passSummary: `Verified Chess.com game. ${chessComUsername} finished a public draw as Black, so this quest passed.`,
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
    passSummary: `Verified Chess.com game. ${chessComUsername} appears in a finished public loss, so this quest passed.`,
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
    passSummary: `Verified Chess.com game. ${chessComUsername} lost a finished public game as White, so this quest passed.`,
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
    passSummary: `Verified Chess.com game. ${chessComUsername} lost a finished public game as Black, so this quest passed.`,
    sideMismatchSummary: `Submitted Chess.com game found, but saved username ${chessComUsername} appears as White instead of Black.`,
    resultRequirement: (game) => didSideLose(game, "black"),
    resultMismatchSummary: `Submitted Chess.com game found, and ${chessComUsername} appears as Black, but Black did not lose.`,
  });
}
