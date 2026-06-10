import { CHALLENGES } from "@/lib/challenges";

export type UserMetadataRecord = Record<string, unknown>;

export type ChallengeProgress = {
  completedChallengeIds: string[];
  totalCompletedChallenges: number;
  totalRewardPoints: number;
};

export type ActiveChallenge = {
  id: string;
  status?: string;
  startedAt?: string;
  verifiedAt?: string;
};

export type ChallengeFailureDiagnostic = {
  label?: string;
  explanation?: string;
  moveNumber?: number;
  ply?: number;
  san?: string;
  uci?: string;
  fenAtBreak?: string;
  playerColor?: "white" | "black";
};

export type ChallengeAttempt = {
  id?: string;
  challengeId?: string;
  gameId?: string;
  provider?: "lichess" | "chess.com" | "fixture";
  status?: string;
  summary?: string;
  checkedAt?: string;
  startedGameAt?: string;
  completedGameAt?: string;
  finalPositionFen?: string;
  lastMoveUci?: string;
  lastMoveSan?: string;
  playerColor?: "white" | "black";
  failureDiagnostic?: ChallengeFailureDiagnostic;
};

export function getLichessUsername(metadata: UserMetadataRecord): string {
  return typeof metadata.lichessUsername === "string" ? metadata.lichessUsername : "";
}

export function getChessComUsername(metadata: UserMetadataRecord): string {
  return typeof metadata.chessComUsername === "string" ? metadata.chessComUsername : "";
}

export function getRunnerDisplayName(metadata: UserMetadataRecord): string {
  return typeof metadata.runnerDisplayName === "string" ? metadata.runnerDisplayName : "";
}

export function getClerkHumanName(user: {
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  emailAddress?: string | null;
}): string {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();

  if (fullName) {
    return fullName;
  }

  if (user.firstName?.trim()) {
    return user.firstName.trim();
  }

  if (user.username?.trim()) {
    return user.username.trim();
  }

  if (user.emailAddress?.trim()) {
    return user.emailAddress.trim();
  }

  return "";
}

export function getPreferredRunnerName(
  metadata: UserMetadataRecord,
  user: {
    firstName?: string | null;
    lastName?: string | null;
    username?: string | null;
    emailAddress?: string | null;
  },
): string {
  return getRunnerDisplayName(metadata) || getClerkHumanName(user);
}

export function getRunnerBio(metadata: UserMetadataRecord): string {
  return typeof metadata.runnerBio === "string" ? metadata.runnerBio : "";
}

export function getActiveChallenge(metadata: UserMetadataRecord): ActiveChallenge | null {
  if (
    typeof metadata.activeChallenge === "object" &&
    metadata.activeChallenge !== null &&
    "id" in (metadata.activeChallenge as Record<string, unknown>)
  ) {
    const candidate = metadata.activeChallenge as Record<string, unknown>;

    if (typeof candidate.id === "string") {
      return {
        id: candidate.id,
        status: typeof candidate.status === "string" ? candidate.status : undefined,
        startedAt:
          typeof candidate.startedAt === "string" ? candidate.startedAt : undefined,
        verifiedAt:
          typeof candidate.verifiedAt === "string" ? candidate.verifiedAt : undefined,
      };
    }
  }

  return null;
}


export const DEFAULT_STARTER_CHALLENGE_ID = "finish-any-game";

export function buildDefaultStarterActiveChallenge(now = new Date()): ActiveChallenge {
  return {
    id: DEFAULT_STARTER_CHALLENGE_ID,
    status: "accepted",
    startedAt: now.toISOString(),
  };
}

export function shouldPreselectDefaultStarterQuest(metadata: UserMetadataRecord): boolean {
  if (getActiveChallenge(metadata)) return false;

  const progress = getChallengeProgress(metadata);
  if (progress.completedChallengeIds.length > 0) return false;

  return getChallengeAttempts(metadata).length === 0;
}

export function withDefaultStarterQuest(metadata: UserMetadataRecord, now = new Date()): UserMetadataRecord {
  if (!shouldPreselectDefaultStarterQuest(metadata)) return metadata;

  return {
    ...metadata,
    activeChallenge: buildDefaultStarterActiveChallenge(now),
  };
}

export function getChallengeAttempts(
  metadata: UserMetadataRecord,
  challengeId?: string,
): ChallengeAttempt[] {
  if (!Array.isArray(metadata.challengeAttempts)) {
    return [];
  }

  return metadata.challengeAttempts
    .filter((entry): entry is ChallengeAttempt => {
      return Boolean(
        entry &&
          typeof entry === "object" &&
          (entry as Record<string, unknown>).summary &&
          (entry as Record<string, unknown>).checkedAt,
      );
    })
    .filter((attempt) => {
      const attemptChallengeId =
        typeof attempt.challengeId === "string"
          ? attempt.challengeId
          : typeof attempt.id === "string"
            ? attempt.id.split(":")[0]
            : undefined;

      if (!challengeId) {
        return Boolean(attemptChallengeId);
      }

      return attemptChallengeId === challengeId;
    });
}

export function getLatestChallengeAttempt(
  metadata: UserMetadataRecord,
  challengeId?: string,
): ChallengeAttempt | null {
  return getChallengeAttempts(metadata, challengeId).at(-1) ?? null;
}

export function buildChallengeProgressRecord(completedChallengeIds: string[]): ChallengeProgress {
  return {
    completedChallengeIds,
    totalCompletedChallenges: completedChallengeIds.length,
    totalRewardPoints: completedChallengeIds.reduce((sum, id) => {
      const challenge = CHALLENGES.find((item) => item.id === id);
      return sum + (challenge?.reward ?? (id.startsWith("custom-") ? 100 : 0));
    }, 0),
  };
}

export function getChallengeProgress(metadata: UserMetadataRecord): ChallengeProgress {
  const raw = metadata.challengeProgress;

  if (!raw || typeof raw !== "object") {
    return buildChallengeProgressRecord([]);
  }

  const record = raw as Record<string, unknown>;
  const completedChallengeIds = Array.isArray(record.completedChallengeIds)
    ? record.completedChallengeIds.filter((entry): entry is string => typeof entry === "string")
    : [];

  return {
    completedChallengeIds,
    totalCompletedChallenges:
      typeof record.totalCompletedChallenges === "number" && record.totalCompletedChallenges >= 0
        ? record.totalCompletedChallenges
        : completedChallengeIds.length,
    totalRewardPoints:
      typeof record.totalRewardPoints === "number" && record.totalRewardPoints >= 0
        ? record.totalRewardPoints
        : completedChallengeIds.reduce((sum, id) => {
            const challenge = CHALLENGES.find((item) => item.id === id);
            return sum + (challenge?.reward ?? (id.startsWith("custom-") ? 100 : 0));
          }, 0),
  };
}

export function compactChallengeAttempts(attempts: ChallengeAttempt[], maxRecentAttempts = 8): ChallengeAttempt[] {
  const compacted = attempts.map((attempt) => ({
    ...attempt,
    summary: attempt.summary ? attempt.summary.slice(0, 220) : attempt.summary,
  }));
  const latestPassedByChallenge = new Map<string, ChallengeAttempt>();

  for (const attempt of compacted) {
    const challengeId = attempt.challengeId ?? attempt.id?.split(":")[0];

    if (attempt.status === "passed" && challengeId) {
      latestPassedByChallenge.set(challengeId, attempt);
    }
  }

  const keepKeys = new Set(
    [
      ...compacted.slice(-maxRecentAttempts),
      ...latestPassedByChallenge.values(),
    ].map((attempt) => attempt.id ?? `${attempt.challengeId}:${attempt.provider}:${attempt.checkedAt}:${attempt.gameId}`),
  );

  return compacted.filter((attempt) =>
    keepKeys.has(attempt.id ?? `${attempt.challengeId}:${attempt.provider}:${attempt.checkedAt}:${attempt.gameId}`),
  );
}

export function challengeBanner(challenge: ActiveChallenge | null): string {
  if (!challenge) {
    return "Pick one to begin a new run.";
  }

  if (!challenge.startedAt) {
    return "Accepted but not started yet.";
  }

  if (challenge.status === "verified") {
    return `Verified at ${formatTime(challenge.verifiedAt)}.`;
  }

  if (challenge.status === "suggested") {
    return "Suggested next quest. Open it and start verifying when you are ready.";
  }

  if (challenge.status === "accepted") {
    return `Started ${formatTime(challenge.startedAt)}. Check your latest games after you finish one.`;
  }

  return `Quest is active since ${formatTime(challenge.startedAt)}.`;
}

export function formatChallengeId(id: string): string {
  const formatted = id.replace(/-/g, " ");
  return formatted
    .split(" ")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function formatAttemptStatus(status?: string): string {
  if (!status) {
    return "Pending review";
  }

  if (status === "pending") {
    return "Pending review";
  }

  return status
    .split(/[-_\s]+/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function buildAttemptSummary(attempt: ChallengeAttempt | null): {
  headline: string;
  detail: string;
  meta: string;
} {
  if (!attempt) {
    return {
      headline: "No latest-game check yet",
      detail: "Start a quest, play on Lichess or Chess.com, then use Check latest games to create the first review record.",
      meta: "No latest check yet",
    };
  }

  const statusLabel = formatAttemptStatus(attempt.status);
  const isSyntheticLatestGameStatus = isSyntheticLatestGameReceipt(attempt);
  const gameLabel = isSyntheticLatestGameStatus
    ? "No post-start game found yet"
    : attempt.gameId
      ? `Game ${attempt.gameId}`
      : "Game ID missing";
  const playedAt = isSyntheticLatestGameStatus ? undefined : attempt.startedGameAt ?? attempt.completedGameAt;
  const gameTimeLabel = playedAt ? ` • Game played ${formatTime(playedAt)}` : "";

  return {
    headline: statusLabel,
    detail: sanitizeAttemptSummary(attempt.summary),
    meta: `${gameLabel}${gameTimeLabel} • Receipt updated ${formatTime(attempt.checkedAt)}`,
  };
}

export function isSyntheticLatestGameReceipt(attempt: Pick<ChallengeAttempt, "gameId" | "status"> | null | undefined): boolean {
  const gameId = attempt?.gameId ?? "";

  return attempt?.status === "pending" && /-(no-new-game-after-start|new-game-time-unconfirmed)$/.test(gameId);
}

export function sanitizeAttemptSummary(summary?: string): string {
  if (!summary) return "Latest attempt saved.";

  return summary
    .replace(/the Proof Loop Test passed\./gi, "Any Game Counts is complete.")
    .replace(/the Any Game Counts passed\./gi, "Any Game Counts is complete.")
    .replace(/Proof Loop Test/gi, "Any Game Counts")
    .replace(/proof loop/gi, "proof check")
    .replace(/Win, loss, draw, color, and time control are accepted for this test quest\./gi, "Win, loss, draw, color, and time control all count.")
    .replace(/Win, loss, draw, color, and time control are accepted for\.?/gi, "Win, loss, draw, color, and time control all count.")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatTime(value?: string): string {
  if (!value) {
    return "just now";
  }

  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}
