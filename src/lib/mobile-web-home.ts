import type { ServerGroupQuest } from "./groupquests";
import { getMobileWebTrophyRows } from "./mobile-web-trophies";

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
      const lane = quest.official || quest.id.startsWith("official-") ? "SQC official" : "Community public";
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

export function formatHomeTrophyMeta(meta: string, source?: "multiplayer" | "officialMultiplayer" | "communityMultiplayer" | "solo") {
  if (source !== "solo") return meta;
  const badgeName = meta.replace(/^Official Solo Side Quest\s*·\s*/i, "").trim();
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
