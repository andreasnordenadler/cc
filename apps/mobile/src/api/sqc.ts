import type { MobileAccountResponse, MobileBootstrap } from "../types/sqc";

const DEFAULT_API_BASE_URL = "https://sidequestchess.com";

export function getApiBaseUrl() {
  return process.env.EXPO_PUBLIC_SQC_API_BASE_URL?.replace(/\/$/, "") || DEFAULT_API_BASE_URL;
}

export async function fetchMobileBootstrap(): Promise<MobileBootstrap> {
  const response = await fetch(`${getApiBaseUrl()}/api/mobile/bootstrap`, {
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
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (sessionToken) {
    headers.Authorization = `Bearer ${sessionToken}`;
  }

  const response = await fetch(`${getApiBaseUrl()}/api/mobile/account`, {
    headers,
  });

  if (response.status === 401) {
    return response.json() as Promise<MobileAccountResponse>;
  }

  if (!response.ok) {
    throw new Error(`SQC mobile account failed: ${response.status}`);
  }

  return response.json() as Promise<MobileAccountResponse>;
}
