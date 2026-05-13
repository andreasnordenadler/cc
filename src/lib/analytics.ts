export type SQCAnalyticsEventType =
  | "page_view"
  | "profile_saved"
  | "quest_started"
  | "quest_completed"
  | "quest_failed"
  | "quest_pending";

export type SQCAnalyticsEvent = {
  type: SQCAnalyticsEventType;
  at: string;
  path?: string;
  questId?: string;
  provider?: string;
  status?: string;
  gameId?: string;
  source?: string;
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

const MAX_RECENT_EVENTS = 80;

export function getAnalyticsStore(metadata: unknown): SQCAnalyticsStore {
  if (!metadata || typeof metadata !== "object") return {};
  const candidate = (metadata as { sqcAnalytics?: unknown }).sqcAnalytics;
  if (!candidate || typeof candidate !== "object") return {};
  return candidate as SQCAnalyticsStore;
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
  };
}

export function appendAnalyticsEvent(store: SQCAnalyticsStore, event: SQCAnalyticsEvent): SQCAnalyticsStore {
  const now = event.at;
  const recentEvents = [
    ...(Array.isArray(store.recentEvents) ? store.recentEvents : []),
    event,
  ].slice(-MAX_RECENT_EVENTS);
  const questStats = { ...(store.questStats ?? {}) };

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

  return {
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
    recentEvents,
    questStats,
  };
}

export function isAdminAnalyticsViewer(user: {
  publicMetadata?: Record<string, unknown> | null;
  privateMetadata?: Record<string, unknown> | null;
  primaryEmailAddress?: { emailAddress?: string | null } | null;
} | null, adminEmails = process.env.SQC_ADMIN_EMAILS ?? "") {
  if (!user) return false;
  if (user.publicMetadata?.sqcAdmin === true || user.privateMetadata?.sqcAdmin === true) return true;
  const email = user.primaryEmailAddress?.emailAddress?.toLowerCase();
  const allowed = adminEmails
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  return Boolean(email && allowed.includes(email));
}

function isKnownEventType(type: string): type is SQCAnalyticsEventType {
  return [
    "page_view",
    "profile_saved",
    "quest_started",
    "quest_completed",
    "quest_failed",
    "quest_pending",
  ].includes(type);
}

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().slice(0, maxLength);
  return trimmed || undefined;
}
