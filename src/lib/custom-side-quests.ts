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
    ? metadata.customSideQuests.filter((entry): entry is CustomSideQuest => Boolean(entry && typeof entry === "object" && typeof (entry as CustomSideQuest).id === "string" && typeof (entry as CustomSideQuest).title === "string" && typeof (entry as CustomSideQuest).config === "string")).map(normalizeCustomSideQuestLifecycle).slice(0, 20)
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
  if (value.type !== "pieceState" || !isValidSelector(value.selector)) return false;
  return ["king", "queen", "rook", "bishop", "knight", "pawn"].includes(String(value.piece))
    && ["my", "opponent", "either"].includes(String(value.owner))
    && ["gone", "still on board", "moved", "not moved", "captured", "on square"].includes(String(value.condition))
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

function isValidSelector(value: unknown) {
  if (value === undefined) return true;
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const selector = value as Record<string, unknown>;
  return (selector.quantifier === undefined || ["any one", "at least", "exactly", "all"].includes(String(selector.quantifier)))
    && isOptionalPositiveInteger(selector.count)
    && isOptionalPositiveInteger(selector.maxAvailable)
    && (selector.identity === undefined || typeof selector.identity === "string");
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
  if (!config?.blocks.length) {
    return { status: "pending", gameId: `${provider}-custom-rule-invalid`, summary: "This custom Side Quest needs at least one launch-ready rule block before it can be checked.", evidence: ["Rule config was empty or invalid."] };
  }
  if (game.status !== "finished") return { status: "pending", gameId: game.gameId, summary: `Found ${game.gameId}, but the game is not finished yet.`, startedGameAt: game.startedGameAt, completedGameAt: game.completedGameAt, evidence: ["Only finished public games can complete a custom Side Quest."] };

  const replay = replayGame(game);
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
  const game = JSON.parse(line) as { id?: string; status?: string; winner?: "white" | "black"; moves?: string; pgn?: string; createdAt?: number; lastMoveAt?: number; players?: { white?: { user?: { name?: string } }; black?: { user?: { name?: string } } } };
  const normalized = username.trim().toLowerCase();
  const white = game.players?.white?.user?.name?.toLowerCase();
  const black = game.players?.black?.user?.name?.toLowerCase();
  const playerColor = white === normalized ? "white" : black === normalized ? "black" : null;
  if (!playerColor) return null;
  const moveTokens = (game.moves ?? "").split(/\s+/).filter(Boolean);
  const uciMoves = moveTokens.length && moveTokens.every((token) => /^[a-h][1-8][a-h][1-8][qrbn]?$/i.test(token)) ? moveTokens : undefined;
  return { provider: "lichess", gameId: game.id ?? "lichess-latest-game", username, pgnMoves: extractSanMoveTokens(game.pgn ?? game.moves ?? ""), uciMoves, playerColor, status: game.status && !["created", "started"].includes(game.status) ? "finished" : "open", outcome: getLichessOutcome(game.status, game.winner, playerColor), startedGameAt: typeof game.createdAt === "number" ? new Date(game.createdAt).toISOString() : undefined, completedGameAt: typeof (game.lastMoveAt ?? game.createdAt) === "number" ? new Date((game.lastMoveAt ?? game.createdAt) as number).toISOString() : undefined };
}

async function fetchSubmittedLichessGame(username: string, gameId: string): Promise<LatestGame | null> {
  if (!username.trim() || !/^[A-Za-z0-9]{8,12}$/.test(gameId)) return null;
  const game = await fetchBoundedProviderJson(`https://lichess.org/game/export/${encodeURIComponent(gameId)}`, {
    headers: { Accept: "application/json", "User-Agent": "cc-verifier/0.1 (+https://sidequestchess.com)" },
    cache: "no-store",
  }) as { id?: string; status?: string; winner?: "white" | "black"; moves?: string; pgn?: string; createdAt?: number; lastMoveAt?: number; players?: { white?: { user?: { name?: string } }; black?: { user?: { name?: string } } } } | null;
  if (!game) return null;
  const normalized = username.trim().toLowerCase();
  const white = game.players?.white?.user?.name?.toLowerCase();
  const black = game.players?.black?.user?.name?.toLowerCase();
  const playerColor = white === normalized ? "white" : black === normalized ? "black" : null;
  if (!playerColor) return null;
  const moveTokens = (game.moves ?? "").split(/\s+/).filter(Boolean);
  const uciMoves = moveTokens.length && moveTokens.every((token) => /^[a-h][1-8][a-h][1-8][qrbn]?$/i.test(token)) ? moveTokens : undefined;
  return { provider: "lichess", gameId: game.id ?? gameId, username, pgnMoves: extractSanMoveTokens(game.pgn ?? game.moves ?? ""), uciMoves, playerColor, status: game.status && !["created", "started"].includes(game.status) ? "finished" : "open", outcome: getLichessOutcome(game.status, game.winner, playerColor), startedGameAt: typeof game.createdAt === "number" ? new Date(game.createdAt).toISOString() : undefined, completedGameAt: typeof (game.lastMoveAt ?? game.createdAt) === "number" ? new Date((game.lastMoveAt ?? game.createdAt) as number).toISOString() : undefined };
}

async function fetchLatestChessComGame(username: string): Promise<LatestGame | null> {
  if (!username.trim()) return null;
  const archivePayload = await fetchBoundedProviderJson(`https://api.chess.com/pub/player/${encodeURIComponent(username.trim())}/games/archives`, { headers: { Accept: "application/json", "User-Agent": "cc-verifier/0.1 (+https://sidequestchess.com)" }, cache: "no-store" }) as { archives?: string[] } | null;
  if (!archivePayload) return null;
  const archives = archivePayload.archives ?? [];
  for (const archive of archives.filter((value) => isAuthenticatedChessComArchiveUrl(value, username)).slice(-3).reverse()) {
    const archiveGames = await fetchBoundedProviderJson(archive, { headers: { Accept: "application/json", "User-Agent": "cc-verifier/0.1 (+https://sidequestchess.com)" }, cache: "no-store" }) as { games?: Array<{ url?: string; pgn?: string; end_time?: number; white?: { username?: string; result?: string }; black?: { username?: string; result?: string } }> } | null;
    if (!archiveGames) continue;
    const games = archiveGames.games ?? [];
    const game = games.reverse().find((item) => item.white?.username?.toLowerCase() === username.trim().toLowerCase() || item.black?.username?.toLowerCase() === username.trim().toLowerCase());
    if (!game) continue;
    const playerColor = game.white?.username?.toLowerCase() === username.trim().toLowerCase() ? "white" : "black";
    return { provider: "chesscom", gameId: game.url ?? "chesscom-latest-game", username, pgnMoves: extractSanMoveTokens(game.pgn ?? ""), playerColor, status: game.end_time ? "finished" : "open", outcome: getChessComOutcome(playerColor === "white" ? game.white?.result : game.black?.result), startedGameAt: getChessComStartedGameAt(game.pgn), completedGameAt: game.end_time ? new Date(game.end_time * 1000).toISOString() : undefined };
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
    const archiveGames = await fetchBoundedProviderJson(archive, { headers, cache: "no-store" }) as { games?: Array<{ url?: string; pgn?: string; end_time?: number; white?: { username?: string; result?: string }; black?: { username?: string; result?: string } }> } | null;
    if (!archiveGames) continue;
    const games = archiveGames.games ?? [];
    const game = games.find((item) => item.url && normalizeChessComGameUrl(item.url) === normalizedTarget);
    if (!game) continue;
    const normalizedUsername = username.trim().toLowerCase();
    const playerColor = game.white?.username?.toLowerCase() === normalizedUsername ? "white" : game.black?.username?.toLowerCase() === normalizedUsername ? "black" : null;
    if (!playerColor) return null;
    return { provider: "chesscom", gameId: game.url ?? gameUrl, username, pgnMoves: extractSanMoveTokens(game.pgn ?? ""), playerColor, status: game.end_time ? "finished" : "open", outcome: getChessComOutcome(playerColor === "white" ? game.white?.result : game.black?.result), startedGameAt: getChessComStartedGameAt(game.pgn), completedGameAt: game.end_time ? new Date(game.end_time * 1000).toISOString() : undefined };
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

function getLichessOutcome(status: string | undefined, winner: "white" | "black" | undefined, playerColor: "white" | "black"): LatestGame["outcome"] {
  if (winner === playerColor) return "win";
  if (winner && winner !== playerColor) return "lose";
  if (["draw", "stalemate"].includes(status ?? "")) return "draw";
  return "unknown";
}

function getChessComOutcome(result: string | undefined): LatestGame["outcome"] {
  if (result === "win") return "win";
  if (["agreed", "repetition", "stalemate", "insufficient", "50move", "timevsinsufficient"].includes(result ?? "")) return "draw";
  if (result) return "lose";
  return "unknown";
}

function extractSanMoveTokens(pgn: string): string[] {
  const body = pgn.includes("\n\n") ? pgn.split(/\r?\n\r?\n/).slice(1).join("\n") : pgn;
  return body.replace(/\{[^}]*\}/g, " ").replace(/\([^)]*\)/g, " ").split(/\s+/).map((token) => token.trim()).filter(Boolean).filter((token) => !/^\d+\.{1,3}$/.test(token) && !/^(1-0|0-1|1\/2-1\/2|\*)$/.test(token)).map((token) => token.replace(/^\d+\.{1,3}/, "").replace(/\$\d+/g, "")).filter(Boolean);
}

function getChessComStartedGameAt(pgn?: string) {
  const date = pgn?.match(/\[UTCDate "([^"?]+)"\]/)?.[1] ?? pgn?.match(/\[Date "([^"?]+)"\]/)?.[1];
  const time = pgn?.match(/\[UTCTime "([^"?]+)"\]/)?.[1] ?? pgn?.match(/\[StartTime "([^"?]+)"\]/)?.[1] ?? "00:00:00";
  if (!date) return undefined;
  const parsed = Date.parse(`${date}T${time}Z`);
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : undefined;
}

type Snapshot = { ply: number; moveNumber: number; fen: string; san?: string; uci?: string; before: Map<string, { type: string; color: "w" | "b"; origin: string; moved: boolean }>; after: Map<string, { type: string; color: "w" | "b"; origin: string; moved: boolean }> };
function replayGame(game: LatestGame) {
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
      continue;
    }
    if (!move) continue;
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
  if (block.type === "openingSequence") base = evalSequence(block.moves, game.pgnMoves, 1, snapshot);
  else if (block.type === "moveSequence") base = evalSequence(block.sequence.split(/\s+/).filter(Boolean), game.pgnMoves, block.timing?.atMove ?? block.timing?.byMove ?? 1, snapshot);
  else if (block.type === "gameResult") base = evalGameResult(block, game, replay.snapshots.at(-1));
  else base = evalPieceState(block, game, snapshot, replay);
  return block.negate ? { ...base, passed: !base.passed, explanation: base.passed ? `This condition happened, but the Side Quest required it not to happen.` : `The forbidden condition did not happen.` } : base;
}
function pickSnapshot(block: CustomSideQuestRuleBlock, replay: { snapshots: Snapshot[] }) { if (block.type !== "pieceState" && block.type !== "moveSequence") return replay.snapshots.at(-1); const moveNo = block.timing && "atMove" in block.timing ? block.timing.atMove : block.timing && "byMove" in block.timing ? block.timing.byMove : undefined; return moveNo ? replay.snapshots[Math.min(replay.snapshots.length - 1, Math.max(0, moveNo * 2 - 1))] : replay.snapshots.at(-1); }
function evalSequence(expected: string[], actual: string[], moveNumber: number, snapshot?: Snapshot): EvalResult { const norm = (v: string) => v.replace(/[+#?!]+$/g, "").replace(/0/g, "O"); const ok = expected.every((token, index) => norm(actual[index]) === norm(token)); return { passed: ok, label: "Move sequence", explanation: ok ? `The game followed ${expected.join(" ")}.` : `Expected ${expected.join(" ")}, but the latest game began ${actual.slice(0, Math.max(expected.length, 1)).join(" ") || "with no parsed moves"}.`, ply: snapshot?.ply, moveNumber, san: snapshot?.san, uci: snapshot?.uci, fenAtBreak: snapshot?.fen }; }
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
function candidateOrigins(piece: string, color: "white" | "black", identity: string) { const entries = HOME_SQUARES[color][piece] ?? {}; if (identity !== "any" && entries[identity]) return [entries[identity]]; return Object.values(entries); }
function conditionMatches(block: Extract<CustomSideQuestRuleBlock, { type: "pieceState" }>, square: string | null, piece: { moved: boolean } | null) { if (block.condition === "gone" || block.condition === "captured") return !piece; if (!piece || !square) return false; if (block.condition === "moved") return piece.moved; if (block.condition === "not moved") return !piece.moved; if (block.condition === "on square") return square === block.targetSquare; return true; }
