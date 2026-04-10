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

export type ChallengeAttempt = {
  id?: string;
  challengeId?: string;
  gameId?: string;
  status?: string;
  summary?: string;
  checkedAt?: string;
};

export function getLichessUsername(metadata: UserMetadataRecord): string {
  return typeof metadata.lichessUsername === "string" ? metadata.lichessUsername : "";
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

export function getChallengeProgress(metadata: UserMetadataRecord): ChallengeProgress {
  const raw = metadata.challengeProgress;

  if (!raw || typeof raw !== "object") {
    return {
      completedChallengeIds: [],
      totalCompletedChallenges: 0,
      totalRewardPoints: 0,
    };
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
            return sum + (challenge?.reward ?? 0);
          }, 0),
  };
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
    return "Suggested next challenge. Open it and start verifying when you are ready.";
  }

  if (challenge.status === "accepted") {
    return `Started ${formatTime(challenge.startedAt)}. Check your latest games after you finish one.`;
  }

  return `Challenge is active since ${formatTime(challenge.startedAt)}.`;
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
      headline: "No attempt submitted yet",
      detail: "Submit a finished Lichess game to create your first review record.",
      meta: "No latest attempt yet",
    };
  }

  const statusLabel = formatAttemptStatus(attempt.status);
  const gameLabel = attempt.gameId ? `Game ${attempt.gameId}` : "Game ID missing";

  return {
    headline: statusLabel,
    detail: attempt.summary ?? "Latest attempt saved.",
    meta: `${gameLabel} • Updated ${formatTime(attempt.checkedAt)}`,
  };
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
