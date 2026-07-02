import { getChessComUsername, getLichessUsername, type UserMetadataRecord } from "@/lib/user-metadata";

export type ChessRatingProvider = "lichess" | "chess.com";

export type ChessRatingEntry = {
  category: string;
  label: string;
  rating: number;
  games?: number;
};

export type ChessRatingSnapshot = {
  provider: ChessRatingProvider;
  username: string;
  updatedAt: string;
  ratings: ChessRatingEntry[];
  error?: string;
};

export type ChessRatingSnapshots = {
  lichess?: ChessRatingSnapshot;
  chessCom?: ChessRatingSnapshot;
};

export const CHESS_RATING_REFRESH_MS = 30 * 60 * 1000;

const LICHESS_PERF_ORDER = ["bullet", "blitz", "rapid", "classical", "correspondence"];
const CHESS_COM_STAT_ORDER = [
  ["chess_bullet", "Bullet"],
  ["chess_blitz", "Blitz"],
  ["chess_rapid", "Rapid"],
  ["chess_daily", "Daily"],
] as const;

export function getChessRatingSnapshots(metadata: UserMetadataRecord): ChessRatingSnapshots {
  const raw = metadata.chessRatingSnapshots;
  if (!raw || typeof raw !== "object") return {};
  const record = raw as Record<string, unknown>;

  return {
    lichess: parseSnapshot(record.lichess, "lichess"),
    chessCom: parseSnapshot(record.chessCom, "chess.com"),
  };
}

export function shouldRefreshChessRatingSnapshots(
  metadata: UserMetadataRecord,
  now = Date.now(),
): boolean {
  const lichessUsername = getLichessUsername(metadata);
  const chessComUsername = getChessComUsername(metadata);
  const snapshots = getChessRatingSnapshots(metadata);

  return (
    shouldRefreshSnapshot(snapshots.lichess, "lichess", lichessUsername, now) ||
    shouldRefreshSnapshot(snapshots.chessCom, "chess.com", chessComUsername, now)
  );
}

export async function refreshChessRatingSnapshots(
  metadata: UserMetadataRecord,
  options: { force?: boolean; now?: Date } = {},
): Promise<{ metadata: UserMetadataRecord; snapshots: ChessRatingSnapshots; changed: boolean }> {
  const now = options.now ?? new Date();
  const nowMs = now.getTime();
  const existing = getChessRatingSnapshots(metadata);
  const lichessUsername = getLichessUsername(metadata);
  const chessComUsername = getChessComUsername(metadata);

  const [lichessSnapshot, chessComSnapshot] = await Promise.all([
    refreshProviderSnapshot({
      provider: "lichess",
      username: lichessUsername,
      existing: existing.lichess,
      force: options.force,
      now,
      nowMs,
    }),
    refreshProviderSnapshot({
      provider: "chess.com",
      username: chessComUsername,
      existing: existing.chessCom,
      force: options.force,
      now,
      nowMs,
    }),
  ]);

  const snapshots: ChessRatingSnapshots = {
    ...(lichessSnapshot ? { lichess: lichessSnapshot } : {}),
    ...(chessComSnapshot ? { chessCom: chessComSnapshot } : {}),
  };
  const nextMetadata = {
    ...metadata,
    chessRatingSnapshots: snapshots,
  };

  return {
    metadata: nextMetadata,
    snapshots,
    changed: JSON.stringify(getChessRatingSnapshots(metadata)) !== JSON.stringify(snapshots),
  };
}

async function refreshProviderSnapshot({
  provider,
  username,
  existing,
  force,
  now,
  nowMs,
}: {
  provider: ChessRatingProvider;
  username: string;
  existing?: ChessRatingSnapshot;
  force?: boolean;
  now: Date;
  nowMs: number;
}) {
  if (!username) return undefined;
  if (!force && !shouldRefreshSnapshot(existing, provider, username, nowMs)) return existing;

  try {
    return provider === "lichess"
      ? await fetchLichessRatingSnapshot(username, now)
      : await fetchChessComRatingSnapshot(username, now);
  } catch {
    return {
      provider,
      username,
      updatedAt: now.toISOString(),
      ratings: existing?.username.toLowerCase() === username.toLowerCase() ? existing.ratings : [],
      error: `${formatProvider(provider)} ratings could not refresh right now.`,
    };
  }
}

function shouldRefreshSnapshot(
  snapshot: ChessRatingSnapshot | undefined,
  provider: ChessRatingProvider,
  username: string,
  nowMs: number,
) {
  if (!username) return false;
  if (!snapshot) return true;
  if (snapshot.provider !== provider) return true;
  if (snapshot.username.toLowerCase() !== username.toLowerCase()) return true;
  const updatedAt = Date.parse(snapshot.updatedAt);
  return !Number.isFinite(updatedAt) || nowMs - updatedAt > CHESS_RATING_REFRESH_MS;
}

async function fetchLichessRatingSnapshot(username: string, now: Date): Promise<ChessRatingSnapshot> {
  const response = await fetch(`https://lichess.org/api/user/${encodeURIComponent(username)}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "sqc-rating-snapshot/0.1 (+https://sidequestchess.com)",
    },
    cache: "no-store",
  });

  if (!response.ok) throw new Error("Lichess rating fetch failed.");

  const body = (await response.json()) as Record<string, unknown>;
  const perfs = body.perfs && typeof body.perfs === "object" ? body.perfs as Record<string, unknown> : {};
  const ratings = LICHESS_PERF_ORDER
    .map((category) => {
      const perf = perfs[category];
      if (!perf || typeof perf !== "object") return null;
      const record = perf as Record<string, unknown>;
      return buildRatingEntry(category, formatPerfLabel(category), record.rating, record.games);
    })
    .filter((entry): entry is ChessRatingEntry => Boolean(entry));

  return {
    provider: "lichess",
    username: typeof body.username === "string" ? body.username : username,
    updatedAt: now.toISOString(),
    ratings,
  };
}

async function fetchChessComRatingSnapshot(username: string, now: Date): Promise<ChessRatingSnapshot> {
  const response = await fetch(`https://api.chess.com/pub/player/${encodeURIComponent(username.toLowerCase())}/stats`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "sqc-rating-snapshot/0.1 (+https://sidequestchess.com)",
    },
    cache: "no-store",
  });

  if (!response.ok) throw new Error("Chess.com rating fetch failed.");

  const body = (await response.json()) as Record<string, unknown>;
  const ratings = CHESS_COM_STAT_ORDER
    .map(([key, label]) => {
      const stat = body[key];
      if (!stat || typeof stat !== "object") return null;
      const last = (stat as Record<string, unknown>).last;
      if (!last || typeof last !== "object") return null;
      const record = last as Record<string, unknown>;
      return buildRatingEntry(key, label, record.rating);
    })
    .filter((entry): entry is ChessRatingEntry => Boolean(entry));

  return {
    provider: "chess.com",
    username,
    updatedAt: now.toISOString(),
    ratings,
  };
}

function parseSnapshot(value: unknown, provider: ChessRatingProvider): ChessRatingSnapshot | undefined {
  if (!value || typeof value !== "object") return undefined;
  const record = value as Record<string, unknown>;
  if (record.provider !== provider || typeof record.username !== "string" || typeof record.updatedAt !== "string") {
    return undefined;
  }

  return {
    provider,
    username: record.username,
    updatedAt: record.updatedAt,
    ratings: Array.isArray(record.ratings)
      ? record.ratings
          .map(parseRatingEntry)
          .filter((entry): entry is ChessRatingEntry => Boolean(entry))
      : [],
    error: typeof record.error === "string" ? record.error : undefined,
  };
}

function parseRatingEntry(value: unknown): ChessRatingEntry | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.category !== "string" || typeof record.label !== "string" || typeof record.rating !== "number") {
    return null;
  }
  return {
    category: record.category,
    label: record.label,
    rating: record.rating,
    games: typeof record.games === "number" ? record.games : undefined,
  };
}

function buildRatingEntry(category: string, label: string, rating: unknown, games?: unknown): ChessRatingEntry | null {
  if (typeof rating !== "number" || !Number.isFinite(rating)) return null;
  return {
    category,
    label,
    rating,
    games: typeof games === "number" && Number.isFinite(games) ? games : undefined,
  };
}

function formatPerfLabel(value: string) {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}

function formatProvider(provider: ChessRatingProvider) {
  return provider === "lichess" ? "Lichess" : "Chess.com";
}
