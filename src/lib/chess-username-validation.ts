import { fetchBoundedProviderJson } from "@/lib/custom-side-quests";

export const CHESS_USERNAME_MAX_LENGTH = 40;
export const CHESS_USERNAME_PATTERN = /^[a-zA-Z0-9_-]{0,40}$/;

export type ChessUsernameValidationResult = {
  ok: boolean;
  username: string;
  message?: string;
  canonicalUsername?: string;
};

type ProviderValidation = {
  provider: "Lichess" | "Chess.com";
  endpoint: string;
  disabledField?: string;
};

export function sanitizeChessUsername(value: unknown): string | null {
  const username = typeof value === "string" ? value.trim() : "";

  if (!CHESS_USERNAME_PATTERN.test(username)) {
    return null;
  }

  return username;
}

export async function validateLichessUsername(username: string): Promise<ChessUsernameValidationResult> {
  return validateProviderUsername(username, {
    provider: "Lichess",
    endpoint: `https://lichess.org/api/user/${encodeURIComponent(username)}`,
    disabledField: "disabled",
  });
}

export async function validateChessComUsername(username: string): Promise<ChessUsernameValidationResult> {
  return validateProviderUsername(username, {
    provider: "Chess.com",
    endpoint: `https://api.chess.com/pub/player/${encodeURIComponent(username.toLowerCase())}`,
  });
}

async function validateProviderUsername(username: string, validation: ProviderValidation): Promise<ChessUsernameValidationResult> {
  const cleaned = sanitizeChessUsername(username);

  if (cleaned === null) {
    return {
      ok: false,
      username,
      message: `${validation.provider} usernames may only use letters, numbers, underscores, or hyphens.`,
    };
  }

  if (!cleaned) {
    return { ok: true, username: "" };
  }

  try {
    let responseStatus: number | undefined;
    const body = await fetchBoundedProviderJson(validation.endpoint, {
      headers: {
        Accept: "application/json",
        "User-Agent": "sqc-username-validation/0.1 (+https://sidequestchess.com)",
      },
      cache: "no-store",
    }, {
      fetcher: async (input, init) => {
        const response = await fetch(input, init);
        responseStatus = response.status;
        return response;
      },
    });

    if (responseStatus === 404) {
      return {
        ok: false,
        username: cleaned,
        message: `${validation.provider} user \"${cleaned}\" was not found.`,
      };
    }

    if (responseStatus === undefined || responseStatus < 200 || responseStatus >= 300) {
      return {
        ok: false,
        username: cleaned,
        message: `${validation.provider} could not verify \"${cleaned}\" right now. Try again in a moment.`,
      };
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new Error("Provider username response was invalid.");
    }
    const record = body as Record<string, unknown>;

    if (validation.disabledField && record[validation.disabledField] === true) {
      return {
        ok: false,
        username: cleaned,
        message: `${validation.provider} user \"${cleaned}\" exists but is disabled, so Side Quest Chess cannot use it for proof checks.`,
      };
    }

    const canonicalUsername = typeof record.username === "string" ? record.username : cleaned;

    return {
      ok: true,
      username: canonicalUsername,
      canonicalUsername,
    };
  } catch {
    return {
      ok: false,
      username: cleaned,
      message: `${validation.provider} username check failed for \"${cleaned}\". Try again in a moment.`,
    };
  }
}
