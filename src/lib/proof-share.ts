import { getChallengeById, type Challenge } from "@/lib/challenges";
import { sanitizeAttemptSummary, type ChallengeAttempt } from "@/lib/user-metadata";

export type PublicProofPayload = {
  v: 1;
  challengeId: string;
  challengeTitle: string;
  badgeName: string;
  badgeMotif: string;
  reward: number;
  summary: string;
  checkedAt?: string;
  completedGameAt?: string;
  gameId?: string;
  provider?: ChallengeAttempt["provider"];
  runnerName?: string;
};

export type DecodedPublicProof = {
  payload: PublicProofPayload;
  challenge: Challenge | null;
};

export async function buildPublicProofPath({
  attempt,
  challenge,
  runnerName,
}: {
  attempt: ChallengeAttempt | null;
  challenge: Challenge;
  runnerName?: string;
}) {
  const payload: PublicProofPayload = {
    v: 1,
    challengeId: challenge.id,
    challengeTitle: challenge.title,
    badgeName: challenge.badgeIdentity.name,
    badgeMotif: challenge.badgeIdentity.motif,
    reward: challenge.reward,
    summary: sanitizeAttemptSummary(attempt?.summary),
    checkedAt: attempt?.checkedAt,
    completedGameAt: attempt?.completedGameAt,
    gameId: attempt?.gameId,
    provider: attempt?.provider,
    runnerName: normalizeRunnerName(runnerName),
  };

  return `/proof/${await encodePublicProof(payload)}`;
}

export async function decodePublicProof(token: string): Promise<DecodedPublicProof | null> {
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [body, signature] = parts;
  const expected = await sign(body);
  if (!safeEqual(signature, expected)) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(body)) as PublicProofPayload;
    if (payload.v !== 1 || typeof payload.challengeId !== "string" || typeof payload.challengeTitle !== "string") {
      return null;
    }

    return {
      payload,
      challenge: getChallengeById(payload.challengeId) ?? null,
    };
  } catch {
    return null;
  }
}

export function publicProofImagePath(token: string) {
  return `/api/og/proof/${token}`;
}

async function encodePublicProof(payload: PublicProofPayload) {
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = await sign(body);
  return `${body}.${signature}`;
}

async function sign(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getProofSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return bytesToBase64Url(new Uint8Array(signature));
}

function getProofSecret() {
  return (
    process.env.SQC_PROOF_SHARE_SECRET ||
    process.env.CLERK_SECRET_KEY ||
    process.env.AUTH_SECRET ||
    "side-quest-chess-local-proof-secret"
  );
}

function base64UrlEncode(value: string) {
  return bytesToBase64Url(new TextEncoder().encode(value));
}

function base64UrlDecode(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");

  if (typeof Buffer !== "undefined") {
    return Buffer.from(padded, "base64").toString("utf8");
  }

  const binary = atob(padded);
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
}

function bytesToBase64Url(bytes: Uint8Array) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64url");
  }

  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;

  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }

  return mismatch === 0;
}

function normalizeRunnerName(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, 80) : undefined;
}
