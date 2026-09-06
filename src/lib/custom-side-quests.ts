import { Chess } from "chess.js";
import type { LatestChallengeVerdict } from "@/lib/challenge-latest-verifiers";

export type CustomSideQuestRuleConfig = {
  version: number;
  logic: "all" | "any";
  blocks: CustomSideQuestRuleBlock[];
};

export type CustomSideQuestRuleBlock =
  | {
      type: "pieceState";
      piece: "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";
      owner: "my" | "opponent" | "either";
      selector?: { quantifier?: "any one" | "at least" | "exactly" | "all"; count?: number; identity?: string; maxAvailable?: number };
      condition: "gone" | "still on board" | "moved" | "not moved" | "captured" | "on square";
      targetSquare?: string | null;
      timing?: { byMove?: number; atMove?: number; atGameEnd?: true };
      negate?: boolean;
    }
  | {
      type: "moveSequence";
      sequence: string;
      timing?: { byMove?: number; atMove?: number; atGameEnd?: true };
      negate?: boolean;
    }
  | {
      type: "openingSequence";
      raw?: string;
      moves: string[];
      anchor?: "gameStart";
      negate?: boolean;
    }
  | {
      type: "gameResult";
      result: "win" | "draw" | "lose";
      negate?: boolean;
    };

export type CustomSideQuest = {
  id: string;
  title: string;
  summary: string;
  config: string;
  visibility?: "private" | "public";
  lifecycle?: "draft" | "published" | "archived";
  createdAt: string;
  updatedAt: string;
  badgeImageUrl?: string | null;
};

export type CustomSideQuestMetadata = {
  customSideQuests?: CustomSideQuest[];
};

export function normalizeCustomSideQuestLifecycle(quest: CustomSideQuest): CustomSideQuest {
  return {
    ...quest,
    visibility: quest.visibility === "public" ? "public" : "private",
    lifecycle: quest.lifecycle === "draft" || quest.lifecycle === "archived" ? quest.lifecycle : "published",
    badgeImageUrl: getCustomSideQuestBadgeUrl(quest),
  };
}

type LatestGame = {
  provider: "lichess" | "chesscom";
  gameId: string;
  username: string;
  pgnMoves: string[];
  standardStart: boolean;
  replayComplete: boolean;
  uciMoves?: string[];
  playerColor: "white" | "black";
  status: "finished" | "open" | "unknown";
  outcome: "win" | "draw" | "lose" | "unknown";
  startedGameAt?: string;
  completedGameAt?: string;
};

const PIECE_TYPE: Record<string, string> = { king: "k", queen: "q", rook: "r", bishop: "b", knight: "n", pawn: "p" };
const MAX_SUBMITTED_CHESSCOM_ARCHIVE_MONTHS = 6;
const PROVIDER_JSON_MAX_BYTES = 2_000_000;
const PROVIDER_FETCH_TIMEOUT_MS = 10_000;

type BoundedProviderJsonOptions = {
  maxBytes?: number;
  timeoutMs?: number;
  fetcher?: typeof fetch;
};

async function fetchBoundedProviderText(input: string | URL, init: RequestInit = {}, options: BoundedProviderJsonOptions = {}): Promise<string | null> {
  const maxBytes = options.maxBytes ?? PROVIDER_JSON_MAX_BYTES;
  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  const timeoutFailure = new Promise<never>((_resolve, reject) => {
    timeout = setTimeout(() => {
      controller.abort();
      reject(new Error("Provider response timed out."));
    }, options.timeoutMs ?? PROVIDER_FETCH_TIMEOUT_MS);
  });

  try {
    const response = await Promise.race([
      (options.fetcher ?? fetch)(input, { ...init, signal: controller.signal }),
      timeoutFailure,
    ]);
    if (!response.ok) return null;
    const declaredBytes = Number(response.headers.get("content-length"));
    if (Number.isFinite(declaredBytes) && declaredBytes > maxBytes) throw new Error("Provider response is too large.");
    if (!response.body) return "";

    reader = response.body.getReader();
    const decoder = new TextDecoder();
    let bytesRead = 0;
    let body = "";
    while (true) {
      const { done, value } = await Promise.race([reader.read(), timeoutFailure]);
      if (done) break;
      bytesRead += value.byteLength;
      if (bytesRead > maxBytes) {
        void reader.cancel().catch(() => undefined);
        throw new Error("Provider response is too large.");
      }
      body += decoder.decode(value, { stream: true });
    }
    body += decoder.decode();
    return body;
  } finally {
    clearTimeout(timeout);
    void reader?.cancel().catch(() => undefined);
  }
}

export async function fetchBoundedProviderJson(input: string | URL, init: RequestInit = {}, options: BoundedProviderJsonOptions = {}): Promise<unknown> {
  const body = await fetchBoundedProviderText(input, init, options);
  return body === null ? null : JSON.parse(body) as unknown;
}
const HOME_SQUARES: Record<string, Record<string, Record<string, string>>> = {
  white: {
    king: { original: "e1" }, queen: { original: "d1" }, rook: { queenside: "a1", kingside: "h1" }, bishop: { queenside: "c1", kingside: "f1" }, knight: { queenside: "b1", kingside: "g1" }, pawn: { a: "a2", b: "b2", c: "c2", d: "d2", e: "e2", f: "f2", g: "g2", h: "h2" },
  },
  black: {
    king: { original: "e8" }, queen: { original: "d8" }, rook: { queenside: "a8", kingside: "h8" }, bishop: { queenside: "c8", kingside: "f8" }, knight: { queenside: "b8", kingside: "g8" }, pawn: { a: "a7", b: "b7", c: "c7", d: "d7", e: "e7", f: "f7", g: "g7", h: "h7" },
  },
};


const COMMUNITY_COAT_BADGE_POOL = [
  "/badges/custom/community/community-coat-01.png",
  "/badges/custom/community/community-coat-02.png",
  "/badges/custom/community/community-coat-03.png",
  "/badges/custom/community/community-coat-04.png",
  "/badges/custom/community/community-coat-05.png",
  "/badges/custom/community/community-coat-06.png",
  "/badges/custom/community/community-coat-07.png",
  "/badges/custom/community/community-coat-08.png",
  "/badges/custom/community/community-coat-09.png",
  "/badges/custom/community/community-coat-10.png",
  "/badges/custom/community/community-coat-11.png",
  "/badges/custom/community/community-coat-12.png",
  "/badges/custom/community/community-coat-13.png",
  "/badges/custom/community/community-coat-14.png",
  "/badges/custom/community/community-coat-15.png",
  "/badges/custom/community/community-coat-16.png",
  "/badges/custom/community/community-coat-17.png",
  "/badges/custom/community/community-coat-18.png",
  "/badges/custom/community/community-coat-19.png",
  "/badges/custom/community/community-coat-20.png",
  "/badges/custom/community/community-coat-21.png",
  "/badges/custom/community/community-coat-22.png",
  "/badges/custom/community/community-coat-23.png",
  "/badges/custom/community/community-coat-24.png",
  "/badges/custom/community/community-coat-25.png",
  "/badges/custom/community/community-coat-26.png",
  "/badges/custom/community/community-coat-27.png",
  "/badges/custom/community/community-coat-28.png",
  "/badges/custom/community/community-coat-29.png",
  "/badges/custom/community/community-coat-30.png",
  "/badges/custom/community/community-coat-31.png",
  "/badges/custom/community/community-coat-32.png",
  "/badges/custom/community/community-coat-33.png",
  "/badges/custom/community/community-coat-34.png",
  "/badges/custom/community/community-coat-35.png",
  "/badges/custom/community/community-coat-36.png",
  "/badges/custom/community/community-coat-37.png",
  "/badges/custom/community/community-coat-38.png",
  "/badges/custom/community/community-coat-39.png",
  "/badges/custom/community/community-coat-40.png",
  "/badges/custom/community/community-coat-41.png",
  "/badges/custom/community/community-coat-42.png",
  "/badges/custom/community/community-coat-43.png",
  "/badges/custom/community/community-coat-44.png",
  "/badges/custom/community/community-coat-45.png",
  "/badges/custom/community/community-coat-46.png",
  "/badges/custom/community/community-coat-47.png",
  "/badges/custom/community/community-coat-48.png",
] as const;

export const CUSTOM_SIDE_QUEST_BADGE_POOL = COMMUNITY_COAT_BADGE_POOL;

const CUSTOM_SIDE_QUEST_BADGE_SET = new Set<string>(CUSTOM_SIDE_QUEST_BADGE_POOL);
const DEFAULT_CUSTOM_SIDE_QUEST_BADGE = COMMUNITY_COAT_BADGE_POOL[0];

function hashCustomSideQuestId(id: string) {
  return Array.from(id).reduce((hash, character) => ((hash << 5) - hash + character.charCodeAt(0)) | 0, 0);
}

export function chooseCustomSideQuestBadge() {
  return CUSTOM_SIDE_QUEST_BADGE_POOL[Math.floor(Math.random() * CUSTOM_SIDE_QUEST_BADGE_POOL.length)] ?? DEFAULT_CUSTOM_SIDE_QUEST_BADGE;
}

export function getCustomSideQuestBadgeUrl(quest: Pick<CustomSideQuest, "id" | "badgeImageUrl">) {
  if (quest.badgeImageUrl && CUSTOM_SIDE_QUEST_BADGE_SET.has(quest.badgeImageUrl)) return quest.badgeImageUrl;
  const index = Math.abs(hashCustomSideQuestId(quest.id)) % CUSTOM_SIDE_QUEST_BADGE_POOL.length;
  return CUSTOM_SIDE_QUEST_BADGE_POOL[index] ?? DEFAULT_CUSTOM_SIDE_QUEST_BADGE;
}

export function getCustomSideQuests(metadata: Record<string, unknown>): CustomSideQuest[] {
  return Array.isArray(metadata.customSideQuests)
    ? metadata.customSideQuests.filter((entry): entry is CustomSideQuest => Boolean(entry && typeof entry === "object" && typeof (entry as CustomSideQuest).id === "string" && typeof (entry as CustomSideQuest).title === "string" && typeof (entry as CustomSideQuest).config === "string")).map(normalizeCustomSideQuestLifecycle)
    : [];
}

export function getCustomSideQuestById(metadata: Record<string, unknown>, id: string): CustomSideQuest | null {
  return getCustomSideQuests(metadata).find((quest) => quest.id === id) ?? null;
}

export function parseCustomRuleConfig(config: string): CustomSideQuestRuleConfig | null {
  try {
    const parsed = JSON.parse(config) as CustomSideQuestRuleConfig;
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.blocks) || !parsed.blocks.every(isValidCustomRuleBlock)) return null;
    return { version: Number(parsed.version) || 2, logic: parsed.logic === "any" ? "any" : "all", blocks: parsed.blocks.slice(0, 8) };
  } catch {
    return null;
  }
}

function isValidCustomRuleBlock(block: unknown): block is CustomSideQuestRuleBlock {
  if (!block || typeof block !== "object" || Array.isArray(block)) return false;
  const value = block as Record<string, unknown>;
  if (value.negate !== undefined && typeof value.negate !== "boolean") return false;
  if (!isValidTiming(value.timing)) return false;
  if (value.type === "gameResult") return value.result === "win" || value.result === "draw" || value.result === "lose";
  if (value.type === "moveSequence") return typeof value.sequence === "string";
  if (value.type === "openingSequence") return Array.isArray(value.moves)
    && value.moves.every(move => typeof move === "string")
    && (value.raw === undefined || typeof value.raw === "string")
    && (value.anchor === undefined || value.anchor === "gameStart");
  if (value.type !== "pieceState" || typeof value.piece !== "string") return false;
  const piece = value.piece;
  return ["king", "queen", "rook", "bishop", "knight", "pawn"].includes(piece)
    && isValidSelector(value.selector, piece)
    && typeof value.owner === "string"
    && ["my", "opponent", "either"].includes(value.owner)
    && typeof value.condition === "string"
    && ["gone", "still on board", "moved", "not moved", "captured", "on square"].includes(value.condition)
    && (value.targetSquare === undefined || value.targetSquare === null || typeof value.targetSquare === "string");
}

function isValidTiming(value: unknown) {
  if (value === undefined) return true;
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const timing = value as Record<string, unknown>;
  return isOptionalPositiveInteger(timing.byMove)
    && isOptionalPositiveInteger(timing.atMove)
    && (timing.atGameEnd === undefined || timing.atGameEnd === true);
}

function isValidSelector(value: unknown, piece: string) {
  if (value === undefined) return true;
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const selector = value as Record<string, unknown>;
  const identity = selector.identity;
  const validIdentity = identity === undefined
    || identity === "any"
    || ((piece === "king" || piece === "queen") && identity === "original")
    || ((piece === "rook" || piece === "bishop" || piece === "knight") && (identity === "queenside" || identity === "kingside"))
    || (piece === "pawn" && typeof identity === "string" && /^[a-h]-pawn$/.test(identity));
  return (selector.quantifier === undefined || (typeof selector.quantifier === "string" && ["any one", "at least", "exactly", "all"].includes(selector.quantifier)))
    && isOptionalPositiveInteger(selector.count)
    && isOptionalPositiveInteger(selector.maxAvailable)
    && validIdentity;
}

function isOptionalPositiveInteger(value: unknown) {
  return value === undefined || (typeof value === "number" && Number.isInteger(value) && value > 0);
}

export async function checkLatestCustomSideQuestForProvider(input: { quest: Pick<CustomSideQuest, "id" | "title" | "config">; provider: "lichess" | "chesscom"; username: string }): Promise<LatestChallengeVerdict> {
  let game: LatestGame | null;
  try {
    game = input.provider === "lichess" ? await fetchLatestLichessGame(input.username) : await fetchLatestChessComGame(input.username);
  } catch {
    game = null;
  }
  if (!game) return { status: "pending", gameId: `${input.provider}-custom-latest-unavailable`, summary: `Could not load a recent public ${input.provider === "lichess" ? "Lichess" : "Chess.com"} game for ${input.username}.`, evidence: ["Provider latest-game lookup returned no usable game."] };
  return evaluateCustomSideQuestGame(input.quest, input.provider, game);
}

export async function checkSubmittedCustomSideQuestForProvider(input: { quest: Pick<CustomSideQuest, "id" | "title" | "config">; provider: "lichess" | "chesscom"; username: string; gameId: string; activatedAfter?: string }): Promise<LatestChallengeVerdict> {
  const gameId = input.gameId.trim();
  if (!gameId) return { status: "pending", gameId: `${input.provider}-custom-game-missing`, summary: `Paste a ${input.provider === "lichess" ? "Lichess game ID" : "Chess.com game URL"} first.` };
  let game: LatestGame | null;
  try {
    game = input.provider === "lichess"
      ? await fetchSubmittedLichessGame(input.username, gameId)
      : await fetchSubmittedChessComGame(input.username, gameId, input.activatedAfter);
  } catch {
    game = null;
  }
  if (!game) return { status: "pending", gameId, summary: `Could not load public ${input.provider === "lichess" ? "Lichess" : "Chess.com"} game ${gameId} for ${input.username}.`, evidence: ["The exact-game lookup returned no usable owned game."] };
  return evaluateCustomSideQuestGame(input.quest, input.provider, game);
}

function evaluateCustomSideQuestGame(quest: Pick<CustomSideQuest, "id" | "title" | "config">, provider: "lichess" | "chesscom", game: LatestGame): LatestChallengeVerdict {
  const config = parseCustomRuleConfig(quest.config);
  if (!config?.blocks.length || !config.blocks.every(hasEvaluableSequence)) {
    return { status: "pending", gameId: `${provider}-custom-rule-invalid`, summary: "This custom Side Quest needs at least one launch-ready rule block before it can be checked.", evidence: ["Rule config was empty or invalid."] };
  }
  if (game.status !== "finished") return { status: "pending", gameId: game.gameId, summary: `Found ${game.gameId}, but the game is not finished yet.`, startedGameAt: game.startedGameAt, completedGameAt: game.completedGameAt, evidence: ["Only finished public games can complete a custom Side Quest."] };
  if (!game.replayComplete) return { status: "pending", gameId: game.gameId, summary: `Could not load public ${provider === "lichess" ? "Lichess" : "Chess.com"} game ${game.gameId} for ${game.username}.`, evidence: ["Provider replay evidence was incomplete or inconsistent."] };

  const replay = replayGame(game);
  if (!replay.snapshots.length) return { status: "pending", gameId: game.gameId, summary: `Could not load public ${provider === "lichess" ? "Lichess" : "Chess.com"} game ${game.gameId} for ${game.username}.` };
  const results = config.blocks.map((block) => evaluateBlock(block, game, replay));
  const passed = config.logic === "any" ? results.some((r) => r.passed) : results.every((r) => r.passed);
  const firstPassed = results.find((r) => r.passed) ?? null;
  const firstFailed = results.find((r) => !r.passed) ?? results[0];
  const final = replay.snapshots.at(-1);
  const proofSnapshot = passed ? firstPassed : null;
  return {
    status: passed ? "passed" : "failed",
    gameId: game.gameId,
    summary: passed ? `Verified ${game.gameId}. ${quest.title} is complete.` : `Side Quest not completed in ${game.gameId}. ${firstFailed?.explanation ?? "One custom condition did not match."}`,
    evidence: results.map((r, index) => `Condition ${index + 1}: ${r.passed ? "passed" : "not completed"}. ${r.explanation}`),
    startedGameAt: game.startedGameAt,
    completedGameAt: game.completedGameAt,
    playerColor: game.playerColor,
    outcome: game.outcome,
    finalPositionFen: proofSnapshot?.fenAtBreak ?? final?.fen,
    lastMoveUci: proofSnapshot?.uci ?? final?.uci,
    lastMoveSan: proofSnapshot?.san ?? final?.san,
    failureDiagnostic: passed ? undefined : { label: firstFailed?.label ?? "Custom rule", explanation: firstFailed?.explanation, moveNumber: firstFailed?.moveNumber ?? final?.moveNumber, ply: firstFailed?.ply ?? final?.ply, san: firstFailed?.san ?? final?.san, uci: firstFailed?.uci ?? final?.uci, fenAtBreak: firstFailed?.fenAtBreak ?? final?.fen, playerColor: game.playerColor },
  };
}

async function fetchLatestLichessGame(username: string): Promise<LatestGame | null> {
  if (!username.trim()) return null;
  const body = await fetchBoundedProviderText(`https://lichess.org/api/games/user/${encodeURIComponent(username.trim())}?max=1&moves=true&pgnInJson=true&opening=false&clocks=false&evals=false`, { headers: { Accept: "application/x-ndjson", "User-Agent": "cc-verifier/0.1 (+https://sidequestchess.com)" }, cache: "no-store" });
  if (body === null) return null;
  const [line] = body.split("\n").filter(Boolean);
  if (!line) return null;
  const game = JSON.parse(line) as { id?: string; status?: string; winner?: "white" | "black"; moves?: string; pgn?: string; variant?: unknown; initialFen?: unknown; createdAt?: number; lastMoveAt?: number; players?: { white?: { user?: { name?: string } }; black?: { user?: { name?: string } } } };
  if (typeof game.id !== "string" || !/^[A-Za-z0-9]{8}$/.test(game.id)) return null;
  const normalized = username.trim().toLowerCase();
  const white = game.players?.white?.user?.name?.toLowerCase();
  const black = game.players?.black?.user?.name?.toLowerCase();
  const playerColor = white === normalized ? "white" : black === normalized ? "black" : null;
  if (!playerColor) return null;
  const moveTokens = (game.moves ?? "").split(/\s+/).filter(Boolean);
  const uciMoves = moveTokens.length && moveTokens.every((token) => /^[a-h][1-8][a-h][1-8][qrbn]?$/i.test(token)) ? moveTokens : undefined;
  const providerMoves = game.moves === undefined ? undefined : canonicalReplayMoves(moveTokens, uciMoves !== undefined);
  const outcome = getLichessOutcome(game.status, game.winner, playerColor);
  const replayPgn = parseReplayPgn(game.pgn ?? game.moves ?? "");
  const pgnMoves = replayPgn?.moves ?? [];
  return { provider: "lichess", gameId: game.id ?? "lichess-latest-game", username, standardStart: (game.variant === undefined || game.variant === "standard") && hasStandardPgnStart(game.pgn ?? game.moves, game.initialFen), pgnMoves, uciMoves, replayComplete: matchesReplayIdentity(replayPgn, "lichess", game.id, white, black) && matchesLichessReplayTermination(replayPgn, game.status) && outcome !== "unknown" && (game.pgn === undefined ? replayPgn !== null && (replayPgn.result === undefined || hasCompleteReplayPgn(replayPgn, outcome, playerColor)) : hasCompleteReplayPgn(replayPgn, outcome, playerColor, providerMoves)) && hasLichessTerminalPosition(replayPgn, game.status, game.winner), playerColor, status: game.status && !["created", "started"].includes(game.status) ? "finished" : "open", outcome, startedGameAt: typeof game.createdAt === "number" ? new Date(game.createdAt).toISOString() : undefined, completedGameAt: typeof (game.lastMoveAt ?? game.createdAt) === "number" ? new Date((game.lastMoveAt ?? game.createdAt) as number).toISOString() : undefined };
}

async function fetchSubmittedLichessGame(username: string, gameId: string): Promise<LatestGame | null> {
  if (!username.trim() || !/^(?:[A-Za-z0-9]{8}|[A-Za-z0-9]{12})$/.test(gameId)) return null;
  const game = await fetchBoundedProviderJson(`https://lichess.org/game/export/${encodeURIComponent(gameId)}`, {
    headers: { Accept: "application/json", "User-Agent": "cc-verifier/0.1 (+https://sidequestchess.com)" },
    cache: "no-store",
  }) as { id?: string; status?: string; winner?: "white" | "black"; moves?: string; pgn?: string; variant?: unknown; initialFen?: unknown; createdAt?: number; lastMoveAt?: number; players?: { white?: { user?: { name?: string } }; black?: { user?: { name?: string } } } } | null;
  if (!game || game.id !== gameId.slice(0, 8)) return null;
  const normalized = username.trim().toLowerCase();
  const white = game.players?.white?.user?.name?.toLowerCase();
  const black = game.players?.black?.user?.name?.toLowerCase();
  const playerColor = white === normalized ? "white" : black === normalized ? "black" : null;
  if (!playerColor) return null;
  const moveTokens = (game.moves ?? "").split(/\s+/).filter(Boolean);
  const uciMoves = moveTokens.length && moveTokens.every((token) => /^[a-h][1-8][a-h][1-8][qrbn]?$/i.test(token)) ? moveTokens : undefined;
  const providerMoves = game.moves === undefined ? undefined : canonicalReplayMoves(moveTokens, uciMoves !== undefined);
  const outcome = getLichessOutcome(game.status, game.winner, playerColor);
  const replayPgn = parseReplayPgn(game.pgn ?? game.moves ?? "");
  const pgnMoves = replayPgn?.moves ?? [];
  return { provider: "lichess", gameId: game.id ?? gameId, username, standardStart: (game.variant === undefined || game.variant === "standard") && hasStandardPgnStart(game.pgn ?? game.moves, game.initialFen), pgnMoves, uciMoves, replayComplete: matchesReplayIdentity(replayPgn, "lichess", game.id, white, black) && matchesLichessReplayTermination(replayPgn, game.status) && outcome !== "unknown" && (game.pgn === undefined ? replayPgn !== null && (replayPgn.result === undefined || hasCompleteReplayPgn(replayPgn, outcome, playerColor)) : hasCompleteReplayPgn(replayPgn, outcome, playerColor, providerMoves)) && hasLichessTerminalPosition(replayPgn, game.status, game.winner), playerColor, status: game.status && !["created", "started"].includes(game.status) ? "finished" : "open", outcome, startedGameAt: typeof game.createdAt === "number" ? new Date(game.createdAt).toISOString() : undefined, completedGameAt: typeof (game.lastMoveAt ?? game.createdAt) === "number" ? new Date((game.lastMoveAt ?? game.createdAt) as number).toISOString() : undefined };
}

async function fetchLatestChessComGame(username: string): Promise<LatestGame | null> {
  if (!username.trim()) return null;
  const archivePayload = await fetchBoundedProviderJson(`https://api.chess.com/pub/player/${encodeURIComponent(username.trim())}/games/archives`, { headers: { Accept: "application/json", "User-Agent": "cc-verifier/0.1 (+https://sidequestchess.com)" }, cache: "no-store" }) as { archives?: string[] } | null;
  if (!archivePayload) return null;
  const archives = archivePayload.archives ?? [];
  const recentArchives = archives.slice(-3).reverse();
  if (!recentArchives.every((value) => isAuthenticatedChessComArchiveUrl(value, username))) return null;
  for (const archive of recentArchives) {
    const archiveGames = await fetchBoundedProviderJson(archive, { headers: { Accept: "application/json", "User-Agent": "cc-verifier/0.1 (+https://sidequestchess.com)" }, cache: "no-store" }) as { games?: Array<{ url?: string; pgn?: string; rules?: unknown; end_time?: number; white?: { username?: string; result?: string }; black?: { username?: string; result?: string } }> } | null;
    if (!archiveGames || !Array.isArray(archiveGames.games)) return null;
    const games = archiveGames.games;
    if (!games.length) continue;
    const game = games.at(-1);
    if (!game) return null;
    const normalizedUsername = username.trim().toLowerCase();
    const playerColor = game.white?.username?.toLowerCase() === normalizedUsername ? "white" : game.black?.username?.toLowerCase() === normalizedUsername ? "black" : null;
    if (!playerColor) return null;
    const gameUrl = game.url;
    const gameMode = gameUrl ? getChessComGameMode(gameUrl) : null;
    if (!gameMode || !gameUrl) return null;
    const outcome = getChessComOutcomeForPlayers(game.white?.result, game.black?.result, playerColor);
    const replayPgn = parseReplayPgn(game.pgn ?? "", gameMode === "daily");
    const completedGameAt = getChessComCompletedGameAt(game.end_time);
    return { provider: "chesscom", gameId: gameUrl, username, standardStart: (game.rules === undefined || game.rules === "chess") && hasStandardPgnStart(game.pgn), pgnMoves: replayPgn?.moves ?? [], replayComplete: matchesReplayIdentity(replayPgn, "chesscom", gameUrl, game.white?.username, game.black?.username) && matchesChessComReplayTermination(replayPgn, game.white?.result, game.black?.result, game.white?.username, game.black?.username) && hasCompleteReplayPgn(replayPgn, outcome, playerColor) && hasChessComTerminalPosition(replayPgn, game.white?.result, game.black?.result, gameMode), playerColor, status: completedGameAt ? "finished" : "open", outcome, startedGameAt: getChessComStartedGameAt(game.pgn), completedGameAt };
  }
  return null;
}

async function fetchSubmittedChessComGame(username: string, gameUrl: string, activatedAfter?: string): Promise<LatestGame | null> {
  if (!username.trim() || !/^https?:\/\/(?:www\.)?chess\.com\/game\/(?:live|daily)\/\d+/i.test(gameUrl)) return null;
  const headers = { Accept: "application/json", "User-Agent": "cc-verifier/0.1 (+https://sidequestchess.com)" };
  const archivePayload = await fetchBoundedProviderJson(`https://api.chess.com/pub/player/${encodeURIComponent(username.trim())}/games/archives`, { headers, cache: "no-store" }) as { archives?: string[] } | null;
  if (!archivePayload) return null;
  const archives = archivePayload.archives ?? [];
  const normalizedTarget = normalizeChessComGameUrl(gameUrl);
  const activationMonth = getUtcMonthKey(activatedAfter);
  const eligibleArchives = archives
    .filter((archive) => isAuthenticatedChessComArchiveUrl(archive, username))
    .filter((archive) => !activationMonth || getArchiveMonthKey(archive) >= activationMonth)
    .slice(-MAX_SUBMITTED_CHESSCOM_ARCHIVE_MONTHS)
    .reverse();
  for (const archive of eligibleArchives) {
    const archiveGames = await fetchBoundedProviderJson(archive, { headers, cache: "no-store" }) as { games?: Array<{ url?: string; pgn?: string; rules?: unknown; end_time?: number; white?: { username?: string; result?: string }; black?: { username?: string; result?: string } }> } | null;
    if (!archiveGames) continue;
    const games = archiveGames.games ?? [];
    const game = games.find((item) => item.url && normalizeChessComGameUrl(item.url) === normalizedTarget);
    if (!game) continue;
    const normalizedUsername = username.trim().toLowerCase();
    const playerColor = game.white?.username?.toLowerCase() === normalizedUsername ? "white" : game.black?.username?.toLowerCase() === normalizedUsername ? "black" : null;
    if (!playerColor) return null;
    const gameMode = getChessComGameMode(game.url ?? gameUrl);
    if (!gameMode) return null;
    const outcome = getChessComOutcomeForPlayers(game.white?.result, game.black?.result, playerColor);
    const replayPgn = parseReplayPgn(game.pgn ?? "", gameMode === "daily");
    const completedGameAt = getChessComCompletedGameAt(game.end_time);
    return { provider: "chesscom", gameId: game.url ?? gameUrl, username, standardStart: (game.rules === undefined || game.rules === "chess") && hasStandardPgnStart(game.pgn), pgnMoves: replayPgn?.moves ?? [], replayComplete: matchesReplayIdentity(replayPgn, "chesscom", game.url ?? gameUrl, game.white?.username, game.black?.username) && matchesChessComReplayTermination(replayPgn, game.white?.result, game.black?.result, game.white?.username, game.black?.username) && hasCompleteReplayPgn(replayPgn, outcome, playerColor) && hasChessComTerminalPosition(replayPgn, game.white?.result, game.black?.result, gameMode), playerColor, status: completedGameAt ? "finished" : "open", outcome, startedGameAt: getChessComStartedGameAt(game.pgn), completedGameAt };
  }
  return null;
}

function isAuthenticatedChessComArchiveUrl(value: unknown, username: string): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "api.chess.com" || url.port || url.search || url.hash) return false;
    const match = url.pathname.match(/^\/pub\/player\/([^/]+)\/games\/(\d{4})\/(0[1-9]|1[0-2])$/);
    return Boolean(match && decodeURIComponent(match[1]).toLowerCase() === username.trim().toLowerCase());
  } catch {
    return false;
  }
}

function getUtcMonthKey(value?: string): string | null {
  if (!value) return null;
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return null;
  const date = new Date(timestamp);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function getArchiveMonthKey(archive: string): string {
  const match = archive.match(/\/games\/(\d{4})\/(\d{2})(?:\/)?$/);
  return match ? `${match[1]}-${match[2]}` : "";
}

function normalizeChessComGameUrl(value: string) {
  return value.trim().toLowerCase().replace(/^http:/, "https:").replace("https://chess.com/", "https://www.chess.com/").replace(/[?#].*$/, "").replace(/\/$/, "");
}

function getChessComGameMode(value: string): "live" | "daily" | null {
  const match = normalizeChessComGameUrl(value).match(/^https:\/\/www\.chess\.com\/game\/(live|daily)\/\d+$/);
  return match?.[1] === "live" || match?.[1] === "daily" ? match[1] : null;
}

function getLichessOutcome(status: string | undefined, winner: unknown, playerColor: "white" | "black"): LatestGame["outcome"] {
  if (["draw", "stalemate"].includes(status ?? "")) return winner === undefined ? "draw" : "unknown";
  if (!["mate", "resign", "timeout", "outoftime"].includes(status ?? "")) return "unknown";
  if (["timeout", "outoftime"].includes(status ?? "") && winner === undefined) return "draw";
  if (winner === "white" || winner === "black") return winner === playerColor ? "win" : "lose";
  return "unknown";
}

function getChessComOutcome(result: string | undefined): LatestGame["outcome"] {
  if (result === "win") return "win";
  if (["agreed", "repetition", "stalemate", "insufficient", "50move", "timevsinsufficient"].includes(result ?? "")) return "draw";
  if (["checkmated", "resigned", "timeout", "abandoned", "lose"].includes(result ?? "")) return "lose";
  return "unknown";
}

function getChessComOutcomeForPlayers(whiteResult: string | undefined, blackResult: string | undefined, playerColor: "white" | "black"): LatestGame["outcome"] {
  const whiteOutcome = getChessComOutcome(whiteResult);
  const blackOutcome = getChessComOutcome(blackResult);
  const compatible = (whiteOutcome === "win" && blackOutcome === "lose")
    || (whiteOutcome === "lose" && blackOutcome === "win")
    || (whiteOutcome === "draw" && blackOutcome === "draw" && whiteResult === blackResult);
  if (!compatible) return "unknown";
  return playerColor === "white" ? whiteOutcome : blackOutcome;
}

function hasStandardPgnStart(pgn?: string, initialFen?: unknown): boolean {
  const standardFen = new Chess().fen();
  if (initialFen !== undefined && initialFen !== standardFen) return false;
  const tags = new Map<string, string>();
  for (const [name, value] of extractPgnSections(pgn ?? "").tags) {
    if (!new Set(["FEN", "Variant", "SetUp"]).has(name)) continue;
    if (tags.has(name)) return false;
    tags.set(name, value);
  }
  const fen = tags.get("FEN");
  const variant = tags.get("Variant");
  const setup = tags.get("SetUp");
  if (variant !== undefined && variant !== "Standard") return false;
  if (setup !== undefined && setup !== "0" && setup !== "1") return false;
  if (setup === "1" && fen === undefined) return false;
  return fen === undefined || fen === standardFen;
}

function extractPgnSections(pgn: string): { movetext: string; resultTags: string[]; tags: Array<[string, string]> } {
  const normalized = pgn.replace(/\r\n/g, "\n");
  const separator = /\n[ \t]*\n/.exec(normalized);
  const headerless = { movetext: normalized, resultTags: [], tags: [] as Array<[string, string]> };
  if (!separator) return headerless;
  const header = normalized.slice(0, separator.index);
  const tagPattern = /\[\s*([A-Za-z][A-Za-z0-9_]*)\s+"((?:\\.|[^"\\])*)"\s*\]/g;
  const tags: RegExpExecArray[] = [];
  let cursor = 0;
  for (const tag of header.matchAll(tagPattern)) {
    if (header.slice(cursor, tag.index).trim()) return headerless;
    tags.push(tag);
    cursor = (tag.index ?? 0) + tag[0].length;
  }
  if (!tags.length || header.slice(cursor).trim()) return headerless;
  const pairs = tags.map((tag): [string, string] => [tag[1], tag[2]]);
  if (new Set(pairs.map(([name]) => name)).size !== pairs.length) return headerless;
  return {
    movetext: normalized.slice(separator.index + separator[0].length),
    resultTags: pairs.filter(([name]) => name === "Result").map(([, value]) => value),
    tags: pairs,
  };
}

function stripPgnAnnotations(body: string): string | null {
  let movetext = "";
  let inLineComment = false;
  let inBraceComment = false;
  let variationDepth = 0;
  for (const char of body) {
    if (inLineComment) {
      if (char === "\r" || char === "\n") inLineComment = false;
      continue;
    }
    if (inBraceComment) {
      if (char === "}") inBraceComment = false;
      continue;
    }
    if (char === ";" || char === "{") {
      inLineComment = char === ";";
      inBraceComment = char === "{";
      if (variationDepth === 0) movetext += " ";
    } else if (char === "(") {
      if (variationDepth === 0) movetext += " ";
      variationDepth += 1;
    } else if (char === ")") {
      if (variationDepth === 0) return null;
      variationDepth -= 1;
    } else if (char === "}") {
      return null;
    } else if (variationDepth === 0) {
      movetext += char;
    }
  }
  return inBraceComment || variationDepth !== 0 ? null : movetext;
}

type ParsedReplayPgn = { moves: string[]; canonicalUci: string[]; result?: string; tags: Map<string, string> };

function replayPositionKey(chess: Chess): string {
  return chess.fen().split(" ").slice(0, 4).join(" ");
}

function replayHalfmoveClock(chess: Chess): number {
  return Number(chess.fen().split(" ")[4]);
}

function canonicalReplayMoves(tokens: string[], uci = false, allowHalfmoveContinuation = false): string[] | null {
  // chess.js's permissive parser can ignore suffixes; admit only whole SAN/UCI tokens.
  const moveToken = /^(?:[a-h][1-8][a-h][1-8][qrbn]?|(?:[KQRBN][a-h]?[1-8]?x?|[a-h]x)?[a-h][1-8](?:=[QRBN])?|O-O(?:-O)?|0-0(?:-0)?)[+#]?[!?]*$/;
  if (!tokens.every((token) => moveToken.test(token))) return null;
  const chess = new Chess();
  const repetitions = new Map([[replayPositionKey(chess), 1]]);
  try {
    return tokens.map((token) => {
      if (chess.isCheckmate() || chess.isStalemate() || chess.isInsufficientMaterial()) {
        throw new Error("Replay continues after automatic game termination.");
      }
      if ((repetitions.get(replayPositionKey(chess)) ?? 0) >= 5 || (!allowHalfmoveContinuation && replayHalfmoveClock(chess) >= 100)) {
        throw new Error("Replay continues after an automatic draw.");
      }
      let move;
      const semanticToken = token.replace(/[!?]+$/, "");
      const coordinateToken = semanticToken.replace(/[+#]$/, "");
      const coordinate = uci || /^[a-h][1-8][a-h][1-8][qrbn]?$/i.test(coordinateToken);
      const declaredSanPromotion = coordinate ? undefined : semanticToken.match(/=([QRBN])(?=[+#]?$)/)?.[1].toLowerCase();
      if (coordinate) {
        if (/[+#]$/.test(semanticToken)) throw new Error("UCI evidence cannot include SAN check semantics.");
        const from = coordinateToken.slice(0, 2).toLowerCase();
        const to = coordinateToken.slice(2, 4).toLowerCase();
        const promotion = coordinateToken[4]?.toLowerCase();
        const promotes = chess.get(from as Parameters<typeof chess.get>[0])?.type === "p" && /[18]$/.test(to);
        if (Boolean(promotion) !== promotes) throw new Error("Invalid UCI promotion evidence.");
        move = chess.move({ from, to, promotion });
      } else {
        move = chess.move(semanticToken, { strict: false });
        if (semanticToken.replace(/0/g, "O") !== move.san) {
          throw new Error("SAN evidence does not match the canonical move.");
        }
        if (Boolean(declaredSanPromotion) !== Boolean(move.promotion)
          || (declaredSanPromotion && declaredSanPromotion !== move.promotion)) {
          throw new Error("Invalid SAN promotion evidence.");
        }
      }
      if (move.san === "--") throw new Error("Null moves are not valid replay evidence.");
      const position = replayPositionKey(chess);
      repetitions.set(position, (repetitions.get(position) ?? 0) + 1);
      return `${move.from}${move.to}${move.promotion ?? ""}`;
    });
  } catch {
    return null;
  }
}

function parseReplayPgn(pgn: string, allowHalfmoveContinuation = false): ParsedReplayPgn | null {
  const { movetext, resultTags, tags } = extractPgnSections(pgn);
  const body = stripPgnAnnotations(movetext);
  if (body === null) return null;
  const moves: string[] = [];
  let result: string | undefined;
  const tokens = body.replace(/(\$\d+)/g, " $1 ").split(/\s+/).filter(Boolean);
  for (const rawToken of tokens) {
    // Comments and variations are gone; no mainline token may follow termination.
    if (result !== undefined) return null;
    const token = rawToken.replace(/^\d+\.{1,3}/, "");
    if (!token || /^\$\d+$/.test(token)) continue;
    if (/^(1-0|0-1|1\/2-1\/2|\*)$/.test(token)) result = token;
    else moves.push(token);
  }
  const canonicalUci = canonicalReplayMoves(moves, false, allowHalfmoveContinuation);
  if (!canonicalUci || resultTags.length > 1) return null;
  if (resultTags.some((tag) => tag !== result)) return null;
  const tagMap = new Map(tags);
  const plyCount = tagMap.get("PlyCount");
  if (plyCount !== undefined && (!/^(?:0|[1-9]\d*)$/.test(plyCount) || Number(plyCount) !== canonicalUci.length)) return null;
  return { moves, canonicalUci, result, tags: tagMap };
}

function matchesReplayIdentity(replay: ParsedReplayPgn | null, provider: LatestGame["provider"], gameId: string, white: string | undefined, black: string | undefined): boolean {
  if (!replay) return false;
  const declaredWhite = replay.tags.get("White");
  const declaredBlack = replay.tags.get("Black");
  if ((declaredWhite !== undefined && declaredWhite.toLowerCase() !== white?.toLowerCase())
    || (declaredBlack !== undefined && declaredBlack.toLowerCase() !== black?.toLowerCase())) return false;
  const declaredUrls = [
    ["Site", replay.tags.get("Site")],
    ["Link", replay.tags.get("Link")],
  ] as const;
  return declaredUrls.every(([tag, value]) => {
    if (value === undefined) return true;
    if (value !== value.trim()) return false;
    if (provider === "chesscom") {
      if (tag === "Site" && value.toLowerCase() === "chess.com") return true;
      return /^https:\/\/(?:www\.)?chess\.com\/game\/(?:live|daily)\/\d+\/?$/i.test(value)
        && normalizeChessComGameUrl(value) === normalizeChessComGameUrl(gameId);
    }
    const pathId = value.match(/^https:\/\/lichess\.org\/([A-Za-z0-9]{8}(?:[A-Za-z0-9]{4})?)$/i)?.[1];
    return pathId?.slice(0, 8) === gameId.slice(0, 8);
  });
}

function matchesLichessReplayTermination(replay: ParsedReplayPgn | null, status: string | undefined): boolean {
  const termination = replay?.tags.get("Termination")?.toLowerCase();
  if (termination === undefined) return true;
  if (termination === "time forfeit") return status === "timeout" || status === "outoftime";
  if (termination === "normal") return !["timeout", "outoftime"].includes(status ?? "");
  return false;
}

function matchesChessComReplayTermination(replay: ParsedReplayPgn | null, whiteResult: string | undefined, blackResult: string | undefined, whiteUsername: string | undefined, blackUsername: string | undefined): boolean {
  const termination = replay?.tags.get("Termination")?.toLowerCase();
  if (termination === undefined) return true;
  const results = [whiteResult, blackResult];
  const winner = whiteResult === "win" ? whiteUsername : blackResult === "win" ? blackUsername : undefined;
  const winnerPrefix = winner?.toLowerCase();
  if (winnerPrefix && termination === `${winnerPrefix} won by checkmate`) {
    return replayCanonicalPosition(replay)?.isCheckmate() === true && results.includes("checkmated");
  }
  if (winnerPrefix && termination === `${winnerPrefix} won by resignation`) return results.includes("resigned");
  if (winnerPrefix && termination === `${winnerPrefix} won on time`) return results.includes("timeout");
  if (winnerPrefix && termination === `${winnerPrefix} won by abandonment`) return results.includes("abandoned");
  if (termination === "game drawn by timeout vs insufficient material") return results.every((result) => result === "timevsinsufficient");
  if (termination === "game drawn by repetition") return results.every((result) => result === "repetition");
  if (termination === "game drawn by stalemate") return results.every((result) => result === "stalemate");
  if (termination === "game drawn by insufficient material") return results.every((result) => result === "insufficient");
  if (termination === "game drawn by agreement") return results.every((result) => result === "agreed");
  if (termination === "game drawn by 50-move rule") return results.every((result) => result === "50move");
  return false;
}

function replayCanonicalPosition(replay: ParsedReplayPgn | null): Chess | null {
  if (!replay) return null;
  const chess = new Chess();
  try {
    for (const token of replay.canonicalUci) {
      chess.move({
        from: token.slice(0, 2),
        to: token.slice(2, 4),
        promotion: token[4],
      });
    }
    return chess;
  } catch {
    return null;
  }
}

function getAutomaticReplayDraw(replay: ParsedReplayPgn | null): { fivefold: boolean; halfmove: boolean } | null {
  if (!replay) return null;
  const chess = new Chess();
  const repetitions = new Map([[replayPositionKey(chess), 1]]);
  try {
    for (const token of replay.canonicalUci) {
      chess.move({
        from: token.slice(0, 2),
        to: token.slice(2, 4),
        promotion: token[4],
      });
      const position = replayPositionKey(chess);
      repetitions.set(position, (repetitions.get(position) ?? 0) + 1);
    }
    return {
      fivefold: (repetitions.get(replayPositionKey(chess)) ?? 0) >= 5,
      halfmove: replayHalfmoveClock(chess) >= 100,
    };
  } catch {
    return null;
  }
}

function hasLichessTimeoutMatingMaterial(chess: Chess, color: "w" | "b"): boolean {
  const board = chess.board();
  const ownPieces = board.flat().filter((piece) => piece?.color === color && piece.type !== "k");
  if (ownPieces.length === 0) return false;
  if (ownPieces.length === 1 && ownPieces[0]?.type === "n") {
    const opponentPieces = board.flat().filter((piece) => piece !== null && piece.color !== color && piece.type !== "k");
    if (opponentPieces.every((piece) => piece?.type === "q")) return false;
  }
  if (ownPieces.every((piece) => piece?.type === "b")) {
    const bishopSquareColors = new Set<number>();
    board.forEach((rank, rankIndex) => rank.forEach((piece, fileIndex) => {
      if (piece?.type === "b") bishopSquareColors.add((rankIndex + fileIndex) % 2);
    }));
    const opponentHasKnightOrPawn = board.flat().some((piece) => piece !== null && piece.color !== color && (piece.type === "n" || piece.type === "p"));
    return bishopSquareColors.size > 1 || opponentHasKnightOrPawn;
  }
  return true;
}

function hasChessComAutomaticInsufficientMaterial(chess: Chess): boolean {
  const pieces = chess.board().flat().filter((piece): piece is NonNullable<typeof piece> => piece !== null && piece.type !== "k");
  if (pieces.some((piece) => piece.type === "p" || piece.type === "r" || piece.type === "q")) return false;
  const white = pieces.filter((piece) => piece.color === "w");
  const black = pieces.filter((piece) => piece.color === "b");
  if (white.length <= 1 && black.length <= 1) return true;
  return (white.length === 2 && white.every((piece) => piece.type === "n") && black.length === 0)
    || (black.length === 2 && black.every((piece) => piece.type === "n") && white.length === 0);
}

function replayContinuesAfterChessComAutomaticInsufficient(replay: ParsedReplayPgn): boolean {
  const chess = new Chess();
  for (const token of replay.canonicalUci) {
    if (hasChessComAutomaticInsufficientMaterial(chess)) return true;
    chess.move({
      from: token.slice(0, 2),
      to: token.slice(2, 4),
      promotion: token[4],
    });
  }
  return false;
}

function hasChessComTimeoutMatingMaterial(chess: Chess, color: "w" | "b"): boolean {
  const pieces = chess.board().flat().filter((piece) => piece?.color === color && piece.type !== "k");
  return pieces.some((piece) => piece?.type === "p" || piece?.type === "r" || piece?.type === "q")
    || pieces.length >= 2;
}

function hasLichessTerminalPosition(replay: ParsedReplayPgn | null, status: string | undefined, winner: unknown): boolean {
  const chess = replayCanonicalPosition(replay);
  if (!chess) return false;
  if (chess.isCheckmate()) {
    const checkmatingColor = chess.turn() === "w" ? "black" : "white";
    return status === "mate" && winner === checkmatingColor;
  }
  if (chess.isStalemate()) return status === "stalemate" && winner === undefined;
  if (chess.isInsufficientMaterial()) return status === "draw" && winner === undefined;
  const automaticDraw = getAutomaticReplayDraw(replay);
  if (automaticDraw?.fivefold || automaticDraw?.halfmove) return status === "draw" && winner === undefined;
  if (status === "timeout" && winner === undefined) return true;
  if (["timeout", "outoftime"].includes(status ?? "")) {
    const sideToMove = chess.turn() === "w" ? "white" : "black";
    const nonFlaggingColor = sideToMove === "white" ? "b" : "w";
    if (winner === undefined) return !hasLichessTimeoutMatingMaterial(chess, nonFlaggingColor);
    const winnerColor = winner === "white" ? "w" : winner === "black" ? "b" : null;
    return winner === (sideToMove === "white" ? "black" : "white")
      && winnerColor !== null
      && hasLichessTimeoutMatingMaterial(chess, winnerColor);
  }
  return status !== "mate" && status !== "stalemate";
}

function hasChessComTerminalPosition(replay: ParsedReplayPgn | null, whiteResult: string | undefined, blackResult: string | undefined, gameMode: "live" | "daily" = "live"): boolean {
  const chess = replayCanonicalPosition(replay);
  if (!chess) return false;
  if (replay && replayContinuesAfterChessComAutomaticInsufficient(replay)) return false;
  if (chess.isCheckmate()) {
    return chess.turn() === "w"
      ? whiteResult === "checkmated" && blackResult === "win"
      : blackResult === "checkmated" && whiteResult === "win";
  }
  if (chess.isStalemate()) return whiteResult === "stalemate" && blackResult === "stalemate";
  if (chess.isInsufficientMaterial() || hasChessComAutomaticInsufficientMaterial(chess)) return whiteResult === "insufficient" && blackResult === "insufficient";

  const results = [whiteResult, blackResult];
  const automaticDraw = getAutomaticReplayDraw(replay);
  if (automaticDraw?.fivefold || (gameMode === "live" && automaticDraw?.halfmove)) {
    return (automaticDraw.fivefold && results.every((result) => result === "repetition"))
      || (automaticDraw.halfmove && results.every((result) => result === "50move"));
  }
  if (results.some((result) => ["checkmated", "stalemate", "insufficient"].includes(result ?? ""))) return false;
  if (results.includes("timeout")) {
    const flaggingColor = chess.turn();
    const winnerColor = flaggingColor === "w" ? "b" : "w";
    return (flaggingColor === "w"
      ? whiteResult === "timeout" && blackResult === "win"
      : blackResult === "timeout" && whiteResult === "win")
      && hasChessComTimeoutMatingMaterial(chess, winnerColor);
  }
  if (results.includes("repetition")) return chess.isThreefoldRepetition();
  if (results.includes("50move")) return chess.isDrawByFiftyMoves();
  if (results.includes("timevsinsufficient")) {
    const nonFlaggingColor = chess.turn() === "w" ? "b" : "w";
    return !hasChessComTimeoutMatingMaterial(chess, nonFlaggingColor);
  }
  return true;
}

function hasCompleteReplayPgn(replay: ParsedReplayPgn | null, outcome: LatestGame["outcome"], playerColor: LatestGame["playerColor"], providerMoves?: string[] | null) {
  if (!replay?.result || replay.result === "*") return false;
  const pgnOutcome = replay.result === "1/2-1/2" ? "draw"
    : (replay.result === "1-0") === (playerColor === "white") ? "win" : "lose";
  if (outcome === "unknown" || outcome !== pgnOutcome) return false;
  if (providerMoves === undefined) return true;
  return providerMoves !== null && providerMoves.length === replay.canonicalUci.length
    && providerMoves.every((move, index) => move === replay.canonicalUci[index]);
}

function getChessComStartedGameAt(pgn?: string) {
  const date = pgn?.match(/\[UTCDate "([^"?]+)"\]/)?.[1] ?? pgn?.match(/\[Date "([^"?]+)"\]/)?.[1];
  const time = pgn?.match(/\[UTCTime "([^"?]+)"\]/)?.[1] ?? pgn?.match(/\[StartTime "([^"?]+)"\]/)?.[1] ?? "00:00:00";
  if (!date) return undefined;
  const parsed = Date.parse(`${date}T${time}Z`);
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : undefined;
}

function getChessComCompletedGameAt(value: unknown): string | undefined {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value <= 0) return undefined;
  const timestamp = value * 1000;
  if (!Number.isFinite(timestamp)) return undefined;
  const date = new Date(timestamp);
  return Number.isFinite(date.getTime()) ? date.toISOString() : undefined;
}

type Snapshot = { ply: number; moveNumber: number; fen: string; san?: string; uci?: string; before: Map<string, { type: string; color: "w" | "b"; origin: string; moved: boolean }>; after: Map<string, { type: string; color: "w" | "b"; origin: string; moved: boolean }> };
function replayGame(game: LatestGame) {
  if (!game.standardStart) return { snapshots: [] };
  const chess = new Chess();
  let pieces = initialPieces();
  const snapshots: Snapshot[] = [];
  const moves = game.uciMoves?.length ? game.uciMoves : game.pgnMoves;
  for (const token of moves) {
    const before = clonePieces(pieces);
    let move = null;
    try {
      move = game.uciMoves?.length && /^[a-h][1-8][a-h][1-8][qrbn]?$/i.test(token)
        ? chess.move({ from: token.slice(0, 2), to: token.slice(2, 4), promotion: token[4] })
        : chess.move(token, { strict: false });
    } catch {
      return { snapshots: [] };
    }
    if (!move) return { snapshots: [] };
    pieces = applyMovePieces(pieces, move);
    snapshots.push({ ply: snapshots.length + 1, moveNumber: Math.ceil((snapshots.length + 1) / 2), fen: chess.fen(), san: move.san, uci: `${move.from}${move.to}${move.promotion ?? ""}`, before, after: clonePieces(pieces) });
  }
  return { snapshots };
}
function initialPieces() { const map = new Map<string, { type: string; color: "w" | "b"; origin: string; moved: boolean }>(); for (const color of ["white", "black"] as const) for (const [piece, entries] of Object.entries(HOME_SQUARES[color])) for (const sq of Object.values(entries)) map.set(sq, { type: PIECE_TYPE[piece], color: color === "white" ? "w" : "b", origin: sq, moved: false }); return map; }
function clonePieces(input: Map<string, { type: string; color: "w" | "b"; origin: string; moved: boolean }>) { return new Map([...input.entries()].map(([k, v]) => [k, { ...v }])); }
function applyMovePieces(input: Map<string, { type: string; color: "w" | "b"; origin: string; moved: boolean }>, move: { from: string; to: string; flags: string; color: "w" | "b"; piece: string; promotion?: string }) { const next = clonePieces(input); const moving = next.get(move.from) ?? { type: move.piece, color: move.color, origin: move.from, moved: false }; next.delete(move.from); if (move.flags.includes("e")) next.delete(`${move.to[0]}${move.from[1]}`); next.set(move.to, { ...moving, type: move.promotion ?? moving.type, moved: true }); if (move.flags.includes("k")) { const r = move.color === "w" ? "1" : "8"; const rook = next.get(`h${r}`); if (rook) { next.delete(`h${r}`); next.set(`f${r}`, { ...rook, moved: true }); } } if (move.flags.includes("q")) { const r = move.color === "w" ? "1" : "8"; const rook = next.get(`a${r}`); if (rook) { next.delete(`a${r}`); next.set(`d${r}`, { ...rook, moved: true }); } } return next; }

type EvalResult = { passed: boolean; label: string; explanation: string; ply?: number; moveNumber?: number; san?: string; uci?: string; fenAtBreak?: string };
function evaluateBlock(block: CustomSideQuestRuleBlock, game: LatestGame, replay: { snapshots: Snapshot[] }): EvalResult {
  const snapshot = pickSnapshot(block, replay);
  let base: EvalResult;
  if (block.type === "openingSequence") base = evalOpeningSequence(block.moves, replay, snapshot);
  else if (block.type === "moveSequence") base = evalSequence(block, replay, snapshot);
  else if (block.type === "gameResult") base = evalGameResult(block, game, replay.snapshots.at(-1));
  else base = evalPieceState(block, game, snapshot, replay);
  return block.negate ? { ...base, passed: !base.passed, explanation: base.passed ? `This condition happened, but the Side Quest required it not to happen.` : `The forbidden condition did not happen.` } : base;
}
function pickSnapshot(block: CustomSideQuestRuleBlock, replay: { snapshots: Snapshot[] }) { if (block.type !== "pieceState" && block.type !== "moveSequence") return replay.snapshots.at(-1); const moveNo = block.timing && "atMove" in block.timing ? block.timing.atMove : block.timing && "byMove" in block.timing ? block.timing.byMove : undefined; return moveNo ? replay.snapshots[Math.min(replay.snapshots.length - 1, Math.max(0, moveNo * 2 - 1))] : replay.snapshots.at(-1); }
function normalizeMoveToken(value: string) { return value.trim().replace(/[+#?!]+$/g, "").replace(/0/g, "O"); }
type SequencePiece = "Q" | "R" | "B" | "N";
type SequenceSquare = readonly [file: number, rank: number];
const sequenceSquares: SequenceSquare[] = Array.from({ length: 64 }, (_, index) => [index % 8, Math.floor(index / 8)] as const);
function canSequencePieceReach(kind: SequencePiece, source: SequenceSquare, destination: SequenceSquare) {
  const fileDistance = Math.abs(source[0] - destination[0]);
  const rankDistance = Math.abs(source[1] - destination[1]);
  if (!fileDistance && !rankDistance) return false;
  if (kind === "N") return fileDistance * rankDistance === 2;
  if (kind === "B") return fileDistance === rankDistance;
  if (kind === "R") return fileDistance === 0 || rankDistance === 0;
  return fileDistance === 0 || rankDistance === 0 || fileDistance === rankDistance;
}
function canSequencePieceReachWithSources(kind: SequencePiece, source: SequenceSquare, destination: SequenceSquare, sources: SequenceSquare[]) {
  if (!canSequencePieceReach(kind, source, destination)) return false;
  if (kind === "N") return true;
  const fileStep = Math.sign(destination[0] - source[0]);
  const rankStep = Math.sign(destination[1] - source[1]);
  for (let file = source[0] + fileStep, rank = source[1] + rankStep; file !== destination[0] || rank !== destination[1]; file += fileStep, rank += rankStep) {
    if (sources.some((candidate) => candidate !== source && candidate[0] === file && candidate[1] === rank)) return false;
  }
  return true;
}
function hasCanonicalSequenceDisambiguation(kind: SequencePiece, disambiguation: string, destinationFile: string, destinationRank: string) {
  const destination: SequenceSquare = [destinationFile.charCodeAt(0) - 97, Number(destinationRank) - 1];
  const sources = sequenceSquares.filter(([file, rank]) => disambiguation.length === 2
    ? file === disambiguation.charCodeAt(0) - 97 && rank === Number(disambiguation[1]) - 1
    : /^[a-h]$/.test(disambiguation) ? file === disambiguation.charCodeAt(0) - 97 : rank === Number(disambiguation) - 1);
  if (disambiguation.length === 1 && /^[a-h]$/.test(disambiguation)) {
    return sources.some((source) => sequenceSquares.some((alternate) => alternate[0] !== source[0]
      && [source, alternate].every((candidate) => canSequencePieceReachWithSources(kind, candidate, destination, [source, alternate]))));
  }
  if (disambiguation.length === 1) {
    return sources.some((source) => sequenceSquares.some((alternate) => alternate[0] === source[0] && alternate[1] !== source[1]
      && [source, alternate].every((candidate) => canSequencePieceReachWithSources(kind, candidate, destination, [source, alternate]))));
  }
  return sources.some((source) => sequenceSquares.some((sameRank) => sameRank[1] === source[1] && sameRank[0] !== source[0]
    && sequenceSquares.some((sameFile) => sameFile[0] === source[0] && sameFile[1] !== source[1]
      && [source, sameRank, sameFile].every((candidate) => canSequencePieceReachWithSources(kind, candidate, destination, [source, sameRank, sameFile])))));
}
function isEvaluableMoveToken(value: string) {
  const token = normalizeMoveToken(value);
  if (!token || /\s/.test(token) || /^\$\d+$/.test(token) || /^\d+\.{1,3}$/.test(token) || /^(?:1-0|0-1|1\/2-1\/2|\*)$/.test(value.trim())) return false;
  const pawn = token.match(/^([a-h])(?:x([a-h]))?([1-8])(=[QRBN])?$/);
  if (pawn) {
    const [, sourceFile, destinationFile, rank, promotion] = pawn;
    if (destinationFile && Math.abs(destinationFile.charCodeAt(0) - sourceFile.charCodeAt(0)) !== 1) return false;
    return rank === "1" || rank === "8" ? Boolean(promotion) : !promotion;
  }
  if (/^(?:O-O(?:-O)?|Kx?[a-h][1-8])$/.test(token)) return true;
  const piece = token.match(/^([QRBN])([a-h]|[1-8]|[a-h][1-8])?x?([a-h])([1-8])$/);
  if (!piece) return false;
  const [, kind, disambiguation, destinationFile, destinationRank] = piece;
  if (!disambiguation) return true;
  return hasCanonicalSequenceDisambiguation(kind as SequencePiece, disambiguation, destinationFile, destinationRank);
}
function hasValidSequenceTokens(value: string) { const tokens = value.split(/\s+/).filter(Boolean); return tokens.length > 0 && tokens.every(isEvaluableMoveToken); }
function hasEvaluableSequence(block: CustomSideQuestRuleBlock) { return block.type === "moveSequence" ? hasValidSequenceTokens(block.sequence) : block.type !== "openingSequence" || (block.moves.length > 0 && block.moves.every(isEvaluableMoveToken)); }
function sequenceMatchesAt(expected: string[], actual: string[], start: number) { return start >= 0 && start + expected.length <= actual.length && expected.every((token, index) => normalizeMoveToken(actual[start + index]) === normalizeMoveToken(token)); }
function sequenceResult(passed: boolean, snapshot: Snapshot | undefined, explanation: string): EvalResult { return { passed, label: "Move sequence", explanation, ply: snapshot?.ply, moveNumber: snapshot?.moveNumber, san: snapshot?.san, uci: snapshot?.uci, fenAtBreak: snapshot?.fen }; }
function replaySanMoves(replay: { snapshots: Snapshot[] }) { return replay.snapshots.map((item) => item.san).filter((item): item is string => Boolean(item)); }
function evalOpeningSequence(expected: string[], replay: { snapshots: Snapshot[] }, snapshot?: Snapshot): EvalResult {
  const actual = replaySanMoves(replay);
  const passed = sequenceMatchesAt(expected, actual, 0);
  const matchedSnapshot = passed ? replay.snapshots[expected.length - 1] : undefined;
  return sequenceResult(passed, matchedSnapshot ?? snapshot, passed ? `The game followed ${expected.join(" ")}.` : `Expected ${expected.join(" ")}, but the latest game began ${actual.slice(0, Math.max(expected.length, 1)).join(" ") || "with no parsed moves"}.`);
}
function evalSequence(block: Extract<CustomSideQuestRuleBlock, { type: "moveSequence" }>, replay: { snapshots: Snapshot[] }, fallbackSnapshot?: Snapshot): EvalResult {
  const expected = block.sequence.split(/\s+/).filter(Boolean);
  const actual = replaySanMoves(replay);
  if (block.timing?.atMove) {
    const targetMove = block.timing.atMove;
    const targetEndPlies = [targetMove * 2 - 1, targetMove * 2];
    const matchedEndPly = targetEndPlies.find((endPly) => endPly <= actual.length && sequenceMatchesAt(expected, actual, endPly - expected.length));
    const matchedSnapshot = matchedEndPly ? replay.snapshots[matchedEndPly - 1] : undefined;
    return sequenceResult(Boolean(matchedSnapshot), matchedSnapshot ?? fallbackSnapshot, matchedSnapshot ? `The game followed ${expected.join(" ")} at move ${targetMove}.` : `Expected ${expected.join(" ")} to finish at move ${targetMove}.`);
  }
  if (block.timing?.byMove) {
    const deadlineMove = block.timing.byMove;
    const deadlinePly = Math.min(actual.length, deadlineMove * 2);
    const matchedEndPly = Array.from({ length: Math.max(0, deadlinePly - expected.length + 1) }, (_, index) => expected.length + index)
      .find((endPly) => sequenceMatchesAt(expected, actual, endPly - expected.length));
    const matchedSnapshot = matchedEndPly ? replay.snapshots[matchedEndPly - 1] : undefined;
    return sequenceResult(Boolean(matchedSnapshot), matchedSnapshot ?? fallbackSnapshot, matchedSnapshot ? `The game followed ${expected.join(" ")} by move ${deadlineMove}.` : `Expected ${expected.join(" ")} to finish by move ${deadlineMove}.`);
  }
  const matchedEndPly = Array.from({ length: Math.max(0, actual.length - expected.length + 1) }, (_, index) => expected.length + index)
    .find((endPly) => sequenceMatchesAt(expected, actual, endPly - expected.length));
  const matchedSnapshot = matchedEndPly ? replay.snapshots[matchedEndPly - 1] : undefined;
  return sequenceResult(Boolean(matchedSnapshot), matchedSnapshot ?? fallbackSnapshot, matchedSnapshot ? `The game included ${expected.join(" ")}.` : `Expected the game to include ${expected.join(" ")}.`);
}
function evalGameResult(block: Extract<CustomSideQuestRuleBlock, { type: "gameResult" }>, game: LatestGame, snapshot?: Snapshot): EvalResult {
  const passed = game.outcome === block.result;
  return { passed, label: "Game result", explanation: passed ? `Game result was ${block.result}.` : `Game result was ${game.outcome === "unknown" ? "unknown" : game.outcome}, but needed ${block.result}.`, ply: snapshot?.ply, moveNumber: snapshot?.moveNumber, san: snapshot?.san, uci: snapshot?.uci, fenAtBreak: snapshot?.fen };
}

function evalPieceState(block: Extract<CustomSideQuestRuleBlock, { type: "pieceState" }>, game: LatestGame, snapshot: Snapshot | undefined, replay?: { snapshots: Snapshot[] }): EvalResult {
  if (block.timing && "byMove" in block.timing && replay?.snapshots.length) {
    const deadlinePly = Math.max(1, block.timing.byMove ?? 1) * 2;
    const candidates = replay.snapshots.filter((candidate) => candidate.ply <= deadlinePly);
    const evaluated = candidates.map((candidate) => evalPieceStateAtSnapshot(block, game, candidate));
    const passing = evaluated.find((result) => result.passed);
    if (passing) return { ...passing, explanation: `${passing.explanation} Condition happened by move ${block.timing.byMove}.` };
    return evaluated.at(-1) ?? evalPieceStateAtSnapshot(block, game, snapshot);
  }
  return evalPieceStateAtSnapshot(block, game, snapshot);
}

function evalPieceStateAtSnapshot(block: Extract<CustomSideQuestRuleBlock, { type: "pieceState" }>, game: LatestGame, snapshot?: Snapshot): EvalResult {
  const board = snapshot?.after ?? new Map();
  const colorFilter = block.owner === "my" ? [game.playerColor === "white" ? "w" : "b"] : block.owner === "opponent" ? [game.playerColor === "white" ? "b" : "w"] : ["w", "b"];
  const identity = block.selector?.identity ?? "any";
  const origins = colorFilter.flatMap((c) => candidateOrigins(block.piece, c === "w" ? "white" : "black", identity));
  const located = origins.map((origin) => ({ origin, entry: [...board.entries()].find(([, p]) => p.origin === origin) }));
  const count = located.filter(({ entry }) => conditionMatches(block, entry?.[0] ?? null, entry?.[1] ?? null)).length;
  const required = block.selector?.quantifier === "all" ? origins.length : Math.max(1, block.selector?.count ?? 1);
  const quantifier = block.selector?.quantifier ?? "any one";
  const passed = quantifier === "exactly" ? count === required : quantifier === "all" ? count === origins.length : count >= required;
  return { passed, label: "Piece condition", explanation: passed ? `Matched ${count} piece${count === 1 ? "" : "s"}.` : `Matched ${count}, but needed ${quantifier === "exactly" ? "exactly" : "at least"} ${required}.`, ply: snapshot?.ply, moveNumber: snapshot?.moveNumber, san: snapshot?.san, uci: snapshot?.uci, fenAtBreak: snapshot?.fen };
}
function candidateOrigins(piece: string, color: "white" | "black", identity: string) { const entries = HOME_SQUARES[color][piece] ?? {}; const entryKey = piece === "pawn" && /^[a-h]-pawn$/.test(identity) ? identity[0] : identity; if (identity !== "any" && entries[entryKey]) return [entries[entryKey]]; return Object.values(entries); }
function conditionMatches(block: Extract<CustomSideQuestRuleBlock, { type: "pieceState" }>, square: string | null, piece: { moved: boolean } | null) { if (block.condition === "gone" || block.condition === "captured") return !piece; if (!piece || !square) return false; if (block.condition === "moved") return piece.moved; if (block.condition === "not moved") return !piece.moved; if (block.condition === "on square") return square === block.targetSquare; return true; }
