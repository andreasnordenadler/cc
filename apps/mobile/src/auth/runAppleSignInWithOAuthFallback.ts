type AppleSignInCompletionState = "complete" | "canceled";

type AppleSignInWithOAuthFallbackParams<TNativeResult, TOAuthResult> = {
  startNative: () => Promise<TNativeResult>;
  completeNative: (result: TNativeResult) => Promise<AppleSignInCompletionState>;
  startOAuth: () => Promise<TOAuthResult>;
  completeOAuth: (result: TOAuthResult) => Promise<AppleSignInCompletionState>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function errorRecords(value: unknown): Record<string, unknown>[] {
  if (!isRecord(value)) return [];
  const nested = Array.isArray(value.errors) ? value.errors.flatMap(errorRecords) : [];
  return [value, ...nested];
}

export function isAppleSignInCancellation(value: unknown): boolean {
  return errorRecords(value).some((record) =>
    typeof record.code === "string" && record.code.toUpperCase() === "ERR_REQUEST_CANCELED"
  );
}

function isAuthorizationInvalidRecord(value: unknown): boolean {
  const records = errorRecords(value);
  const explicitCodes = records
    .filter((record) => Object.prototype.hasOwnProperty.call(record, "code"))
    .map((record) => record.code);
  if (explicitCodes.some((code) => typeof code !== "string")) return false;
  const codes = explicitCodes.map((code) => (code as string).toLowerCase());
  if (codes.some((code) => code !== "authorization_invalid")) return false;
  if (codes.includes("authorization_invalid")) return true;

  const messages = records.flatMap((record) => [record.message, record.longMessage, record.long_message])
    .filter((candidate): candidate is string => typeof candidate === "string");

  return messages.some((message) => message.trim().toLowerCase() === "you are not authorized to perform this request");
}

export async function runAppleSignInWithOAuthFallback<TNativeResult, TOAuthResult>({
  startNative,
  completeNative,
  startOAuth,
  completeOAuth,
}: AppleSignInWithOAuthFallbackParams<TNativeResult, TOAuthResult>): Promise<"native" | "oauth" | "canceled"> {
  let nativeResult: TNativeResult;
  try {
    nativeResult = await startNative();
  } catch (caught) {
    if (!isAuthorizationInvalidRecord(caught)) throw caught;

    const oauthResult = await startOAuth();
    const oauthCompletion = await completeOAuth(oauthResult);
    return oauthCompletion === "complete" ? "oauth" : "canceled";
  }

  const nativeCompletion = await completeNative(nativeResult);
  return nativeCompletion === "complete" ? "native" : "canceled";
}
