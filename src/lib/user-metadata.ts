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

export function getLatestChallengeAttempt(
  metadata: UserMetadataRecord,
  challengeId?: string,
): ChallengeAttempt | null {
  if (!challengeId || !Array.isArray(metadata.challengeAttempts)) {
    return null;
  }

  const items = metadata.challengeAttempts
    .filter((entry): entry is ChallengeAttempt => {
      return Boolean(
        entry &&
          typeof entry === "object" &&
          (entry as Record<string, unknown>).summary &&
          (entry as Record<string, unknown>).checkedAt,
      );
    })
    .filter((attempt) => {
      if (typeof attempt.id !== "string") {
        return false;
      }

      return attempt.id.startsWith(challengeId);
    });

  return items.at(-1) ?? null;
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
