import { getChallengeById, type Challenge } from "@/lib/challenges";
import { getCustomSideQuestBadgeUrl, type CustomSideQuest } from "@/lib/custom-side-quests";
import {
  sanitizeAttemptSummary,
  sanitizePublicIdentityName,
  type ChallengeAttempt,
  type PreferredRunnerIdentity,
} from "@/lib/user-metadata";

export type PublicProofPayload = {
  v: 1;
  challengeId: string;
  challengeTitle: string;
  badgeName: string;
  badgeMotif: string;
  badgeImageUrl?: string;
  reward: number;
  summary: string;
  checkedAt?: string;
  completedGameAt?: string;
  gameId?: string;
  provider?: ChallengeAttempt["provider"];
  finalPositionFen?: string;
  lastMoveUci?: string;
  lastMoveSan?: string;
  runnerName?: string;
  runnerIdentity?: {
    v: 1;
    displayName: string;
    source: "profile-save";
  };
};

export type DecodedPublicProof = {
  payload: PublicProofPayload;
  challenge: Challenge | null;
  canonicalToken: string;
};

export function normalizePublicProofBadgeMotif(value: string | undefined) {
  return !value || /^SQC$/i.test(value) ? "♞" : value;
}

export function normalizePublicProofPayload(payload: PublicProofPayload): PublicProofPayload {
  const normalizeText = (value: string) => value.replace(/\bSQC\b/gi, "Side Quest Chess");
  const trustedIdentity = normalizeSignedProofRunnerIdentity(payload.runnerIdentity, payload.runnerName, normalizeText);
  return {
    ...payload,
    challengeTitle: normalizeText(payload.challengeTitle),
    badgeName: normalizeText(payload.badgeName),
    badgeMotif: normalizePublicProofBadgeMotif(payload.badgeMotif),
    summary: normalizeText(payload.summary),
    runnerName: trustedIdentity?.displayName ?? (payload.runnerName
      ? normalizePublicProofRunnerName(normalizeText(normalizePublicProofRunnerName(payload.runnerName)))
      : undefined),
    runnerIdentity: trustedIdentity,
  };
}

export async function buildPublicProofPath({
  attempt,
  challenge,
  runnerName,
  runnerIdentity,
}: {
  attempt: ChallengeAttempt | null;
  challenge: Challenge;
  runnerName?: string;
  runnerIdentity?: PreferredRunnerIdentity | null;
}) {
  const trustedRunnerName = normalizeTrustedRunnerIdentity(runnerIdentity);
  const payload: PublicProofPayload = {
    v: 1,
    challengeId: challenge.id,
    challengeTitle: challenge.title,
    badgeName: challenge.badgeIdentity.name,
    badgeMotif: challenge.badgeIdentity.motif,
    badgeImageUrl: challenge.badgeIdentity.image,
    reward: challenge.reward,
    summary: sanitizeAttemptSummary(attempt?.summary),
    checkedAt: attempt?.checkedAt,
    completedGameAt: attempt?.completedGameAt,
    gameId: attempt?.gameId,
    provider: attempt?.provider,
    finalPositionFen: attempt?.finalPositionFen,
    lastMoveUci: attempt?.lastMoveUci,
    lastMoveSan: attempt?.lastMoveSan,
    runnerName: trustedRunnerName ?? normalizeRunnerName(runnerName),
    runnerIdentity: trustedRunnerName
      ? { v: 1, displayName: trustedRunnerName, source: "profile-save" }
      : undefined,
  };

  return `/proof/${await encodePublicProof(payload)}`;
}

export async function buildCompletedOfficialPublicProofPath({
  completed,
  attempt,
  challenge,
  runnerName,
  runnerIdentity,
}: {
  completed: boolean;
  attempt: ChallengeAttempt | null;
  challenge: Challenge;
  runnerName?: string;
  runnerIdentity?: PreferredRunnerIdentity | null;
}) {
  if (!completed || attempt?.status !== "passed") return null;
  return buildPublicProofPath({ attempt, challenge, runnerName, runnerIdentity });
}

export async function buildCustomPublicProofPath({
  attempt,
  quest,
}: {
  attempt: ChallengeAttempt | null;
  quest: CustomSideQuest;
}) {
  const payload: PublicProofPayload = {
    v: 1,
    challengeId: quest.id,
    challengeTitle: quest.title,
    badgeName: "Custom Solo Side Quest crest",
    badgeMotif: "♞",
    badgeImageUrl: getCustomSideQuestBadgeUrl(quest),
    reward: 100,
    summary: attempt ? sanitizeAttemptSummary(attempt.summary) : "Completion saved by Side Quest Chess.",
    checkedAt: attempt?.checkedAt,
    completedGameAt: attempt?.completedGameAt,
    gameId: attempt?.gameId,
    provider: attempt?.provider,
    finalPositionFen: attempt?.finalPositionFen,
    lastMoveUci: attempt?.lastMoveUci,
    lastMoveSan: attempt?.lastMoveSan,
  };

  return `/proof/${await encodePublicProof(payload)}`;
}

export async function buildCompletedCustomPublicProofPath({
  completed,
  attempt,
  quest,
}: {
  completed: boolean;
  attempt: ChallengeAttempt | null;
  quest: CustomSideQuest;
}) {
  return completed ? buildCustomPublicProofPath({ attempt, quest }) : null;
}

export async function decodePublicProof(token: string | null | undefined): Promise<DecodedPublicProof | null> {
  if (!token || typeof token !== "string") return null;

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

    const normalizedPayload = normalizePublicProofPayload(payload);
    return {
      payload: normalizedPayload,
      challenge: getChallengeById(payload.challengeId) ?? null,
      canonicalToken: await encodePublicProof(normalizedPayload),
    };
  } catch {
    return null;
  }
}

export function publicProofImagePath(token: string | null | undefined) {
  if (!token) return "/api/og/proof/invalid";
  return `/api/og/proof/${encodeURIComponent(token)}`;
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

function normalizePublicProofRunnerName(value: unknown) {
  const sanitized = sanitizePublicIdentityName(value, "Quest runner");
  return sanitized.length >= 60 ? "Quest runner" : sanitized;
}

function normalizeSignedProofRunnerIdentity(
  value: unknown,
  runnerName: unknown,
  normalizeText: (value: string) => string,
): PublicProofPayload["runnerIdentity"] {
  if (!value || typeof value !== "object") return undefined;
  const record = value as Record<string, unknown>;
  if (
    record.v !== 1
    || record.source !== "profile-save"
    || typeof record.displayName !== "string"
    || typeof runnerName !== "string"
    || record.displayName !== runnerName
  ) return undefined;
  const rawDisplayName = sanitizePublicIdentityName(record.displayName, "");
  if (!rawDisplayName) return undefined;
  const displayName = normalizeText(rawDisplayName);
  if (displayName.length > 256) return undefined;
  return { v: 1, displayName, source: "profile-save" };
}

function normalizeTrustedRunnerIdentity(identity: PreferredRunnerIdentity | null | undefined) {
  if (identity?.provenance !== "profile-save") return undefined;
  const name = sanitizePublicIdentityName(identity.name, "");
  return name && name.length <= 60 ? name : undefined;
}

function normalizeRunnerName(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return normalizePublicProofRunnerName(trimmed);
}
