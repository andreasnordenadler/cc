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
  return sanitizeAnalyticsStorePaths(candidate as SQCAnalyticsStore);
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
    path: sanitizeAnalyticsPath(event.path),
    questId: cleanText(event.questId, 80),
    provider: cleanText(event.provider, 40),
    status: cleanText(event.status, 40),
    gameId: cleanText(event.gameId, 120),
    source: cleanText(event.source, 40),
    deviceType: normalizeDeviceType(event.deviceType),
  };
}

export function sanitizeAnalyticsPath(value: unknown) {
  if (typeof value !== "string") return undefined;
  if (hasUrlPreprocessingControls(value)) return undefined;
  const path = value.trim();
  if (!path) return undefined;
  if (classifyStructuralPath(path).unsafe) return undefined;

  const directProofPath = sanitizedProofPath(path);
  if (directProofPath) return directProofPath;

  const authenticationPath = sanitizedAuthenticationPath(path, 0);
  if (authenticationPath) return cleanText(authenticationPath, 180);

  return cleanText(path, 180);
}

const MAX_AUTHENTICATION_RETURN_DEPTH = 3;
const MAX_ANALYTICS_PATH_INPUT_LENGTH = 2_048;
const MAX_STRUCTURAL_DECODING_PASSES = 6;

type StructuralPathClassification = {
  pathname?: string;
  pathnames?: string[];
  unsafe: boolean;
};

type ParsedStructuralPath = StructuralPathClassification & {
  parsed?: URL;
  rawPathname?: string;
  rawPathnames?: string[];
};

type StructuralDecodingPipeline = {
  states: string[];
  unsafe: boolean;
};

const utf8Decoder = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });

function decodePercentByteRun(encoded: string): { decoded: string; unsafe: boolean } {
  const bytes = new Uint8Array(encoded.match(/[0-9a-f]{2}/gi)?.map((hex) => Number.parseInt(hex, 16)) ?? []);
  try {
    return { decoded: utf8Decoder.decode(bytes), unsafe: false };
  } catch {
    return { decoded: encoded, unsafe: true };
  }
}

function decodeOneStructuralLayer(value: string): { value: string; unsafe: boolean } {
  let unsafe = false;
  const decoded = value.replace(/(?:%[0-9a-f]{2})+/gi, (encoded) => {
    const result = decodePercentByteRun(encoded);
    unsafe ||= result.unsafe;
    return result.decoded;
  });
  return { value: decoded, unsafe };
}

function hasUrlPreprocessingControls(value: string) {
  return /[\u0000-\u001f\u007f]/.test(value);
}

function structuralDecodingPipeline(value: string): StructuralDecodingPipeline {
  const states = [value];
  let decoded = value;
  for (let pass = 0; pass < MAX_STRUCTURAL_DECODING_PASSES; pass += 1) {
    const next = decodeOneStructuralLayer(decoded);
    if (next.unsafe) return { states, unsafe: true };
    if (next.value === decoded) return { states, unsafe: false };
    decoded = next.value;
    states.push(decoded);
    if (hasUrlPreprocessingControls(decoded)) return { states, unsafe: true };
  }

  return { states, unsafe: /%[0-9a-f]{2}/i.test(decoded) };
}

function decodeStructuralComponent(value: string): StructuralPathClassification {
  const pipeline = structuralDecodingPipeline(value);
  if (pipeline.unsafe) return { unsafe: true };
  return {
    pathname: pipeline.states.at(-1),
    pathnames: pipeline.states,
    unsafe: false,
  };
}

function unwrapEncodedUrlPrefix(value: string): { candidate: string; unsafe: boolean } {
  if (/^(?:https?:|[\\/])/i.test(value)) return { candidate: value, unsafe: false };

  const pipeline = structuralDecodingPipeline(value);
  if (pipeline.unsafe) return { candidate: value, unsafe: true };
  for (const decoded of pipeline.states.slice(1)) {
    const structuralCandidate = decoded.trimStart();
    if (/^(?:https?:|[\\/])/i.test(structuralCandidate)) {
      return structuralCandidate === decoded
        ? { candidate: decoded, unsafe: false }
        : { candidate: value, unsafe: true };
    }
  }

  return { candidate: value, unsafe: false };
}

function hasAmbiguousAuthorityPrefix(value: string) {
  const hasLiteralAuthority = /^[\\/]{2}/.test(value);
  if (/^[\\/]{3,}/.test(value)) return true;

  const pipeline = structuralDecodingPipeline(extractRawPathname(value));
  if (pipeline.unsafe) return true;
  const decodedPathname = pipeline.states.at(-1) ?? value;

  return !hasLiteralAuthority && /^[\\/]{2}/.test(decodedPathname);
}

function extractRawPathname(value: string) {
  let pathStart = 0;
  const scheme = value.match(/^https?:\/\//i)?.[0];
  const hasProtocolRelativeAuthority = /^[\\/]{2}/.test(value);
  const authorityStart = scheme ? scheme.length : hasProtocolRelativeAuthority ? 2 : undefined;

  if (authorityStart !== undefined) {
    const boundaryOffset = value.slice(authorityStart).search(/[\\/?#]/);
    if (boundaryOffset < 0) return "/";
    const boundary = authorityStart + boundaryOffset;
    if (value[boundary] !== "/" && value[boundary] !== "\\") return "/";
    pathStart = boundary;
  }

  const suffixOffset = value.slice(pathStart).search(/[?#]/);
  const pathname = (suffixOffset < 0
    ? value.slice(pathStart)
    : value.slice(pathStart, pathStart + suffixOffset))
    .replaceAll("\\", "/");
  if (!pathname) return "/";
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

function pathResolutionSnapshots(pathname: string | undefined) {
  if (!pathname) return [];
  const segments: string[] = [];
  const snapshots: string[] = [];
  for (const segment of pathname.split("/")) {
    if (segment === "" && segments.length === 0) continue;
    if (segment === ".") continue;
    if (segment === "..") segments.pop();
    else segments.push(segment);
    snapshots.push(`/${segments.join("/")}`);
  }
  return snapshots;
}

function parseStructuralPath(value: string): ParsedStructuralPath {
  if (value.length > MAX_ANALYTICS_PATH_INPUT_LENGTH || hasUrlPreprocessingControls(value)) {
    return { unsafe: true };
  }

  const unwrapped = unwrapEncodedUrlPrefix(value.trim());
  if (unwrapped.unsafe) return { unsafe: true };
  const candidate = unwrapped.candidate;

  if (hasUrlPreprocessingControls(candidate)) return { unsafe: true };
  if (hasAmbiguousAuthorityPrefix(candidate)) return { unsafe: true };
  if (/^https?:/i.test(candidate) && !/^https?:\/\/[^\\/?#]+(?:[\\/?#]|$)/i.test(candidate)) {
    return { unsafe: true };
  }

  try {
    const parsed = new URL(candidate, "https://analytics.sidequestchess.invalid");
    const rawStructuralPath = decodeStructuralComponent(extractRawPathname(candidate));
    if (rawStructuralPath.unsafe) return rawStructuralPath;
    const structuralPath = decodeStructuralComponent(parsed.pathname);
    if (structuralPath.unsafe) return structuralPath;
    return {
      pathname: structuralPath.pathname?.replaceAll("\\", "/"),
      pathnames: structuralPath.pathnames?.map((pathname) => pathname.replaceAll("\\", "/")),
      unsafe: false,
      parsed,
      rawPathname: rawStructuralPath.pathname?.replaceAll("\\", "/"),
      rawPathnames: rawStructuralPath.pathnames?.map((pathname) => pathname.replaceAll("\\", "/")),
    };
  } catch {
    return { unsafe: true };
  }
}

function classifyStructuralPath(value: string): StructuralPathClassification {
  const { pathname, unsafe } = parseStructuralPath(value);
  return { pathname, unsafe };
}

function structuralPathCandidates(structural: ParsedStructuralPath) {
  const rawPathnames = structural.rawPathnames ?? (structural.rawPathname ? [structural.rawPathname] : []);
  const pathnames = structural.pathnames ?? (structural.pathname ? [structural.pathname] : []);
  return [
    ...rawPathnames.flatMap((pathname) => pathResolutionSnapshots(pathname)),
    ...rawPathnames,
    ...pathnames,
  ];
}

function sanitizedAuthenticationPath(value: string, depth: number): string | undefined {
  const structural = parseStructuralPath(value);
  if (structural.unsafe || !structural.parsed) return undefined;

  const authenticationPath = structuralPathCandidates(structural)
    .map((pathname) => pathname?.match(/^\/+(sign-(?:in|up))(?:\/|[?#]|$)/)?.[1])
    .find(Boolean);
  if (!authenticationPath) return undefined;

  const sanitizedPathname = `/${authenticationPath}`;
  const sanitizedSearch = new URLSearchParams();
  for (const [key, entry] of structural.parsed.searchParams) {
    if (key !== "redirect_url") continue;
    if (classifyStructuralPath(entry).unsafe) continue;

    if (sanitizedProofPath(entry)) {
      sanitizedSearch.append(key, "/proof/[token]");
      continue;
    }

    if (depth >= MAX_AUTHENTICATION_RETURN_DEPTH) continue;
    const nestedAuthenticationPath = sanitizedAuthenticationPath(entry, depth + 1);
    sanitizedSearch.append(
      key,
      nestedAuthenticationPath && authenticationPathReturnsProof(nestedAuthenticationPath)
        ? "/proof/[token]"
        : nestedAuthenticationPath ?? entry,
    );
  }

  const query = sanitizedSearch.toString();
  return `${sanitizedPathname}${query ? `?${query}` : ""}`;
}

function authenticationPathReturnsProof(value: string) {
  try {
    const parsed = new URL(value, "https://analytics.sidequestchess.invalid");
    if (!/^\/sign-(?:in|up)$/.test(parsed.pathname)) return false;
    return parsed.searchParams.getAll("redirect_url").some((entry) => Boolean(sanitizedProofPath(entry)));
  } catch {
    return false;
  }
}

function sanitizedProofPath(value: string) {
  const structural = parseStructuralPath(value);
  if (structural.unsafe) return undefined;
  return structuralPathCandidates(structural).some(
    (pathname) => Boolean(pathname && /^\/+proof\/+[^/?#]+/i.test(pathname)),
  )
    ? "/proof/[token]"
    : undefined;
}

function sanitizeAnalyticsStorePaths(store: SQCAnalyticsStore): SQCAnalyticsStore {
  return {
    ...store,
    recentEvents: Array.isArray(store.recentEvents)
      ? store.recentEvents.map((event) => ({ ...event, path: sanitizeAnalyticsPath(event.path) }))
      : store.recentEvents,
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
        path: sanitizeAnalyticsPath(event.path),
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
