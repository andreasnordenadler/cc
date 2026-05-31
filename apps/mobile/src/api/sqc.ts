import type {
  MobileAccountResponse,
  MobileBootstrap,
  MobileGroupQuestActionResponse,
  MobileCustomQuestSaveResponse,
  MobileProfileUpdateResponse,
  MobileSupportMessageResponse,
  MobileQuestActionResponse,
} from "../types/sqc";

const DEFAULT_API_BASE_URL = "https://sidequestchess.com";
const DEFAULT_REQUEST_TIMEOUT_MS = 12000;

export function getApiBaseUrl() {
  return process.env.EXPO_PUBLIC_SQC_API_BASE_URL?.replace(/\/$/, "") || DEFAULT_API_BASE_URL;
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
      throw new Error("SQC mobile request timed out. Check network access and try again.");
    }

    throw caught;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchMobileBootstrap(): Promise<MobileBootstrap> {
  const response = await fetchWithTimeout(`${getApiBaseUrl()}/api/mobile/bootstrap`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`SQC mobile bootstrap failed: ${response.status}`);
  }

  return readMobileJson<MobileBootstrap>(response, "bootstrap");
}

export async function fetchMobileAccountState(sessionToken?: string | null): Promise<MobileAccountResponse> {
  const response = await fetchWithTimeout(`${getApiBaseUrl()}/api/mobile/account`, {
    headers: buildMobileAuthHeaders(sessionToken),
  });

  if (response.status === 401) {
    return readMobileJson<MobileAccountResponse>(response, "account");
  }

  if (!response.ok) {
    throw new Error(`SQC mobile account failed: ${response.status}`);
  }

  return readMobileJson<MobileAccountResponse>(response, "account");
}

export async function updateMobileChessUsernames({
  sessionToken,
  lichessUsername,
  chessComUsername,
}: {
  sessionToken?: string | null;
  lichessUsername: string;
  chessComUsername: string;
}): Promise<MobileProfileUpdateResponse> {
  const response = await fetchWithTimeout(`${getApiBaseUrl()}/api/mobile/profile`, {
    method: "PATCH",
    headers: buildMobileAuthHeaders(sessionToken),
    body: JSON.stringify({ lichessUsername, chessComUsername }),
  });
  const payload = await readMobileJson<MobileProfileUpdateResponse>(response, "profile update");

  if (!response.ok) {
    throw new Error(payload.message || `SQC mobile profile update failed: ${response.status}`);
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
  const response = await fetchWithTimeout(`${getApiBaseUrl()}/api/mobile/support`, {
    method: "POST",
    headers: buildMobileAuthHeaders(sessionToken),
    body: JSON.stringify({ message }),
  });
  const payload = await readMobileJson<MobileSupportMessageResponse>(response, "support message");

  if (!response.ok) {
    throw new Error(payload.message || `SQC mobile support message failed: ${response.status}`);
  }

  return payload;
}


export async function saveMobileCustomSideQuest({
  sessionToken,
  title,
  summary,
  config,
  id,
}: {
  sessionToken?: string | null;
  title: string;
  summary: string;
  config: string;
  id?: string;
}): Promise<MobileCustomQuestSaveResponse> {
  const response = await fetchWithTimeout(`${getApiBaseUrl()}/api/mobile/custom-quests`, {
    method: "POST",
    headers: buildMobileAuthHeaders(sessionToken),
    body: JSON.stringify({ id, title, summary, config }),
  }, 20000);
  const payload = await readMobileJson<MobileCustomQuestSaveResponse>(response, "custom Side Quest save");

  if (!response.ok) {
    throw new Error(payload.message || `SQC mobile custom Side Quest save failed: ${response.status}`);
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
  const response = await fetchWithTimeout(`${getApiBaseUrl()}/api/mobile/quest`, {
    method: "POST",
    headers: buildMobileAuthHeaders(sessionToken),
    body: JSON.stringify({ action, challengeId, gameId }),
  }, 20000);
  const payload = await readMobileJson<MobileQuestActionResponse>(response, "quest action");

  if (!response.ok) {
    throw new Error(payload.message || `SQC mobile quest action failed: ${response.status}`);
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
  const response = await fetchWithTimeout(`${getApiBaseUrl()}/api/mobile/groupquests/${groupQuestId}`, {
    method: "POST",
    headers: buildMobileAuthHeaders(sessionToken),
    body: JSON.stringify({ action, ...(payload ?? {}) }),
  }, 20000);
  const result = await readMobileJson<MobileGroupQuestActionResponse>(response, "multiplayer action");

  if (!response.ok) {
    throw new Error(result.message || `SQC mobile multiplayer action failed: ${response.status}`);
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
