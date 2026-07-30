import type { CustomSideQuest } from "@/lib/custom-side-quests";
import { buildCompletedCustomPublicProofPath } from "@/lib/proof-share";
import {
  getChallengeProgress,
  getChallengeAttempts,
  getLatestChallengeAttempt,
  getLatestPassedChallengeAttempt,
  type ChallengeAttempt,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

export async function buildReplicatedCustomSoloCompletionState({
  metadataRecords,
  quest,
}: {
  metadataRecords: UserMetadataRecord[];
  quest: CustomSideQuest;
}) {
  const completedChallengeIds = Array.from(new Set(metadataRecords.flatMap((metadata) => getChallengeProgress(metadata).completedChallengeIds)));
  const attempts = metadataRecords
    .flatMap((metadata) => getChallengeAttempts(metadata, quest.id))
    .filter(isRenderableAttempt)
    .filter((attempt, index, all) => all.findIndex((candidate) => attemptIdentity(candidate) === attemptIdentity(attempt)) === index)
    .sort((left, right) => Date.parse(left.checkedAt!) - Date.parse(right.checkedAt!));

  return buildCommunitySoloCompletionState({
    metadata: {
      challengeProgress: { completedChallengeIds },
      challengeAttempts: attempts,
    },
    quest,
  });
}

export async function buildCommunitySoloCompletionState({
  metadata,
  quest,
}: {
  metadata: UserMetadataRecord;
  quest: CustomSideQuest;
}) {
  const completed = getChallengeProgress(metadata).completedChallengeIds.includes(quest.id);
  const attempt = normalizeProofAttempt(getLatestPassedChallengeAttempt(metadata, quest.id));
  const latestAttempt = normalizeLatestAttempt(getLatestChallengeAttempt(metadata, quest.id));

  return {
    completed,
    completedAt: attempt?.completedGameAt ?? attempt?.checkedAt ?? null,
    resultHref: await buildCompletedCustomPublicProofPath({ completed, attempt, quest }),
    latestAttempt,
  };
}

function normalizeLatestAttempt(attempt: ChallengeAttempt | null) {
  if (!attempt || typeof attempt.status !== "string" || typeof attempt.summary !== "string" || typeof attempt.checkedAt !== "string") return null;
  return {
    status: attempt.status,
    summary: attempt.summary,
    checkedAt: attempt.checkedAt,
    ...(stringOrUndefined(attempt.finalPositionFen) ? { finalPositionFen: attempt.finalPositionFen as string } : {}),
    ...(stringOrUndefined(attempt.lastMoveSan) ? { lastMoveSan: attempt.lastMoveSan as string } : {}),
    ...(typeof attempt.failureDiagnostic?.label === "string" ? { failureLabel: attempt.failureDiagnostic.label } : {}),
    ...(typeof attempt.failureDiagnostic?.explanation === "string" ? { failureExplanation: attempt.failureDiagnostic.explanation } : {}),
  };
}

function normalizeProofAttempt(attempt: ChallengeAttempt | null): ChallengeAttempt | null {
  if (!attempt || attempt.status !== "passed" || typeof attempt.summary !== "string" || typeof attempt.checkedAt !== "string") return null;

  return {
    status: "passed",
    summary: attempt.summary,
    checkedAt: attempt.checkedAt,
    completedGameAt: stringOrUndefined(attempt.completedGameAt),
    gameId: stringOrUndefined(attempt.gameId),
    provider: attempt.provider === "lichess" || attempt.provider === "chess.com" || attempt.provider === "fixture" ? attempt.provider : undefined,
    finalPositionFen: stringOrUndefined(attempt.finalPositionFen),
    lastMoveUci: stringOrUndefined(attempt.lastMoveUci),
    lastMoveSan: stringOrUndefined(attempt.lastMoveSan),
  };
}

function stringOrUndefined(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function isRenderableAttempt(attempt: ChallengeAttempt) {
  return typeof attempt.status === "string"
    && typeof attempt.summary === "string"
    && typeof attempt.checkedAt === "string"
    && Number.isFinite(Date.parse(attempt.checkedAt));
}

function attemptIdentity(attempt: ChallengeAttempt) {
  return attempt.id ?? [attempt.challengeId, attempt.status, attempt.checkedAt, attempt.gameId].join(":");
}
