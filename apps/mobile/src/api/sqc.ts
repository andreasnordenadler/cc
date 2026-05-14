import type { MobileAccountResponse, MobileBootstrap, MobileProfileUpdateResponse } from "../types/sqc";

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

  return response.json() as Promise<MobileBootstrap>;
}

export async function fetchMobileAccountState(sessionToken?: string | null): Promise<MobileAccountResponse> {
  const response = await fetchWithTimeout(`${getApiBaseUrl()}/api/mobile/account`, {
    headers: buildMobileAuthHeaders(sessionToken),
  });

  if (response.status === 401) {
    return response.json() as Promise<MobileAccountResponse>;
  }

  if (!response.ok) {
    throw new Error(`SQC mobile account failed: ${response.status}`);
  }

  return response.json() as Promise<MobileAccountResponse>;
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
  const payload = await response.json() as MobileProfileUpdateResponse;

  if (!response.ok) {
    throw new Error(payload.message || `SQC mobile profile update failed: ${response.status}`);
  }

  return payload;
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
