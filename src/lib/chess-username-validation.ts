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
  const username = typeof value === "string" ? value.trim().slice(0, CHESS_USERNAME_MAX_LENGTH) : "";

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
    const response = await fetch(validation.endpoint, {
      headers: {
        Accept: "application/json",
        "User-Agent": "sqc-username-validation/0.1 (+https://sidequestchess.com)",
      },
      cache: "no-store",
    });

    if (response.status === 404) {
      return {
        ok: false,
        username: cleaned,
        message: `${validation.provider} user \"${cleaned}\" was not found.`,
      };
    }

    if (!response.ok) {
      return {
        ok: false,
        username: cleaned,
        message: `${validation.provider} could not verify \"${cleaned}\" right now. Try again in a moment.`,
      };
    }

    const body = (await response.json()) as Record<string, unknown>;

    if (validation.disabledField && body[validation.disabledField] === true) {
      return {
        ok: false,
        username: cleaned,
        message: `${validation.provider} user \"${cleaned}\" exists but is disabled, so SQC cannot use it for proof checks.`,
      };
    }

    const canonicalUsername = typeof body.username === "string" ? body.username : cleaned;

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
