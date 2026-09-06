import type { GroupQuestCheckResult } from "@/lib/groupquest-proof";
import type { ChallengeAttempt, UserMetadataRecord } from "@/lib/user-metadata";
import {
  buildChallengeProgressRecord,
  compactChallengeAttempts,
  getChallengeAttempts,
  getChallengeProgress,
} from "@/lib/user-metadata";

export type GroupQuestPendingCompletion = {
  id: string;
  challengeId: string;
  gameId: string;
  provider: "lichess" | "chesscom";
  summary: string;
  checkedAt: string;
  completedGameAt?: string;
  finalPositionFen?: string;
  lastMoveUci?: string;
  lastMoveSan?: string;
};

type CompletionCheck = { questId: string; result: GroupQuestCheckResult };

export function normalizePendingGroupQuestCompletions(
  value: unknown,
  context?: {
    groupQuestId: string;
    participantProvider?: "lichess" | "chesscom";
    acceptedChallengeIds?: ReadonlySet<string>;
    acceptedCompletionTimes?: Readonly<Record<string, string>>;
  },
): GroupQuestPendingCompletion[] {
  if (!Array.isArray(value)) return [];
  // Inspect the entire supplied set before filtering or enforcing capacity:
  // a conflicting copy must not be hidden by an invalid field or a later index.
  const receiptIds = new Set<string>();
  for (const candidate of value) {
    if (!candidate || typeof candidate !== "object" || typeof candidate.id !== "string") continue;
    if (receiptIds.has(candidate.id)) return [];
    receiptIds.add(candidate.id);
  }
  const normalized: GroupQuestPendingCompletion[] = [];
  for (const candidate of value) {
    if (!candidate || typeof candidate !== "object") continue;
    const record = candidate as Record<string, unknown>;
    const id = cleanExactText(record.id, 500);
    const challengeId = cleanExactText(record.challengeId, 100);
    const gameId = cleanExactText(record.gameId, 200);
    const summary = cleanText(record.summary, 180);
    const checkedAt = cleanExactText(record.checkedAt, 40);
    const provider = record.provider === "lichess" || record.provider === "chesscom" ? record.provider : null;
    if (!id || !challengeId || !gameId || !summary || !checkedAt || !provider) continue;
    if (!isCanonicalIsoTimestamp(checkedAt)) continue;
    const completedGameAt = cleanExactText(record.completedGameAt, 40);
    if ("completedGameAt" in record && (!completedGameAt || !isCanonicalIsoTimestamp(completedGameAt))) continue;
    if (completedGameAt && Date.parse(completedGameAt) > Date.parse(checkedAt)) continue;
    if (context && id !== `${context.groupQuestId}:${challengeId}:multiplayer:${provider}:${gameId}:${checkedAt}`) continue;
    if (context?.participantProvider && provider !== context.participantProvider) continue;
    if (context?.acceptedChallengeIds && !context.acceptedChallengeIds.has(challengeId)) continue;
    const acceptedCompletionTime = context?.acceptedCompletionTimes?.[challengeId];
    if (context?.acceptedCompletionTimes && (!acceptedCompletionTime || !isCanonicalIsoTimestamp(acceptedCompletionTime))) continue;
    if (acceptedCompletionTime && Date.parse(acceptedCompletionTime) > Date.parse(checkedAt)) continue;
    if (completedGameAt && acceptedCompletionTime && completedGameAt !== acceptedCompletionTime) continue;
    normalized.push({
      id,
      challengeId,
      gameId,
      provider,
      summary,
      checkedAt,
      ...(completedGameAt ? { completedGameAt } : {}),
      finalPositionFen: cleanText(record.finalPositionFen, 120),
      lastMoveUci: cleanText(record.lastMoveUci, 20),
      lastMoveSan: cleanText(record.lastMoveSan, 20),
    });
    if (normalized.length > 8) break;
  }
  return normalized;
}

export function buildPendingGroupQuestCompletions(input: {
  groupQuestId: string;
  provider: "lichess" | "chesscom";
  existing: readonly GroupQuestPendingCompletion[];
  newlyPassedQuestIds: readonly string[];
  checks: readonly CompletionCheck[];
  checkedAt?: string;
}): GroupQuestPendingCompletion[] {
  const checkedAt = input.checkedAt ?? new Date().toISOString();
  const groupQuestId = cleanExactText(input.groupQuestId, 80);
  if (!groupQuestId || !isCanonicalIsoTimestamp(checkedAt)) throw new Error("groupquest_completion_receipt_invalid");
  const newlyPassed = new Set(input.newlyPassedQuestIds);
  const existing = normalizePendingGroupQuestCompletions(input.existing, { groupQuestId, participantProvider: input.provider });
  if (existing.length !== input.existing.length) throw new Error("groupquest_completion_receipt_invalid");
  const byId = new Map(existing.map((completion) => [completion.id, completion]));

  for (const { questId, result } of input.checks) {
    if (!newlyPassed.has(questId) || result.status !== "passed") continue;
    const challengeId = cleanExactText(questId, 100);
    const gameId = cleanExactText(result.gameId, 200);
    if (!challengeId || !gameId) throw new Error("groupquest_completion_receipt_invalid");
    const id = `${groupQuestId}:${challengeId}:multiplayer:${input.provider}:${gameId}:${checkedAt}`;
    const completion = normalizePendingGroupQuestCompletions([{
      id,
      challengeId,
      gameId,
      provider: input.provider,
      summary: result.summary,
      checkedAt,
      ...(result.gameTime !== undefined ? { completedGameAt: result.gameTime } : {}),
      finalPositionFen: result.finalPositionFen,
      lastMoveUci: result.lastMoveUci,
      lastMoveSan: result.lastMoveSan,
    }], { groupQuestId })[0];
    if (!completion) throw new Error("groupquest_completion_receipt_invalid");
    byId.set(completion.id, completion);
  }

  const pending = Array.from(byId.values());
  if (pending.length > 8) throw new Error("groupquest_completion_receipt_capacity");
  return pending;
}

export function buildMultiplayerCompletionAccountPatch(
  metadata: UserMetadataRecord,
  pending: readonly GroupQuestPendingCompletion[],
) {
  const uniquePending = Array.from(new Map(pending.map((completion) => [completion.id, completion])).values());
  const progress = getChallengeProgress(metadata);
  const completedChallengeIds = Array.from(new Set([
    ...progress.completedChallengeIds,
    ...uniquePending.map((completion) => completion.challengeId),
  ]));
  const attempts = getChallengeAttempts(metadata);
  const existingIds = new Set(attempts.map((attempt) => attempt.id));
  const newAttempts: ChallengeAttempt[] = uniquePending.filter((completion) => !existingIds.has(completion.id)).map((completion) => ({
    id: completion.id,
    challengeId: completion.challengeId,
    gameId: completion.gameId,
    provider: completion.provider === "chesscom" ? "chess.com" : "lichess",
    status: "passed",
    summary: `Multiplayer proof verified: ${completion.summary}`,
    checkedAt: completion.checkedAt,
    completedGameAt: completion.completedGameAt,
    finalPositionFen: completion.finalPositionFen,
    lastMoveUci: completion.lastMoveUci,
    lastMoveSan: completion.lastMoveSan,
  }));

  // Keep projected receipts in place: array order determines the latest proof.
  // Insert only missing receipts before newer checks without sorting existing history.
  for (const attempt of newAttempts) {
    const newerIndex = attempts.findIndex((existing) => Date.parse(existing.checkedAt ?? "") > Date.parse(attempt.checkedAt ?? ""));
    attempts.splice(newerIndex === -1 ? attempts.length : newerIndex, 0, attempt);
  }

  return {
    challengeProgress: buildChallengeProgressRecord(completedChallengeIds),
    challengeAttempts: compactChallengeAttempts(attempts),
  };
}

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().slice(0, maxLength);
  return trimmed || undefined;
}

function cleanExactText(value: unknown, maxLength: number) {
  if (typeof value !== "string" || value.length > maxLength || value !== value.trim()) return undefined;
  return value || undefined;
}

function isCanonicalIsoTimestamp(value: string) {
  const parsed = new Date(value);
  return Number.isFinite(parsed.valueOf()) && parsed.toISOString() === value;
}
