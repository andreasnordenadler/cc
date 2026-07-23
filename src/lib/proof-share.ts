import { getChallengeById, type Challenge } from "@/lib/challenges";
import { getCustomSideQuestBadgeUrl, type CustomSideQuest } from "@/lib/custom-side-quests";
import { sanitizeAttemptSummary, type ChallengeAttempt } from "@/lib/user-metadata";

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
    runnerName: normalizeRunnerName(runnerName),
  };

  return `/proof/${await encodePublicProof(payload)}`;
}

export async function buildCompletedOfficialPublicProofPath({
  completed,
  attempt,
  challenge,
  runnerName,
}: {
  completed: boolean;
  attempt: ChallengeAttempt | null;
  challenge: Challenge;
  runnerName?: string;
}) {
  if (!completed || attempt?.status !== "passed") return null;
  return buildPublicProofPath({ attempt, challenge, runnerName });
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
    badgeMotif: "SQC",
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

  const preview = decodePreviewProof(token);
  if (preview) return preview;

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

function decodePreviewProof(token: string | null | undefined): DecodedPublicProof | null {
  if (!token || !token.startsWith("preview-")) return null;

  const challengeId = token.slice("preview-".length);
  const challenge = getChallengeById(challengeId);
  if (!challenge) return null;

  return {
    challenge,
    payload: {
      v: 1,
      challengeId: challenge.id,
      challengeTitle: challenge.title,
      badgeName: challenge.badgeIdentity.name,
      badgeMotif: challenge.badgeIdentity.motif,
      reward: challenge.reward,
      summary: `Preview proof accepted for ${challenge.title}.`,
      checkedAt: "2026-05-24T10:30:00.000Z",
      completedGameAt: "2026-05-24T10:24:00.000Z",
      gameId: "preview-proof-game",
      provider: "lichess",
      finalPositionFen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 2 3",
      lastMoveUci: "f1c4",
      lastMoveSan: "Bc4",
      runnerName: "Andreas",
    },
  };
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

function normalizeRunnerName(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, 80) : undefined;
}
