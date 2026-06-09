export type SQCAnalyticsEventType =
  | "page_view"
  | "profile_saved"
  | "quest_started"
  | "quest_completed"
  | "quest_failed"
  | "quest_pending"
  | "community_solo_browse"
  | "community_solo_detail"
  | "community_solo_creator_filter"
  | "community_solo_report_click"
  | "community_solo_account_handoff";

export type SQCAnalyticsDeviceType = "mobile" | "tablet" | "desktop" | "bot" | "unknown";

export type SQCAnalyticsEvent = {
  type: SQCAnalyticsEventType;
  at: string;
  path?: string;
  questId?: string;
  provider?: string;
  status?: string;
  gameId?: string;
  source?: string;
  deviceType?: SQCAnalyticsDeviceType;
};

export type SQCAnalyticsStore = {
  firstSeenAt?: string;
  lastSeenAt?: string;
  totalEvents?: number;
  pageViews?: number;
  questStarts?: number;
  questCompletions?: number;
  questFailures?: number;
  questPending?: number;
  profileSaves?: number;
  deviceCounts?: Partial<Record<SQCAnalyticsDeviceType, number>>;
  recentEvents?: SQCAnalyticsEvent[];
  questStats?: Record<string, {
    starts?: number;
    completions?: number;
    failures?: number;
    pending?: number;
    lastStatus?: string;
    lastEventAt?: string;
  }>;
};

export type SQCSupportMessage = {
  id: string;
  at: string;
  message: string;
  source?: string;
  accountEmail?: string | null;
  displayName?: string | null;
};

const MAX_RECENT_EVENTS = 40;
const COMPACT_RECENT_EVENTS = 12;
const COMPACT_QUEST_STATS = 12;

export function getAnalyticsStore(metadata: unknown): SQCAnalyticsStore {
  if (!metadata || typeof metadata !== "object") return {};
  const candidate = (metadata as { sqcAnalytics?: unknown }).sqcAnalytics;
  if (!candidate || typeof candidate !== "object") return {};
  return candidate as SQCAnalyticsStore;
}

export function getSupportMessages(metadata: unknown): SQCSupportMessage[] {
  if (!metadata || typeof metadata !== "object") return [];
  const candidate = (metadata as { sqcSupportMessages?: unknown }).sqcSupportMessages;
  if (!Array.isArray(candidate)) return [];

  return candidate
    .filter((entry): entry is SQCSupportMessage => {
      if (!entry || typeof entry !== "object") return false;
      const record = entry as Partial<SQCSupportMessage>;
      return typeof record.id === "string" && typeof record.at === "string" && typeof record.message === "string";
    })
    .map((entry) => ({
      id: entry.id,
      at: entry.at,
      message: cleanText(entry.message, 1200) ?? "",
      source: cleanText(entry.source, 40),
      accountEmail: cleanText(entry.accountEmail, 120) ?? null,
      displayName: cleanText(entry.displayName, 120) ?? null,
    }));
}

export function normalizeAnalyticsEvent(event: Partial<SQCAnalyticsEvent>): SQCAnalyticsEvent | null {
  if (!event.type || typeof event.type !== "string") return null;
  if (!isKnownEventType(event.type)) return null;

  return {
    type: event.type,
    at: typeof event.at === "string" ? event.at : new Date().toISOString(),
    path: cleanText(event.path, 180),
    questId: cleanText(event.questId, 80),
    provider: cleanText(event.provider, 40),
    status: cleanText(event.status, 40),
    gameId: cleanText(event.gameId, 120),
    source: cleanText(event.source, 40),
    deviceType: normalizeDeviceType(event.deviceType),
  };
}

export function appendAnalyticsEvent(store: SQCAnalyticsStore, event: SQCAnalyticsEvent): SQCAnalyticsStore {
  const now = event.at;
  const recentEvents = [
    ...(Array.isArray(store.recentEvents) ? store.recentEvents : []),
    event,
  ].slice(-MAX_RECENT_EVENTS);
  const questStats = { ...(store.questStats ?? {}) };
  const deviceCounts = { ...(store.deviceCounts ?? {}) };

  if (event.deviceType) {
    deviceCounts[event.deviceType] = (deviceCounts[event.deviceType] ?? 0) + 1;
  }

  if (event.questId) {
    const current = { ...(questStats[event.questId] ?? {}) };
    if (event.type === "quest_started") current.starts = (current.starts ?? 0) + 1;
    if (event.type === "quest_completed") current.completions = (current.completions ?? 0) + 1;
    if (event.type === "quest_failed") current.failures = (current.failures ?? 0) + 1;
    if (event.type === "quest_pending") current.pending = (current.pending ?? 0) + 1;
    current.lastStatus = event.status ?? event.type;
    current.lastEventAt = now;
    questStats[event.questId] = current;
  }

  return compactAnalyticsStore({
    ...store,
    firstSeenAt: store.firstSeenAt ?? now,
    lastSeenAt: now,
    totalEvents: (store.totalEvents ?? 0) + 1,
    pageViews: (store.pageViews ?? 0) + (event.type === "page_view" ? 1 : 0),
    questStarts: (store.questStarts ?? 0) + (event.type === "quest_started" ? 1 : 0),
    questCompletions: (store.questCompletions ?? 0) + (event.type === "quest_completed" ? 1 : 0),
    questFailures: (store.questFailures ?? 0) + (event.type === "quest_failed" ? 1 : 0),
    questPending: (store.questPending ?? 0) + (event.type === "quest_pending" ? 1 : 0),
    profileSaves: (store.profileSaves ?? 0) + (event.type === "profile_saved" ? 1 : 0),
    deviceCounts,
    recentEvents,
    questStats,
  });
}

export function compactAnalyticsStore(store: SQCAnalyticsStore): SQCAnalyticsStore {
  const recentEvents = Array.isArray(store.recentEvents)
    ? store.recentEvents.slice(-COMPACT_RECENT_EVENTS).map((event) => ({
        type: event.type,
        at: event.at,
        path: event.path,
        questId: event.questId,
        provider: event.provider,
        status: event.status,
        deviceType: event.deviceType,
      }))
    : [];

  const questStatsEntries = Object.entries(store.questStats ?? {})
    .sort((a, b) => (b[1]?.lastEventAt ?? "").localeCompare(a[1]?.lastEventAt ?? ""))
    .slice(0, COMPACT_QUEST_STATS)
    .map(([questId, stats]) => [questId, {
      starts: stats.starts ?? 0,
      completions: stats.completions ?? 0,
      failures: stats.failures ?? 0,
      pending: stats.pending ?? 0,
      lastStatus: stats.lastStatus,
      lastEventAt: stats.lastEventAt,
    }]);

  return {
    firstSeenAt: store.firstSeenAt,
    lastSeenAt: store.lastSeenAt,
    totalEvents: store.totalEvents ?? 0,
    pageViews: store.pageViews ?? 0,
    questStarts: store.questStarts ?? 0,
    questCompletions: store.questCompletions ?? 0,
    questFailures: store.questFailures ?? 0,
    questPending: store.questPending ?? 0,
    profileSaves: store.profileSaves ?? 0,
    deviceCounts: sanitizeDeviceCounts(store.deviceCounts),
    recentEvents,
    questStats: Object.fromEntries(questStatsEntries),
  };
}

export function detectDeviceType(userAgent: string | null | undefined): SQCAnalyticsDeviceType {
  const ua = (userAgent ?? "").toLowerCase();
  if (!ua) return "unknown";
  if (/bot|crawler|spider|crawling|preview|facebookexternalhit|slackbot|telegrambot|discordbot/.test(ua)) return "bot";
  if (/ipad|tablet|kindle|silk|playbook/.test(ua) || (/android/.test(ua) && !/mobile/.test(ua))) return "tablet";
  if (/mobi|iphone|ipod|android.*mobile|windows phone|blackberry|opera mini/.test(ua)) return "mobile";
  return "desktop";
}

export function isAdminAnalyticsViewer(user: {
  publicMetadata?: Record<string, unknown> | null;
  privateMetadata?: Record<string, unknown> | null;
  primaryEmailAddress?: { emailAddress?: string | null } | null;
} | null, adminEmails = process.env.SQC_ADMIN_EMAILS ?? "andreas.nordenadler@gmail.com") {
  if (!user) return false;
  if (user.publicMetadata?.sqcAdmin === true || user.privateMetadata?.sqcAdmin === true) return true;
  const email = user.primaryEmailAddress?.emailAddress?.toLowerCase();
  const allowed = adminEmails
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  return Boolean(email && allowed.includes(email));
}

function normalizeDeviceType(value: unknown): SQCAnalyticsDeviceType | undefined {
  if (typeof value !== "string") return undefined;
  return isKnownDeviceType(value) ? value : undefined;
}

function sanitizeDeviceCounts(value: unknown): Partial<Record<SQCAnalyticsDeviceType, number>> {
  if (!value || typeof value !== "object") return {};
  const counts: Partial<Record<SQCAnalyticsDeviceType, number>> = {};
  for (const type of ["mobile", "tablet", "desktop", "bot", "unknown"] satisfies SQCAnalyticsDeviceType[]) {
    const count = (value as Partial<Record<SQCAnalyticsDeviceType, unknown>>)[type];
    if (typeof count === "number" && Number.isFinite(count) && count > 0) {
      counts[type] = Math.floor(count);
    }
  }
  return counts;
}

function isKnownDeviceType(type: string): type is SQCAnalyticsDeviceType {
  return ["mobile", "tablet", "desktop", "bot", "unknown"].includes(type);
}

function isKnownEventType(type: string): type is SQCAnalyticsEventType {
  return [
    "page_view",
    "profile_saved",
    "quest_started",
    "quest_completed",
    "quest_failed",
    "quest_pending",
    "community_solo_browse",
    "community_solo_detail",
    "community_solo_creator_filter",
    "community_solo_report_click",
    "community_solo_account_handoff",
  ].includes(type);
}

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().slice(0, maxLength);
  return trimmed || undefined;
}
