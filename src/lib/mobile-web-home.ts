import type { ServerGroupQuest } from "./groupquests";
import { CHALLENGES, type Challenge } from "./challenges";
import type { PublicCommunitySideQuest } from "./community-side-quests";
import type { CustomSideQuest } from "./custom-side-quests";
import { getMobileWebTrophyRows } from "./mobile-web-trophies";
import { buildCompletedCustomPublicProofPath, buildCompletedOfficialPublicProofPath } from "./proof-share";
import type { ActiveChallenge, ChallengeAttempt } from "./user-metadata";

const HOME_TROPHY_ROW_LIMIT = 12;

export type ActiveMultiplayerHomeRow = {
  id: string;
  title: string;
  meta: string;
  href: string;
  status: "Host" | "Joined";
  sourceBadge: "Hosted" | "Joined";
};

export type SoloProofHomeAttempt = {
  status?: string | null;
  headline?: string | null;
  summary?: string | null;
};

export type SoloProofHomeStatus = {
  kind: "not-checked" | "no-eligible-game" | "failed" | "completed";
  label: "Not checked" | "No eligible game" | "Not Completed" | "Completed";
  tone: "neutral" | "danger" | "good";
  detail: string;
};

export type HomeActiveSoloQuest = {
  id: string;
  href: string;
  title: string;
  objective: string;
  instruction: string;
  badgeImage: string | null;
  badgeColors: { primary: string; secondary: string; glow: string } | null;
  source: "official" | "custom" | "community";
};

export async function buildHomeActiveSoloProofPath({
  completed,
  officialChallenge,
  customQuest,
  attempt,
  runnerName,
}: {
  completed: boolean;
  officialChallenge: Challenge | null;
  customQuest: CustomSideQuest | null;
  attempt: ChallengeAttempt | null;
  runnerName?: string;
}) {
  if (officialChallenge) {
    return buildCompletedOfficialPublicProofPath({
      completed,
      attempt,
      challenge: officialChallenge,
      runnerName,
    });
  }
  if (customQuest) {
    return buildCompletedCustomPublicProofPath({ completed, attempt, quest: customQuest });
  }
  return null;
}

export function resolveHomeActiveSoloQuest(
  activeQuestId: string | null | undefined,
  customSideQuests: readonly CustomSideQuest[],
  communitySideQuests: readonly PublicCommunitySideQuest[],
  activeSnapshot?: ActiveChallenge["customQuestSnapshot"],
): HomeActiveSoloQuest | null {
  if (!activeQuestId) return null;
  const official = CHALLENGES.find((quest) => quest.id === activeQuestId);
  if (official) {
    return {
      id: official.id,
      href: `/challenges/${encodeURIComponent(official.id)}`,
      title: official.title,
      objective: official.objective,
      instruction: official.instruction,
      badgeImage: official.badgeIdentity.image ?? null,
      badgeColors: official.badgeIdentity.colors,
      source: "official",
    };
  }
  const custom = customSideQuests.find((quest) => quest.id === activeQuestId);
  if (custom) return buildCustomHomeQuest(custom, "custom", `/custom-side-quests/${encodeURIComponent(custom.id)}`);
  const community = communitySideQuests.find((quest) => quest.id === activeQuestId);
  if (community) return buildCustomHomeQuest(community, "community", community.detailPath);
  if (activeSnapshot?.id === activeQuestId && activeSnapshot.title.trim()) {
    const fallback = "Complete this community Side Quest rule in a fresh public game.";
    return {
      id: activeQuestId,
      href: `/challenges/community/${encodeURIComponent(activeQuestId)}`,
      title: activeSnapshot.title.trim(),
      objective: fallback,
      instruction: fallback,
      badgeImage: null,
      badgeColors: null,
      source: "community",
    };
  }
  return null;
}

function buildCustomHomeQuest(
  quest: Pick<CustomSideQuest, "id" | "title" | "summary" | "badgeImageUrl">,
  source: "custom" | "community",
  href: string,
): HomeActiveSoloQuest {
  const summary = typeof quest.summary === "string" && quest.summary.trim()
    ? quest.summary.trim()
    : "Complete your custom Side Quest rule in a fresh public game.";
  return {
    id: quest.id,
    href,
    title: quest.title.trim(),
    objective: summary,
    instruction: summary,
    badgeImage: quest.badgeImageUrl ?? null,
    badgeColors: null,
    source,
  };
}

const uncheckedDetail = "Starting position shown until your next public game is available. Play on Lichess or Chess.com, then come back and refresh proof.";

export function buildActiveMultiplayerHomeRows(
  quests: readonly ServerGroupQuest[],
  userId: string,
  now = Date.now(),
): ActiveMultiplayerHomeRow[] {
  return quests
    .filter((quest) => {
      const related = quest.hostUserId === userId || quest.participants.some((participant) => participant.userId === userId);
      const end = Date.parse(quest.endAt);
      return related && (!Number.isFinite(end) || end >= now);
    })
    .sort((a, b) => timestamp(b.startAt, b.endAt) - timestamp(a.startAt, a.endAt))
    .map((quest) => {
      const hosted = quest.hostUserId === userId;
      const lane = quest.official || quest.id.startsWith("official-") ? "Official" : "Community public";
      return {
        id: quest.id,
        title: quest.name,
        meta: [hosted ? "You host" : null, lane, quest.inviteCopy].filter(Boolean).join(" · "),
        href: `/groupquests/${quest.id}${hosted ? "" : "?accepted=1"}`,
        status: hosted ? "Host" : "Joined",
        sourceBadge: hosted ? "Hosted" : "Joined",
      };
    });
}

function isMultiplayerProofAttempt(attempt: ChallengeAttempt) {
  return attempt.id?.includes(":multiplayer:") === true
    || attempt.summary?.startsWith("Multiplayer proof verified:") === true;
}

function getAttemptChallengeId(attempt: ChallengeAttempt) {
  return attempt.challengeId ?? attempt.id?.split(":")[0];
}

export function getLatestSoloChallengeAttempt(
  attempts: readonly ChallengeAttempt[],
  challengeId: string,
) {
  return attempts.filter((attempt) => getAttemptChallengeId(attempt) === challengeId && !isMultiplayerProofAttempt(attempt)).at(-1) ?? null;
}

export function getLatestPassedSoloChallengeAttempt(
  attempts: readonly ChallengeAttempt[],
  challengeId: string,
) {
  return attempts.filter((attempt) => (
    getAttemptChallengeId(attempt) === challengeId
    && attempt.status === "passed"
    && !isMultiplayerProofAttempt(attempt)
  )).at(-1) ?? null;
}

export function hasCompletedSoloProof(
  challengeId: string,
  completedChallengeIds: readonly string[],
  attempts: readonly ChallengeAttempt[],
) {
  if (!completedChallengeIds.includes(challengeId)) return false;
  const passedAttempts = attempts.filter((attempt) => getAttemptChallengeId(attempt) === challengeId && attempt.status === "passed");
  if (!passedAttempts.length) return true;
  return passedAttempts.some((attempt) => !isMultiplayerProofAttempt(attempt));
}

export function getCompletedSoloQuestIds(
  completedChallengeIds: readonly string[],
  attempts: readonly ChallengeAttempt[],
) {
  const completedIds = [...new Set(completedChallengeIds.filter(Boolean))];
  return completedIds.filter((challengeId) => hasCompletedSoloProof(challengeId, completedIds, attempts));
}

export function countCompletedSoloQuests(
  completedChallengeIds: readonly string[],
  attempts: readonly ChallengeAttempt[],
) {
  return getCompletedSoloQuestIds(completedChallengeIds, attempts).length;
}

export function loadHomeTrophyRows(
  client: Parameters<typeof getMobileWebTrophyRows>[0],
  userId: string,
  completedChallengeIds: string[],
) {
  return getMobileWebTrophyRows(client, userId, completedChallengeIds, HOME_TROPHY_ROW_LIMIT);
}

export function buildSoloProofHomeStatus(
  completed: boolean,
  attempt: SoloProofHomeAttempt | null | undefined,
): SoloProofHomeStatus {
  if (completed || isPassed(attempt)) {
    return {
      kind: "completed",
      label: "Completed",
      tone: "good",
      detail: clean(attempt?.headline) ?? clean(attempt?.summary) ?? "Side Quest proof completed.",
    };
  }

  if (!attempt) {
    return { kind: "not-checked", label: "Not checked", tone: "neutral", detail: uncheckedDetail };
  }

  if (isFailed(attempt)) {
    return {
      kind: "failed",
      label: "Not Completed",
      tone: "danger",
      detail: clean(attempt.summary) ?? clean(attempt.headline) ?? "That game did not match this Side Quest goal.",
    };
  }

  return {
    kind: "no-eligible-game",
    label: "No eligible game",
    tone: "neutral",
    detail: clean(attempt.summary) ?? clean(attempt.headline) ?? "No new eligible game was found.",
  };
}

export function formatHomeTrophyMeta(meta: string, source?: "multiplayer" | "officialMultiplayer" | "communityMultiplayer" | "solo" | "officialSolo" | "customSolo" | "communitySolo") {
  if (source !== "solo" && !source?.endsWith("Solo")) return meta;
  const badgeName = meta.replace(/^(?:Official|Custom|Community) Solo Side Quest\s*·\s*/i, "").trim();
  return badgeName ? `Unlocked ${badgeName}` : "Unlocked Solo Side Quest trophy";
}

function timestamp(primary: string, fallback: string) {
  const primaryTime = Date.parse(primary);
  if (Number.isFinite(primaryTime)) return primaryTime;
  const fallbackTime = Date.parse(fallback);
  return Number.isFinite(fallbackTime) ? fallbackTime : 0;
}

function isPassed(attempt: SoloProofHomeAttempt | null | undefined) {
  return attempt?.status === "passed" || attempt?.headline?.toLowerCase().includes("passed") === true;
}

function isFailed(attempt: SoloProofHomeAttempt) {
  return attempt.status === "failed" || attempt.headline?.toLowerCase().includes("failed") === true;
}

function clean(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed || null;
}
