import type {
  MobileAccountResponse,
  MobileAccountDeletionResponse,
  MobileBootstrap,
  MobileGroupQuestActionResponse,
  MobileCommunityLikeResponse,
  MobileCustomQuestSaveResponse,
  MobileProfileUpdateResponse,
  MobileSupportMessageResponse,
  MobileQuestActionResponse,
} from "../types/sqc";

const DEFAULT_API_BASE_URL = "https://sidequestchess.com";
const DEFAULT_REQUEST_TIMEOUT_MS = 12000;

export function getApiBaseUrl() {
  const configuredBaseUrl = process.env.EXPO_PUBLIC_SQC_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;
  return configuredBaseUrl.replace(/[\\/]+$/, "") || DEFAULT_API_BASE_URL;
}

export function buildMobileUrl(path: string) {
  const safePath = path.replace(/\\+/g, "/");
  return new URL(safePath.startsWith("/") ? safePath : `/${safePath}`, `${getApiBaseUrl()}/`).toString();
}

async function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } catch (caught) {
    if (caught instanceof Error && caught.name === "AbortError") {
      throw new Error("Side Quest Chess mobile request timed out. Check network access and try again.");
    }

    throw caught;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchMobileBootstrap(): Promise<MobileBootstrap> {
  const response = await fetchWithTimeout(buildMobileUrl("/api/mobile/bootstrap"), {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Side Quest Chess mobile bootstrap failed: ${response.status}`);
  }

  return readMobileJson<MobileBootstrap>(response, "bootstrap");
}

export async function fetchMobileAccountState(sessionToken?: string | null): Promise<MobileAccountResponse> {
  const response = await fetchWithTimeout(buildMobileUrl("/api/mobile/account"), {
    headers: buildMobileAuthHeaders(sessionToken),
  });

  if (response.status === 401) {
    return readMobileJson<MobileAccountResponse>(response, "account");
  }

  if (!response.ok) {
    throw new Error(`Side Quest Chess mobile account failed: ${response.status}`);
  }

  return readMobileJson<MobileAccountResponse>(response, "account");
}

export async function deleteMobileAccount({
  sessionToken,
  confirmation,
}: {
  sessionToken?: string | null;
  confirmation: string;
}): Promise<MobileAccountDeletionResponse> {
  const response = await fetchWithTimeout(buildMobileUrl("/api/mobile/account"), {
    method: "DELETE",
    headers: buildMobileAuthHeaders(sessionToken),
    body: JSON.stringify({ confirmation }),
  }, 20000);
  const result = await readMobileJson<MobileAccountDeletionResponse>(response, "account deletion");

  if (!response.ok) {
    throw new Error(result.message || `Side Quest Chess account deletion failed: ${response.status}`);
  }

  return result;
}

export async function updateMobileChessUsernames({
  sessionToken,
  runnerDisplayName,
  runnerBio,
  lichessUsername,
  chessComUsername,
}: {
  sessionToken?: string | null;
  runnerDisplayName?: string;
  runnerBio?: string;
  lichessUsername: string;
  chessComUsername: string;
}): Promise<MobileProfileUpdateResponse> {
  const response = await fetchWithTimeout(buildMobileUrl("/api/mobile/profile"), {
    method: "PATCH",
    headers: buildMobileAuthHeaders(sessionToken),
    body: JSON.stringify({ runnerDisplayName, runnerBio, lichessUsername, chessComUsername }),
  });
  const payload = await readMobileJson<MobileProfileUpdateResponse>(response, "profile update");

  if (!response.ok) {
    throw new Error(payload.message || `Side Quest Chess mobile profile update failed: ${response.status}`);
  }

  return payload;
}

export async function submitMobileSupportMessage({
  sessionToken,
  message,
}: {
  sessionToken?: string | null;
  message: string;
}): Promise<MobileSupportMessageResponse> {
  const response = await fetchWithTimeout(buildMobileUrl("/api/mobile/support"), {
    method: "POST",
    headers: buildMobileAuthHeaders(sessionToken),
    body: JSON.stringify({ message }),
  });
  const payload = await readMobileJson<MobileSupportMessageResponse>(response, "support message");

  if (!response.ok) {
    throw new Error(payload.message || `Side Quest Chess mobile support message failed: ${response.status}`);
  }

  return payload;
}


export async function saveMobileCustomSideQuest({
  sessionToken,
  title,
  summary,
  config,
  id,
  lifecycle,
  visibility,
}: {
  sessionToken?: string | null;
  title: string;
  summary: string;
  config: string;
  id?: string;
  lifecycle?: "draft" | "published" | "archived";
  visibility?: "private" | "public";
}): Promise<MobileCustomQuestSaveResponse> {
  const response = await fetchWithTimeout(buildMobileUrl("/api/mobile/custom-quests"), {
    method: "POST",
    headers: buildMobileAuthHeaders(sessionToken),
    body: JSON.stringify({ id, title, summary, config, lifecycle, visibility }),
  }, 20000);
  const payload = await readMobileJson<MobileCustomQuestSaveResponse>(response, "custom Side Quest save");

  if (!response.ok) {
    throw new Error(payload.message || `Side Quest Chess mobile custom Side Quest save failed: ${response.status}`);
  }

  return payload;
}

export async function deleteMobileCustomSideQuest({
  sessionToken,
  id,
}: {
  sessionToken?: string | null;
  id: string;
}): Promise<MobileCustomQuestSaveResponse> {
  const response = await fetchWithTimeout(buildMobileUrl(`/api/mobile/custom-quests?id=${encodeURIComponent(id)}`), {
    method: "DELETE",
    headers: buildMobileAuthHeaders(sessionToken),
  }, 20000);
  const payload = await readMobileJson<MobileCustomQuestSaveResponse>(response, "custom Side Quest delete");

  if (!response.ok) {
    throw new Error(payload.message || `Side Quest Chess mobile custom Side Quest delete failed: ${response.status}`);
  }

  return payload;
}

export async function runMobileQuestAction({
  sessionToken,
  action,
  challengeId,
  gameId,
}: {
  sessionToken?: string | null;
  action: "start" | "check" | "submit" | "deactivate" | "reset";
  challengeId?: string;
  gameId?: string;
}): Promise<MobileQuestActionResponse> {
  const response = await fetchWithTimeout(buildMobileUrl("/api/mobile/quest"), {
    method: "POST",
    headers: buildMobileAuthHeaders(sessionToken),
    body: JSON.stringify({ action, challengeId, gameId }),
  }, 20000);
  const payload = await readMobileJson<MobileQuestActionResponse>(response, "quest action");

  if (!response.ok) {
    throw new Error(payload.message || `Side Quest Chess mobile quest action failed: ${response.status}`);
  }

  return payload;
}

export async function runMobileGroupQuestAction({
  sessionToken,
  groupQuestId,
  action,
  payload,
}: {
  sessionToken?: string | null;
  groupQuestId: string;
  action: "join" | "leave" | "refresh" | "create" | "update" | "remove-participant";
  payload?: Record<string, unknown>;
}): Promise<MobileGroupQuestActionResponse> {
  const response = await fetchWithTimeout(buildMobileUrl(`/api/mobile/groupquests/${groupQuestId}`), {
    method: "POST",
    headers: buildMobileAuthHeaders(sessionToken),
    body: JSON.stringify({ action, ...(payload ?? {}) }),
  }, 20000);
  const result = await readMobileJson<MobileGroupQuestActionResponse>(response, "multiplayer action");

  if (!response.ok) {
    throw new Error(result.message || `Side Quest Chess mobile multiplayer action failed: ${response.status}`);
  }

  return result;
}

export async function submitMobileCommunityMultiplayerReport({
  sessionToken,
  targetId,
  reason,
}: {
  sessionToken?: string | null;
  targetId: string;
  reason: string;
}): Promise<{ ok: true; reportId: string; submittedAt: string; message: string }> {
  const cleanReason = reason.trim().replace(/\s+/g, " ");
  if (cleanReason.length < 3) throw new Error("Add a short reason before reporting this Side Quest.");
  if (reason.length > 500) throw new Error("Keep the report reason to 500 characters or fewer.");
  if (!/^[A-Za-z0-9][A-Za-z0-9_./:-]{0,119}$/.test(targetId)) throw new Error("Choose a valid Community Multiplayer Side Quest.");

  const response = await fetchWithTimeout(buildMobileUrl("/api/reports/content"), {
    method: "POST",
    headers: { ...buildMobileAuthHeaders(sessionToken), "X-Side-Quest-Chess-Client": "android" },
    body: JSON.stringify({ targetType: "community-multiplayer", targetId, reason: cleanReason }),
  });
  let result: { ok: boolean; reportId?: string; submittedAt?: string; message?: string };
  try {
    result = await readMobileJson(response, "Community Multiplayer report");
  } catch {
    throw new Error("Could not send the report. Try again.");
  }

  if (!response.ok || !result.ok || !result.reportId || !result.submittedAt) {
    const safeMessages = new Set([
      "Sign in before reporting Community content.",
      "Choose a Community Multiplayer Side Quest and add a short reason.",
      "Choose a valid Community Multiplayer Side Quest and add a short reason.",
      "That Community Multiplayer Side Quest is not available to report.",
      "You cannot report your own Multiplayer Side Quest.",
      "Could not safely store this report. Please contact support.",
    ]);
    throw new Error(result.message && safeMessages.has(result.message) ? result.message : "Could not send the report. Try again.");
  }

  return { ok: true, reportId: result.reportId, submittedAt: result.submittedAt, message: "Report sent. We’ll review this Multiplayer Side Quest." };
}

export async function blockMobileCommunityCreator({
  sessionToken,
  targetId,
}: {
  sessionToken?: string | null;
  targetId: string;
}): Promise<{ ok: true; action: "blocked"; message: string }> {
  if (!/^[A-Za-z0-9][A-Za-z0-9_./:-]{0,119}$/.test(targetId)) throw new Error("Choose a valid Community Multiplayer creator.");
  const response = await fetchWithTimeout(buildMobileUrl("/api/blocks/users"), {
    method: "POST",
    headers: { ...buildMobileAuthHeaders(sessionToken), "X-Side-Quest-Chess-Client": "android" },
    body: JSON.stringify({ targetType: "community-multiplayer", targetId, action: "block" }),
  });
  const result = await readMobileJson<{ ok: boolean; action?: "blocked"; message?: string }>(response, "Community creator block");
  if (!response.ok || !result.ok || result.action !== "blocked") {
    throw new Error(result.message || "Could not block this creator. Try again.");
  }
  return {
    ok: true,
    action: "blocked",
    message: result.message ?? "Creator blocked.",
  };
}

export async function runMobileCommunityLikeAction({
  sessionToken,
  targetType,
  targetId,
  intent,
}: {
  sessionToken?: string | null;
  targetType: "solo" | "multiplayer";
  targetId: string;
  intent: "like" | "unlike";
}): Promise<MobileCommunityLikeResponse> {
  const response = await fetchWithTimeout(buildMobileUrl("/api/mobile/community-likes"), {
    method: "POST",
    headers: buildMobileAuthHeaders(sessionToken),
    body: JSON.stringify({ targetType, targetId, intent }),
  }, 20000);
  const result = await readMobileJson<MobileCommunityLikeResponse>(response, "community like action");

  if (!response.ok) {
    throw new Error(result.message || `Side Quest Chess mobile community like action failed: ${response.status}`);
  }

  return result;
}

async function readMobileJson<T>(response: Response, label: string): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    const text = await response.text().catch(() => "");
    const htmlTitle = text.match(/<title>(.*?)<\/title>/i)?.[1]?.trim();
    throw new Error(htmlTitle ? `${label} returned ${response.status}: ${htmlTitle}` : `${label} returned ${response.status} instead of JSON.`);
  }

  return response.json() as Promise<T>;
}

function buildMobileAuthHeaders(sessionToken?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  if (sessionToken) {
    headers.Authorization = `Bearer ${sessionToken}`;
  }

  return headers;
}
