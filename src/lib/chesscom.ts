import { Chess } from "chess.js";
import type { BlunderGambitCaptureEvent, BlunderGambitGame, BlunderGambitPiece, BlunderGambitVerdict } from "./the-blunder-gambit";
import type { KnightmareFinalMove, KnightmareGame, KnightmareVerdict } from "./knightmare-mode";
import type { OneBishopGame, OneBishopVerdict } from "./one-bishop-to-rule-them-all";
import type { PawnOnlyPicnicGame, PawnOnlyPicnicVerdict } from "./pawn-only-picnic";
import { evaluatePawnOnlyPicnic } from "./pawn-only-picnic";
import type { PawnStormGame, PawnStormMoveEvent } from "./pawn-storm-maniac";
import type { RooklessGame, RooklessLossEvent } from "./rookless-rampage";
import type { MultiplayerGameMetadata } from "./multiplayer-proof-rules";
import { classifyChessComArchiveGameEvidence, getChessComArchiveReplayIdentity, normalizeChessComArchiveUrls, normalizeChessComGameUrl, selectUniqueLatestChessComEvidence } from "./custom-side-quests";
import type { ChessComArchiveGameEvidence, ChessComCanonicalReplay } from "./custom-side-quests";

export type ChessComVerificationVerdict = {
  status: "passed" | "failed" | "pending";
  summary: string;
  startedGameAt?: string;
  completedGameAt?: string;
  finalPositionFen?: string;
  lastMoveUci?: string;
  lastMoveSan?: string;
  playerColor?: "white" | "black";
  outcome?: "win" | "draw" | "lose" | "unknown";
  metadata?: MultiplayerGameMetadata;
};

type QueenChallengeSide = "white" | "black";

type QueenChallengeCaptureEvent = {
  ply: number;
  capturedPiece: "queen" | "rook" | "bishop" | "knight" | "pawn" | "king";
  capturedColor: QueenChallengeSide;
  capturedOrigin?: string;
};

type QueenChallengeGame = {
  id: string;
  playerColor: QueenChallengeSide;
  winner: "white" | "black" | "draw" | "unknown";
  moveCount: number;
  variant?: "standard" | string;
  timeClass?: "bullet" | "blitz" | "rapid" | "classical" | "daily" | "unknown";
  startedGameAt?: string;
  completedGameAt?: string;
  captures: QueenChallengeCaptureEvent[];
};

type QueenChallengeVerdict = {
  status: "passed" | "failed" | "pending";
  gameId: string;
  summary: string;
  evidence: string[];
  startedGameAt?: string;
  completedGameAt?: string;
};

type ChessComNoCastleGame = {
  id: string;
  playerColor: "white" | "black";
  winner: "white" | "black" | "draw" | "unknown";
  moveCount: number;
  variant?: "standard" | string;
  timeClass?: "bullet" | "blitz" | "rapid" | "classical" | "daily" | "unknown";
  startedGameAt?: string;
  completedGameAt?: string;
  finalPositionFen?: string;
  lastMoveSan?: string;
  castling: Array<{
    ply: number;
    color: "white" | "black";
    side: "kingside" | "queenside";
    san?: string;
    fenAfter?: string;
  }>;
};

type ChessComNoCastleVerdict = {
  status: "passed" | "failed" | "pending";
  gameId: string;
  summary: string;
  evidence: string[];
  startedGameAt?: string;
  completedGameAt?: string;
  finalPositionFen?: string;
  lastMoveSan?: string;
  failureDiagnostic?: {
    label?: string;
    explanation?: string;
    moveNumber?: number;
    ply?: number;
    san?: string;
    uci?: string;
    fenAtBreak?: string;
    playerColor?: "white" | "black";
  };
};

type ChessComKnightsBeforeCoffeeGame = {
  id: string;
  playerColor: "white" | "black";
  winner: "white" | "black" | "draw" | "unknown";
  moveCount: number;
  variant?: "standard" | string;
  timeClass?: "bullet" | "blitz" | "rapid" | "classical" | "daily" | "unknown";
  startedGameAt?: string;
  completedGameAt?: string;
  firstFourPlayerMovePieces: Array<"pawn" | "knight" | "bishop" | "rook" | "queen" | "king">;
  finalPositionFen?: string;
  lastMoveUci?: string;
  lastMoveSan?: string;
  firstNonKnightMove?: {
    piece: "pawn" | "knight" | "bishop" | "rook" | "queen" | "king";
    moveNumber: number;
    ply: number;
    san?: string;
    uci?: string;
    fenAfter?: string;
  };
};

type ChessComKnightsBeforeCoffeeVerdict = {
  status: "passed" | "failed" | "pending";
  gameId: string;
  summary: string;
  evidence: string[];
  startedGameAt?: string;
  completedGameAt?: string;
  finalPositionFen?: string;
  lastMoveUci?: string;
  lastMoveSan?: string;
  failureDiagnostic?: {
    label?: string;
    explanation?: string;
    moveNumber?: number;
    ply?: number;
    san?: string;
    uci?: string;
    fenAtBreak?: string;
    playerColor?: "white" | "black";
  };
};

type ChessComBishopFieldTripGame = {
  id: string;
  playerColor: "white" | "black";
  winner: "white" | "black" | "draw" | "unknown";
  moveCount: number;
  variant?: "standard" | string;
  timeClass?: "bullet" | "blitz" | "rapid" | "classical" | "daily" | "unknown";
  startedGameAt?: string;
  completedGameAt?: string;
  bothBishopsMovedBeforeQueen: boolean;
  movedBishopHomeSquaresBeforeQueen: string[];
  queenMovedOnPlayerMove?: number;
};

type ChessComBishopFieldTripVerdict = {
  status: "passed" | "failed" | "pending";
  gameId: string;
  summary: string;
  evidence: string[];
  startedGameAt?: string;
  completedGameAt?: string;
};

type ChessComEarlyKingWalkGame = {
  id: string;
  playerColor: "white" | "black";
  winner: "white" | "black" | "draw" | "unknown";
  moveCount: number;
  variant?: "standard" | string;
  timeClass?: "bullet" | "blitz" | "rapid" | "classical" | "daily" | "unknown";
  startedGameAt?: string;
  completedGameAt?: string;
  earlyKingWalkMove?: number;
  castledBeforeKingWalk: boolean;
};

type ChessComEarlyKingWalkVerdict = {
  status: "passed" | "failed" | "pending";
  gameId: string;
  summary: string;
  evidence: string[];
  startedGameAt?: string;
  completedGameAt?: string;
};

type ChessComPawnStormManiacVerdict = {
  status: "passed" | "failed" | "pending";
  gameId: string;
  summary: string;
  evidence: string[];
  startedGameAt?: string;
  completedGameAt?: string;
};

type ChessComPawnOnlyPicnicVerdict = PawnOnlyPicnicVerdict;

type ChessComRooklessRampageVerdict = {
  status: "passed" | "failed" | "pending";
  gameId: string;
  summary: string;
  evidence: string[];
  startedGameAt?: string;
  completedGameAt?: string;
};

type ChessComKnightmareModeVerdict = KnightmareVerdict;
type ChessComOneBishopVerdict = OneBishopVerdict;
type ChessComBlunderGambitVerdict = BlunderGambitVerdict;

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
  time_control?: string;
  rated?: boolean;
  white?: ChessComPlayer;
  black?: ChessComPlayer;
  archiveEvidence?: Exclude<ChessComArchiveGameEvidence, { kind: "unknown" }>;
};

const trustedChessComArchiveEvidence = new WeakMap<ChessComGame, Exclude<ChessComArchiveGameEvidence<ChessComGame>, { kind: "unknown" }>>();

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


function normalizeChessComUsername(value: string): string {
  return value.trim().toLowerCase();
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
  return normalizeChessComArchiveUrls(data.archives, chessComUsername);
}

async function fetchMonthlyArchive(url: string): Promise<ChessComGame[] | null> {
  try {
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
    return Array.isArray(data.games)
      ? data.games.map((game) => {
        if (!game || typeof game !== "object" || Array.isArray(game)) return game;
        const providerGame = { ...game };
        delete providerGame.archiveEvidence;
        return providerGame;
      })
      : null;
  } catch {
    return null;
  }
}

async function fetchKnownLatestMonthlyArchive(url: string, username: string): Promise<ChessComGame[]> {
  const games = await fetchMonthlyArchive(url);
  if (games === null) throw new Error("Chess.com latest archive is unavailable.");
  const evidence = games.map((game) => classifyChessComArchiveGameEvidence(game, username));
  if (evidence.some((item) => item.kind === "unknown")) {
    throw new Error("Chess.com latest archive contains unknown evidence.");
  }
  if (!evidence.length) return [];
  const selected = selectUniqueLatestChessComEvidence(evidence as Array<Exclude<ChessComArchiveGameEvidence<ChessComGame>, { kind: "unknown" }>>);
  if (!selected) throw new Error("Chess.com latest archive is ambiguous.");
  const validatedGame = {
    ...selected.game,
    archiveEvidence: selected,
  };
  trustedChessComArchiveEvidence.set(validatedGame, selected);
  return [validatedGame];
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
  return trustedChessComArchiveEvidence.get(game)?.kind === "known-standard" && getWinningSide(game) === side;
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
  const trusted = trustedChessComArchiveEvidence.get(game);
  if (trusted) return trusted.completedGameAt;
  if (typeof game.end_time !== "number") return undefined;
  const date = new Date(game.end_time * 1000);
  return Number.isFinite(date.getTime()) ? date.toISOString() : undefined;
}

function getChessComStartedGameAt(game: ChessComGame): string | undefined {
  return trustedChessComArchiveEvidence.get(game)?.startedGameAt;
}

export function normalizeLatestChessComGameMetadata(game: ChessComGame, username: string): MultiplayerGameMetadata | null {
  const playerColor = getPlayerSideForUsername(game, username);
  const gameUrl = game.url ? normalizeChessComGameUrl(game.url) : "";
  if (!playerColor || !gameUrl) return null;
  const clock = game.time_control?.match(/^(\d+)(?:\+(\d+))?$/);
  const winner = getWinningSide(game);
  return {
    provider: "chesscom",
    gameId: gameUrl,
    gameUrl,
    timeControl: normalizeChessComTimeClass(game.time_class) ?? "unknown",
    initialSeconds: clock ? Number(clock[1]) : undefined,
    incrementSeconds: clock ? Number(clock[2] ?? 0) : undefined,
    rated: typeof game.rated === "boolean" ? game.rated : null,
    playerColor,
    playedAt: getChessComCompletedGameAt(game),
    variant: game.rules === "chess" ? "standard" : game.rules ?? null,
    result: winner === "draw" ? "draw" : winner === "unknown" ? "unknown" : winner === playerColor ? "win" : "lose",
  };
}

function getChessComReplayBinding(game: ChessComGame): { chessComReplayIdentity?: string } {
  const evidence = trustedChessComArchiveEvidence.get(game);
  return { chessComReplayIdentity: evidence ? getChessComArchiveReplayIdentity(evidence) : undefined };
}

async function findGameByUrl(chessComUsername: string, rawGameUrl: string): Promise<ChessComGame | null | undefined> {
  const normalizedUrl = normalizeChessComGameUrl(rawGameUrl);
  const archives = await fetchArchiveMonths(chessComUsername);

  if (!archives?.length) {
    return null;
  }

  const recentArchives = archives.slice(-3).reverse();
  const matches: ChessComGame[] = [];

  for (const archiveUrl of recentArchives) {
    const games = await fetchMonthlyArchive(archiveUrl);

    if (!games) {
      continue;
    }

    matches.push(...games.filter((game) => game && typeof game === "object" && typeof game.url === "string" && normalizeChessComGameUrl(game.url) === normalizedUrl));
    if (matches.length > 1) return null;
  }

  const match = matches[0];
  if (!match) return undefined;
  const evidence = classifyChessComArchiveGameEvidence(match, chessComUsername);
  if (evidence.kind === "unknown") return match;
  const validatedGame = { ...match, archiveEvidence: evidence };
  trustedChessComArchiveEvidence.set(validatedGame, evidence);
  return validatedGame;
}

function normalizeChessComTimeClass(value?: string): ChessComNoCastleGame["timeClass"] {
  const normalized = value?.toLowerCase();
  return normalized === "bullet" || normalized === "blitz" || normalized === "rapid" || normalized === "classical" || normalized === "daily"
    ? normalized
    : "unknown";
}

function getValidatedChessComReplay(game: ChessComGame, username: string): ChessComCanonicalReplay | null {
  const trustedEvidence = trustedChessComArchiveEvidence.get(game);
  if (trustedEvidence?.kind === "known-standard") return trustedEvidence.replay;
  const evidence = classifyChessComArchiveGameEvidence(game, username);
  if (evidence.kind !== "known-standard") return null;
  trustedChessComArchiveEvidence.set(game, evidence);
  return evidence.replay;
}

function chessComCaptureEvents(replay: ChessComCanonicalReplay): QueenChallengeCaptureEvent[] {
  return replay.moves
    .filter((move) => move.capturedPiece && move.capturedColor)
    .map((move) => ({
      ply: move.ply,
      capturedPiece: move.capturedPiece as QueenChallengeCaptureEvent["capturedPiece"],
      capturedColor: move.capturedColor as QueenChallengeCaptureEvent["capturedColor"],
      capturedOrigin: move.capturedOrigin,
    }));
}

function chessComBlunderCaptureEvents(replay: ChessComCanonicalReplay): BlunderGambitCaptureEvent[] {
  return replay.moves
    .filter((move) => move.capturedPiece && move.capturedColor)
    .map((move) => ({
      ply: move.ply,
      color: move.color,
      from: move.from,
      to: move.to,
      capturedPiece: move.capturedPiece as BlunderGambitPiece,
      capturedColor: move.capturedColor as "white" | "black",
    }));
}

function chessComNoCastleReplay(replay: ChessComCanonicalReplay) {
  const castling: ChessComNoCastleGame["castling"] = replay.moves
    .filter((move) => /^O-O(?:-O)?[+#]?$/.test(move.san))
    .map((move) => ({
      ply: move.ply,
      color: move.color,
      side: move.san.startsWith("O-O-O") ? "queenside" as const : "kingside" as const,
      san: move.san,
      fenAfter: move.fenAfter,
    }));
  return { castling, finalPositionFen: replay.finalPositionFen, lastMoveSan: replay.moves.at(-1)?.san };
}

function chessComKnightOpeningReplay(replay: ChessComCanonicalReplay, playerColor: "white" | "black") {
  const playerMoves = replay.moves.filter((move) => move.color === playerColor);
  const firstFourPlayerMovePieces = playerMoves.slice(0, 4).map((move) => move.piece);
  const firstNonKnightIndex = playerMoves.findIndex((move) => move.piece !== "knight");
  const firstNonKnight = firstNonKnightIndex >= 0 ? playerMoves[firstNonKnightIndex] : undefined;
  const lastMove = replay.moves.at(-1);
  return {
    firstFourPlayerMovePieces,
    finalPositionFen: replay.finalPositionFen,
    lastMoveUci: lastMove?.uci,
    lastMoveSan: lastMove?.san,
    firstNonKnightMove: firstNonKnight ? {
      piece: firstNonKnight.piece,
      moveNumber: firstNonKnightIndex + 1,
      ply: firstNonKnight.ply,
      san: firstNonKnight.san,
      uci: firstNonKnight.uci,
      fenAfter: firstNonKnight.fenAfter,
    } : undefined,
  };
}

function chessComEarlyKingWalkFromReplay(replay: ChessComCanonicalReplay, playerColor: "white" | "black") {
  const playerMoves = replay.moves.filter((move) => move.color === playerColor);
  const kingWalkIndex = playerMoves.findIndex((move) => move.piece === "king" && !move.san.startsWith("O-O"));
  const castledBeforeKingWalk = playerMoves
    .slice(0, kingWalkIndex < 0 ? undefined : kingWalkIndex)
    .some((move) => move.san.startsWith("O-O"));
  return {
    earlyKingWalkMove: kingWalkIndex < 0 ? undefined : kingWalkIndex + 1,
    castledBeforeKingWalk,
  };
}

function chessComRookLossesFromReplay(replay: ChessComCanonicalReplay): RooklessLossEvent[] {
  const rookOrigins = new Map<string, RooklessLossEvent["origin"]>([
    ["a1", "a1"], ["h1", "h1"], ["a8", "a8"], ["h8", "h8"],
  ]);
  const losses: RooklessLossEvent[] = [];
  for (const move of replay.moves) {
    const capturedOrigin = rookOrigins.get(move.to);
    if (capturedOrigin) {
      losses.push({
        ply: move.ply,
        color: move.capturedColor as "white" | "black",
        origin: capturedOrigin,
        square: move.to,
        capturedBy: move.color,
      });
      rookOrigins.delete(move.to);
    }
    const movingOrigin = rookOrigins.get(move.from);
    rookOrigins.delete(move.from);
    if (movingOrigin && !move.promotion) rookOrigins.set(move.to, movingOrigin);
    if (move.piece === "king") {
      const castleRook = move.from === "e1" && move.to === "g1" ? ["h1", "f1"]
        : move.from === "e1" && move.to === "c1" ? ["a1", "d1"]
          : move.from === "e8" && move.to === "g8" ? ["h8", "f8"]
            : move.from === "e8" && move.to === "c8" ? ["a8", "d8"]
              : null;
      if (castleRook) {
        const [from, to] = castleRook;
        const origin = rookOrigins.get(from);
        rookOrigins.delete(from);
        if (origin) rookOrigins.set(to, origin);
      }
    }
  }
  return losses;
}

function chessComFinalMinorPiecesFromReplay(replay: ChessComCanonicalReplay, playerColor: "white" | "black"): OneBishopGame["finalMinorPieces"] {
  const chess = new Chess(replay.finalPositionFen);
  const color = playerColor === "white" ? "w" : "b";
  return chess.board().flat()
    .filter((piece) => piece && piece.color === color && (piece.type === "b" || piece.type === "n"))
    .map((piece) => ({ kind: piece!.type === "b" ? "bishop" as const : "knight" as const, square: piece!.square }))
    .sort((a, b) => a.square.localeCompare(b.square));
}

function chessComFinalMoveFromReplay(replay: ChessComCanonicalReplay): KnightmareFinalMove | undefined {
  const move = replay.moves.at(-1);
  return move ? { ply: move.ply, color: move.color, from: move.from, to: move.to, piece: move.piece } : undefined;
}

function chessComPawnStormMovesFromReplay(replay: ChessComCanonicalReplay): PawnStormMoveEvent[] {
  return replay.moves
    .filter((move) => move.piece === "pawn")
    .map((move) => ({ ply: move.ply, color: move.color, from: move.from, to: move.to, pawnFile: move.origin[0] }));
}

function chessComBishopFieldTripFromReplay(replay: ChessComCanonicalReplay, playerColor: "white" | "black") {
  const homeSquares = playerColor === "white" ? ["c1", "f1"] : ["c8", "f8"];
  const playerMoves = replay.moves.filter((move) => move.color === playerColor);
  const queenMoveIndex = playerMoves.findIndex((move) => move.piece === "queen");
  const movesBeforeQueen = queenMoveIndex < 0 ? playerMoves : playerMoves.slice(0, queenMoveIndex);
  const movedBishopHomes = new Set(movesBeforeQueen.filter((move) => move.piece === "bishop" && homeSquares.includes(move.origin)).map((move) => move.origin));
  const movedBishopHomeSquaresBeforeQueen = homeSquares.filter((square) => movedBishopHomes.has(square));
  return {
    bothBishopsMovedBeforeQueen: movedBishopHomeSquaresBeforeQueen.length === 2,
    movedBishopHomeSquaresBeforeQueen,
    queenMovedOnPlayerMove: queenMoveIndex < 0 ? undefined : queenMoveIndex + 1,
  };
}

type ChessComProofPosition = Pick<ChessComVerificationVerdict, "finalPositionFen" | "lastMoveUci">;

function buildChessComProofPosition(game: ChessComGame): ChessComProofPosition | null {
  const evidence = trustedChessComArchiveEvidence.get(game);
  if (evidence?.kind !== "known-standard") return null;
  const replay = evidence.replay;
  return {
    finalPositionFen: replay.finalPositionFen,
    lastMoveUci: replay.moves.at(-1)?.uci,
  };
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

export function normalizeChessComBlunderGambitGame(game: ChessComGame, username: string): BlunderGambitGame | null {
  const playerColor = getPlayerSideForUsername(game, username);
  const replay = getValidatedChessComReplay(game, username);

  if (!game.url || !playerColor || !game.pgn || !replay) {
    return null;
  }

  return {
    id: normalizeChessComGameUrl(game.url),
    playerColor,
    winner: getWinningSide(game),
    moveCount: Math.ceil(replay.moves.length / 2),
    variant: game.rules === "chess" || !game.rules ? "standard" : game.rules,
    timeClass: normalizeChessComTimeClass(game.time_class),
    startedGameAt: getChessComStartedGameAt(game),
    completedGameAt: getChessComCompletedGameAt(game),
    captures: chessComBlunderCaptureEvents(replay),
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
      const games = await fetchKnownLatestMonthlyArchive(archiveUrl, username);

      if (!games?.length) {
        continue;
      }

      const normalizedGames = games
        .slice()
        .sort((a, b) => (b.end_time ?? 0) - (a.end_time ?? 0))
        .map((game) => normalizeChessComBlunderGambitGame(game, username))
        .filter((game): game is BlunderGambitGame => Boolean(game));

      if (normalizedGames.length) {
        return { ...evaluateChessComBlunderGambit(normalizedGames[0]), startedGameAt: normalizedGames[0].startedGameAt, completedGameAt: normalizedGames[0].completedGameAt, ...getChessComReplayBinding(games[0]) };
      }
      break;
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
    (capture) => capture.capturedPiece === "queen" && capture.capturedColor === playerColor
      && capture.capturedOrigin === (playerColor === "white" ? "d1" : "d8"),
  );
  const opponentQueenLossBeforePlayerLoss = playerQueenLoss
    ? game.captures.find(
        (capture) =>
          capture.capturedPiece === "queen" &&
          capture.capturedColor === opponentColor &&
          capture.capturedOrigin === (opponentColor === "white" ? "d1" : "d8") &&
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

function buildChessComNoCastleFinalDiagnostic(game: ChessComNoCastleGame, label: string, explanation: string): Pick<ChessComNoCastleVerdict, "finalPositionFen" | "lastMoveSan" | "failureDiagnostic"> {
  return {
    finalPositionFen: game.finalPositionFen,
    lastMoveSan: game.lastMoveSan,
    failureDiagnostic: {
      label,
      explanation,
      moveNumber: game.moveCount,
      san: game.lastMoveSan,
      fenAtBreak: game.finalPositionFen,
      playerColor: game.playerColor,
    },
  };
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
      ...buildChessComNoCastleFinalDiagnostic(game, "Wrong game type", `Variant was ${game.variant}.`),
    };
  }

  if (!["bullet", "blitz", "rapid", "unknown"].includes(game.timeClass ?? "unknown")) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "This game was outside the v1 bullet/blitz/rapid eligibility window.",
      evidence: [`Time class was ${game.timeClass}.`],
      ...buildChessComNoCastleFinalDiagnostic(game, "Wrong time control", `Time class was ${game.timeClass}.`),
    };
  }

  if (game.moveCount < 10) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "The game ended before the minimum 10-move proof threshold.",
      evidence: [`Game length was ${game.moveCount} moves.`],
      ...buildChessComNoCastleFinalDiagnostic(game, "Game too short", `Game length was ${game.moveCount} moves.`),
    };
  }

  if (game.winner !== game.playerColor) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "No Castle Club only counts if the uncastled player still wins.",
      evidence: [`Winner was ${game.winner === "draw" ? "draw" : chessComColorName(game.winner as "white" | "black")}.`],
      ...buildChessComNoCastleFinalDiagnostic(
        game,
        "Win condition failed",
        `${chessComColorName(game.playerColor)} did not castle, but ${game.winner === "draw" ? "the game was drawn" : `${chessComColorName(game.winner as "white" | "black")} won`}. This quest requires the uncastled player to win.`,
      ),
    };
  }

  if (playerCastling) {
    return {
      status: "failed",
      gameId: game.id,
      summary: `The king took the sensible ${playerCastling.side} castle. Club membership denied.`,
      evidence: [`${chessComColorName(game.playerColor)} castled ${playerCastling.side} on move ${Math.ceil(playerCastling.ply / 2)}.`],
      finalPositionFen: playerCastling.fenAfter,
      lastMoveSan: playerCastling.san,
      failureDiagnostic: {
        label: "Castling broke the condition",
        explanation: `${chessComColorName(game.playerColor)} castled ${playerCastling.side} on move ${Math.ceil(playerCastling.ply / 2)}.`,
        moveNumber: Math.ceil(playerCastling.ply / 2),
        ply: playerCastling.ply,
        san: playerCastling.san,
        fenAtBreak: playerCastling.fenAfter,
        playerColor: game.playerColor,
      },
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
  const replay = getValidatedChessComReplay(game, username);

  if (!game.url || !playerColor || !game.pgn || !replay) {
    return null;
  }

  const proofPositions = chessComNoCastleReplay(replay);

  return {
    id: normalizeChessComGameUrl(game.url),
    playerColor,
    winner: getWinningSide(game),
    moveCount: Math.ceil(replay.moves.length / 2),
    variant: game.rules === "chess" || !game.rules ? "standard" : game.rules,
    timeClass: normalizeChessComTimeClass(game.time_class),
    startedGameAt: getChessComStartedGameAt(game),
    completedGameAt: getChessComCompletedGameAt(game),
    finalPositionFen: proofPositions.finalPositionFen,
    lastMoveSan: proofPositions.lastMoveSan,
    castling: proofPositions.castling,
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
      const games = await fetchKnownLatestMonthlyArchive(archiveUrl, username);

      if (!games?.length) {
        continue;
      }

      const normalizedGames = games
        .slice()
        .sort((a, b) => (b.end_time ?? 0) - (a.end_time ?? 0))
        .map((game) => normalizeChessComNoCastleClubGame(game, username))
        .filter((game): game is ChessComNoCastleGame => Boolean(game));

      if (normalizedGames.length) {
        return { ...evaluateChessComNoCastleClub(normalizedGames[0]), startedGameAt: normalizedGames[0].startedGameAt, completedGameAt: normalizedGames[0].completedGameAt, ...getChessComReplayBinding(games[0]) };
      }
      break;
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
  const replay = getValidatedChessComReplay(game, username);

  if (!game.url || !playerColor || !game.pgn || !replay) {
    return null;
  }

  return {
    id: normalizeChessComGameUrl(game.url),
    playerColor,
    winner: getWinningSide(game),
    moveCount: Math.ceil(replay.moves.length / 2),
    variant: game.rules === "chess" || !game.rules ? "standard" : game.rules,
    timeClass: normalizeChessComTimeClass(game.time_class),
    startedGameAt: getChessComStartedGameAt(game),
    completedGameAt: getChessComCompletedGameAt(game),
    captures: chessComCaptureEvents(replay),
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
      const games = await fetchKnownLatestMonthlyArchive(archiveUrl, username);

      if (!games?.length) {
        continue;
      }

      const normalizedGames = games
        .slice()
        .sort((a, b) => (b.end_time ?? 0) - (a.end_time ?? 0))
        .map((game) => normalizeChessComQueenNeverHeardOfHerGame(game, username))
        .filter((game): game is QueenChallengeGame => Boolean(game));

      if (normalizedGames.length) {
        return { ...evaluateChessComQueenNeverHeardOfHer(normalizedGames[0]), startedGameAt: normalizedGames[0].startedGameAt, completedGameAt: normalizedGames[0].completedGameAt, ...getChessComReplayBinding(games[0]) };
      }
      break;
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
      finalPositionFen: game.finalPositionFen,
      lastMoveUci: game.lastMoveUci,
      lastMoveSan: game.lastMoveSan,
    };
  }

  if (!["bullet", "blitz", "rapid", "unknown"].includes(game.timeClass ?? "unknown")) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "This game was outside the v1 bullet/blitz/rapid eligibility window.",
      evidence: [`Time class was ${game.timeClass}.`],
      finalPositionFen: game.finalPositionFen,
      lastMoveUci: game.lastMoveUci,
      lastMoveSan: game.lastMoveSan,
    };
  }

  if (game.winner !== game.playerColor) {
    return {
      status: "failed",
      gameId: game.id,
      summary: "Knights Before Coffee only counts if the horse-first player wins.",
      evidence: [`Winner was ${game.winner === "draw" ? "draw" : chessComColorName(game.winner as "white" | "black")}.`],
      finalPositionFen: game.finalPositionFen,
      lastMoveUci: game.lastMoveUci,
      lastMoveSan: game.lastMoveSan,
    };
  }

  if (game.firstFourPlayerMovePieces.length < 4) {
    return {
      status: "pending",
      gameId: game.id,
      summary: "The latest Chess.com game ended before four player moves could be checked.",
      evidence: [`Only ${game.firstFourPlayerMovePieces.length} player moves were available.`],
      finalPositionFen: game.finalPositionFen,
      lastMoveUci: game.lastMoveUci,
      lastMoveSan: game.lastMoveSan,
    };
  }

  const firstNonKnightIndex = game.firstFourPlayerMovePieces.findIndex((piece) => piece !== "knight");

  if (firstNonKnightIndex !== -1) {
    const breaker = game.firstNonKnightMove;
    return {
      status: "failed",
      gameId: game.id,
      summary: "The first four player moves were not all knight moves.",
      evidence: [
        `Move ${firstNonKnightIndex + 1} was a ${game.firstFourPlayerMovePieces[firstNonKnightIndex]}.`,
        `First four player moves: ${game.firstFourPlayerMovePieces.join(", ")}.`,
      ],
      finalPositionFen: game.finalPositionFen,
      lastMoveUci: game.lastMoveUci,
      lastMoveSan: game.lastMoveSan,
      failureDiagnostic: {
        label: "First non-knight move",
        explanation: `Player move ${firstNonKnightIndex + 1} was a ${game.firstFourPlayerMovePieces[firstNonKnightIndex]}, not a knight.`,
        moveNumber: breaker?.moveNumber ?? firstNonKnightIndex + 1,
        ply: breaker?.ply,
        san: breaker?.san,
        uci: breaker?.uci,
        fenAtBreak: breaker?.fenAfter ?? game.finalPositionFen,
        playerColor: game.playerColor,
      },
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
    finalPositionFen: game.finalPositionFen,
    lastMoveUci: game.lastMoveUci,
    lastMoveSan: game.lastMoveSan,
  };
}

export function normalizeChessComKnightsBeforeCoffeeGame(game: ChessComGame, username: string): ChessComKnightsBeforeCoffeeGame | null {
  const playerColor = getPlayerSideForUsername(game, username);
  const replay = getValidatedChessComReplay(game, username);

  if (!game.url || !playerColor || !game.pgn || !replay || (game.rules !== undefined && game.rules !== "chess")) {
    return null;
  }

  const analysis = chessComKnightOpeningReplay(replay, playerColor);

  return {
    id: normalizeChessComGameUrl(game.url),
    playerColor,
    winner: getWinningSide(game),
    moveCount: Math.ceil(replay.moves.length / 2),
    variant: game.rules === "chess" || !game.rules ? "standard" : game.rules,
    timeClass: normalizeChessComTimeClass(game.time_class),
    startedGameAt: getChessComStartedGameAt(game),
    completedGameAt: getChessComCompletedGameAt(game),
    firstFourPlayerMovePieces: analysis.firstFourPlayerMovePieces,
    finalPositionFen: analysis.finalPositionFen,
    lastMoveUci: analysis.lastMoveUci,
    lastMoveSan: analysis.lastMoveSan,
    firstNonKnightMove: analysis.firstNonKnightMove,
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
      const games = await fetchKnownLatestMonthlyArchive(archiveUrl, username);

      if (!games?.length) {
        continue;
      }

      const normalizedGames = games
        .slice()
        .sort((a, b) => (b.end_time ?? 0) - (a.end_time ?? 0))
        .map((game) => normalizeChessComKnightsBeforeCoffeeGame(game, username))
        .filter((game): game is ChessComKnightsBeforeCoffeeGame => Boolean(game));

      if (normalizedGames.length) {
        return { ...evaluateChessComKnightsBeforeCoffee(normalizedGames[0]), startedGameAt: normalizedGames[0].startedGameAt, completedGameAt: normalizedGames[0].completedGameAt, ...getChessComReplayBinding(games[0]) };
      }
      break;
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

export function normalizeChessComPawnOnlyPicnicGame(game: ChessComGame, username: string): PawnOnlyPicnicGame | null {
  const playerColor = getPlayerSideForUsername(game, username);
  const replay = getValidatedChessComReplay(game, username);

  if (!game.url || !playerColor || !game.pgn || !replay) {
    return null;
  }

  return {
    id: normalizeChessComGameUrl(game.url),
    playerColor,
    winner: getWinningSide(game),
    moveCount: Math.ceil(replay.moves.length / 2),
    variant: game.rules === "chess" || !game.rules ? "standard" : game.rules,
    timeClass: normalizeChessComTimeClass(game.time_class),
    startedGameAt: getChessComStartedGameAt(game),
    completedGameAt: getChessComCompletedGameAt(game),
    firstEightPlayerMovePieces: replay.moves.filter((move) => move.color === playerColor).slice(0, 8).map((move) => move.piece),
  };
}

export async function checkLatestChessComPawnOnlyPicnic(username: string): Promise<ChessComPawnOnlyPicnicVerdict> {
  if (!username.trim()) {
    return {
      status: "pending",
      gameId: "chesscom-username-missing",
      summary: "Add a Chess.com username before Side Quest Chess can inspect latest pawn-picnic attempts.",
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
      const games = await fetchKnownLatestMonthlyArchive(archiveUrl, username);

      if (!games?.length) {
        continue;
      }

      const normalizedGames = games
        .slice()
        .sort((a, b) => (b.end_time ?? 0) - (a.end_time ?? 0))
        .map((game) => normalizeChessComPawnOnlyPicnicGame(game, username))
        .filter((game): game is PawnOnlyPicnicGame => Boolean(game));

      if (normalizedGames.length) {
        return { ...evaluatePawnOnlyPicnic(normalizedGames[0]), startedGameAt: normalizedGames[0].startedGameAt, completedGameAt: normalizedGames[0].completedGameAt, ...getChessComReplayBinding(games[0]) };
      }
      break;
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
  const replay = getValidatedChessComReplay(game, username);

  if (!game.url || !playerColor || !game.pgn || !replay) {
    return null;
  }

  const kingWalk = chessComEarlyKingWalkFromReplay(replay, playerColor);

  return {
    id: normalizeChessComGameUrl(game.url),
    playerColor,
    winner: getWinningSide(game),
    moveCount: Math.ceil(replay.moves.length / 2),
    variant: game.rules === "chess" || !game.rules ? "standard" : game.rules,
    timeClass: normalizeChessComTimeClass(game.time_class),
    startedGameAt: getChessComStartedGameAt(game),
    completedGameAt: getChessComCompletedGameAt(game),
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
      const games = await fetchKnownLatestMonthlyArchive(archiveUrl, username);

      if (!games?.length) {
        continue;
      }

      const normalizedGames = games
        .slice()
        .sort((a, b) => (b.end_time ?? 0) - (a.end_time ?? 0))
        .map((game) => normalizeChessComEarlyKingWalkGame(game, username))
        .filter((game): game is ChessComEarlyKingWalkGame => Boolean(game));

      if (normalizedGames.length) {
        return { ...evaluateChessComEarlyKingWalk(normalizedGames[0]), startedGameAt: normalizedGames[0].startedGameAt, completedGameAt: normalizedGames[0].completedGameAt, ...getChessComReplayBinding(games[0]) };
      }
      break;
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
  const replay = getValidatedChessComReplay(game, username);

  if (!playerColor || !replay) {
    return null;
  }

  return {
    id: game.url ?? game.uuid ?? "chesscom-latest-game",
    playerColor,
    winner: getWinningSide(game),
    moveCount: Math.ceil(replay.moves.length / 2),
    variant: game.rules === "chess" || !game.rules ? "standard" : game.rules,
    timeClass: normalizeChessComTimeClass(game.time_class),
    rated: game.rated,
    startedGameAt: getChessComStartedGameAt(game),
    completedGameAt: getChessComCompletedGameAt(game),
    rookLosses: chessComRookLossesFromReplay(replay),
  };
}

export function normalizeChessComOneBishopToRuleThemAllGame(game: ChessComGame, username: string): OneBishopGame | null {
  const playerColor = getPlayerSideForUsername(game, username);
  const replay = getValidatedChessComReplay(game, username);

  if (!game.url || !playerColor || !replay) {
    return null;
  }

  return {
    id: normalizeChessComGameUrl(game.url),
    playerColor,
    winner: getWinningSide(game),
    moveCount: Math.ceil(replay.moves.length / 2),
    variant: game.rules === "chess" || !game.rules ? "standard" : game.rules,
    timeClass: normalizeChessComTimeClass(game.time_class),
    startedGameAt: getChessComStartedGameAt(game),
    completedGameAt: getChessComCompletedGameAt(game),
    finalMinorPieces: chessComFinalMinorPiecesFromReplay(replay, playerColor),
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
      const games = await fetchKnownLatestMonthlyArchive(archiveUrl, username);

      if (!games?.length) {
        continue;
      }

      const normalizedGames = games
        .slice()
        .sort((a, b) => (b.end_time ?? 0) - (a.end_time ?? 0))
        .map((game) => normalizeChessComOneBishopToRuleThemAllGame(game, username))
        .filter((game): game is OneBishopGame => Boolean(game));

      if (normalizedGames.length) {
        return { ...evaluateChessComOneBishopToRuleThemAll(normalizedGames[0]), startedGameAt: normalizedGames[0].startedGameAt, completedGameAt: normalizedGames[0].completedGameAt, ...getChessComReplayBinding(games[0]) };
      }
      break;
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
      const games = await fetchKnownLatestMonthlyArchive(archiveUrl, username);
      if (!games.length) {
        continue;
      }
      const normalizedGames = games
        .filter(isFinishedGame)
        .sort((a, b) => (b.end_time ?? 0) - (a.end_time ?? 0))
        .map((game) => normalizeChessComRooklessRampageGame(game, username))
        .filter((game): game is RooklessGame => Boolean(game));

      if (normalizedGames.length) {
        return { ...evaluateChessComRooklessRampage(normalizedGames[0]), startedGameAt: normalizedGames[0].startedGameAt, completedGameAt: normalizedGames[0].completedGameAt, ...getChessComReplayBinding(games[0]) };
      }
      break;
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
  const replay = getValidatedChessComReplay(game, username);

  if (!game.url || !playerColor || !replay) {
    return null;
  }

  return {
    id: normalizeChessComGameUrl(game.url),
    playerColor,
    winner: getWinningSide(game),
    status: getChessComEndStatus(game),
    moveCount: Math.ceil(replay.moves.length / 2),
    variant: game.rules === "chess" || !game.rules ? "standard" : game.rules,
    timeClass: normalizeChessComTimeClass(game.time_class),
    startedGameAt: getChessComStartedGameAt(game),
    completedGameAt: getChessComCompletedGameAt(game),
    finalMove: chessComFinalMoveFromReplay(replay),
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
    return { status: "failed", gameId: game.id, summary: "The mating move was not made by the Quest runner.", evidence: [`Final move belonged to ${game.finalMove.color}.`] };
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
      const games = await fetchKnownLatestMonthlyArchive(archiveUrl, username);

      if (!games?.length) {
        continue;
      }

      const normalizedGames = games
        .slice()
        .sort((a, b) => (b.end_time ?? 0) - (a.end_time ?? 0))
        .map((game) => normalizeChessComKnightmareModeGame(game, username))
        .filter((game): game is KnightmareGame => Boolean(game));

      if (normalizedGames.length) {
        return { ...evaluateChessComKnightmareMode(normalizedGames[0]), startedGameAt: normalizedGames[0].startedGameAt, completedGameAt: normalizedGames[0].completedGameAt, ...getChessComReplayBinding(games[0]) };
      }
      break;
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
  const distinctPawnStarts = Array.from(new Set(earlyPlayerPawnMoves.map((move) => move.pawnFile)))
    .sort()
    .map((file) => `${file}${game.playerColor === "white" ? "2" : "7"}`);

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
  const replay = getValidatedChessComReplay(game, username);

  if (!game.url || !playerColor || !game.pgn || !replay) {
    return null;
  }

  return {
    id: normalizeChessComGameUrl(game.url),
    playerColor,
    winner: getWinningSide(game),
    moveCount: Math.ceil(replay.moves.length / 2),
    variant: game.rules === "chess" || !game.rules ? "standard" : game.rules,
    timeClass: normalizeChessComTimeClass(game.time_class),
    startedGameAt: getChessComStartedGameAt(game),
    completedGameAt: getChessComCompletedGameAt(game),
    pawnMoves: chessComPawnStormMovesFromReplay(replay),
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
      const games = await fetchKnownLatestMonthlyArchive(archiveUrl, username);

      if (!games?.length) {
        continue;
      }

      const normalizedGames = games
        .slice()
        .sort((a, b) => (b.end_time ?? 0) - (a.end_time ?? 0))
        .map((game) => normalizeChessComPawnStormManiacGame(game, username))
        .filter((game): game is PawnStormGame => Boolean(game));

      if (normalizedGames.length) {
        return { ...evaluateChessComPawnStormManiac(normalizedGames[0]), startedGameAt: normalizedGames[0].startedGameAt, completedGameAt: normalizedGames[0].completedGameAt, ...getChessComReplayBinding(games[0]) };
      }
      break;
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
  const replay = getValidatedChessComReplay(game, username);

  if (!game.url || !playerColor || !replay) {
    return null;
  }

  const bishopTrip = chessComBishopFieldTripFromReplay(replay, playerColor);

  return {
    id: normalizeChessComGameUrl(game.url),
    playerColor,
    winner: getWinningSide(game),
    moveCount: Math.ceil(replay.moves.length / 2),
    variant: game.rules === "chess" || !game.rules ? "standard" : game.rules,
    timeClass: normalizeChessComTimeClass(game.time_class),
    startedGameAt: getChessComStartedGameAt(game),
    completedGameAt: getChessComCompletedGameAt(game),
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
      const games = await fetchKnownLatestMonthlyArchive(archiveUrl, username);

      if (!games?.length) {
        continue;
      }

      const normalizedGames = games
        .slice()
        .sort((a, b) => (b.end_time ?? 0) - (a.end_time ?? 0))
        .map((game) => normalizeChessComBishopFieldTripGame(game, username))
        .filter((game): game is ChessComBishopFieldTripGame => Boolean(game));

      if (normalizedGames.length) {
        return { ...evaluateChessComBishopFieldTrip(normalizedGames[0]), startedGameAt: normalizedGames[0].startedGameAt, completedGameAt: normalizedGames[0].completedGameAt, ...getChessComReplayBinding(games[0]) };
      }
      break;
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
  allowUnsupportedVariant = false,
  requiredSide,
  passSummary,
  sideMismatchSummary,
  resultRequirement,
  resultMismatchSummary,
}: {
  gameUrl: string;
  chessComUsername: string;
  allowUnsupportedVariant?: boolean;
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

    if (!game.archiveEvidence || (!allowUnsupportedVariant && game.archiveEvidence.kind !== "known-standard")) {
      return {
        status: "pending",
        summary: "Submitted Chess.com game was found, but its public replay evidence is incomplete or inconsistent.",
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
      startedGameAt: getChessComStartedGameAt(game),
      completedGameAt: getChessComCompletedGameAt(game),
      ...buildChessComProofPosition(game),
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
    allowUnsupportedVariant: true,
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
      const games = await fetchKnownLatestMonthlyArchive(archiveUrl, username);

      if (!games?.length) {
        continue;
      }

      const match = games
        .toSorted((a, b) => (b.end_time ?? 0) - (a.end_time ?? 0))
        .find((game) => isFinishedGame(game) && Boolean(getPlayerSideForUsername(game, username)));

      if (match) {
        const gameId = normalizeChessComGameUrl(match.url ?? "chesscom-latest-game");
        const playerColor = getPlayerSideForUsername(match, username) ?? undefined;
        return {
          status: "passed",
          gameId,
          summary: `Verified Chess.com game. ${username} appears in a finished public game, so Any Game Counts is complete.`,
          startedGameAt: getChessComStartedGameAt(match),
          completedGameAt: getChessComCompletedGameAt(match),
          playerColor,
          outcome: playerColor && getWinningSide(match) === playerColor ? "win" : getWinningSide(match) === "draw" ? "draw" : getWinningSide(match) === "unknown" ? "unknown" : "lose",
          metadata: normalizeLatestChessComGameMetadata(match, username) ?? undefined,
          ...buildChessComProofPosition(match),
          ...getChessComReplayBinding(match),
          evidence: ["A finished Chess.com archive game matched the saved username.", "Win, loss, draw, color, and time control all count."],
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
