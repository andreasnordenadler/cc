import { CHALLENGES } from "@/lib/challenges";

export type PublicMultiplayerQuestSource = {
  id: string;
  name: string;
  official?: boolean | null;
  inviteMode: "public" | "unlisted-link" | "private-key";
  inviteCopy: string;
  providerMode: "both" | "lichess" | "chesscom";
  providerLabel: string;
  startAt: string;
  endAt: string;
  rules: Record<string, string>;
  questIds: string[];
  customQuestSnapshots?: Array<{
    id: string;
    title: string;
    summary: string;
    badgeImageUrl?: string | null;
    reward?: number;
  }>;
  participants: unknown[];
};

export type MobilePublicMultiplayerQuest = {
  id: string;
  title: string;
  status: string;
  copy: string;
  href: string;
  playersLabel: string;
  timeLeftLabel: string;
  official: boolean;
  joinState: "Join";
  inviteMode: "public";
  inviteCopy: string;
  providerMode: "both" | "lichess" | "chesscom";
  providerLabel: string;
  startAt: string;
  endAt: string;
  rules: Record<string, string>;
  questIds: string[];
  questTitles: string[];
  customQuestSummaries: Array<{ id: string; title: string; summary: string; badgeImageUrl?: string | null; reward?: number }>;
  ruleRows: Array<{ label: string; value: string }>;
  leaderboardRows?: never;
  progressLabel?: never;
  verifiedLabel?: never;
};

export type MobilePublicMultiplayerCatalog = {
  status: "available" | "unavailable";
  officialGroupQuests: MobilePublicMultiplayerQuest[];
  communityGroupQuests: MobilePublicMultiplayerQuest[];
};

type LoaderDependencies = {
  baseUrl: string;
  listPublicGroupQuests: () => Promise<PublicMultiplayerQuestSource[]>;
  now?: Date;
  warn?: (message: string, context: { reason: string }) => void;
};

export async function loadMobilePublicMultiplayerCatalog({
  baseUrl,
  listPublicGroupQuests,
  now = new Date(),
  warn = (message, context) => console.warn(message, context),
}: LoaderDependencies): Promise<MobilePublicMultiplayerCatalog> {
  try {
    const quests = await listPublicGroupQuests();
    const summaries = quests
      .filter((quest) => quest.inviteMode === "public")
      .map((quest) => toMobilePublicMultiplayerQuest(quest, baseUrl, now));

    return {
      status: "available",
      officialGroupQuests: summaries.filter((quest) => quest.official && quest.status !== "Finished"),
      communityGroupQuests: summaries.filter((quest) => !quest.official),
    };
  } catch (error) {
    warn("mobile public multiplayer catalog unavailable", { reason: safeErrorReason(error) });
    return { status: "unavailable", officialGroupQuests: [], communityGroupQuests: [] };
  }
}

function toMobilePublicMultiplayerQuest(quest: PublicMultiplayerQuestSource, baseUrl: string, now: Date): MobilePublicMultiplayerQuest {
  const official = quest.official === true || quest.id.startsWith("official-");
  const status = deriveStatus(quest.startAt, quest.endAt, now);
  const playersLabel = formatPlayersLabel(quest.participants.length);
  const timeLeftLabel = status === "Finished" ? "Final" : formatTimeLeftLabel(quest.endAt, now);
  const customQuestSummaries = (quest.customQuestSnapshots ?? []).map((snapshot) => ({
    id: snapshot.id,
    title: snapshot.title,
    summary: snapshot.summary,
    badgeImageUrl: snapshot.badgeImageUrl ?? null,
    reward: snapshot.reward ?? 100,
  }));
  const snapshotTitles = new Map(customQuestSummaries.map((snapshot) => [snapshot.id, snapshot.title]));

  return {
    id: quest.id,
    title: quest.name,
    status,
    copy: `${playersLabel} · ${timeLeftLabel}`,
    href: new URL(`/groupquests/${encodeURIComponent(quest.id)}`, baseUrl).toString(),
    playersLabel,
    timeLeftLabel,
    official,
    joinState: "Join",
    inviteMode: "public",
    inviteCopy: quest.inviteCopy,
    providerMode: quest.providerMode,
    providerLabel: quest.providerLabel,
    startAt: quest.startAt,
    endAt: quest.endAt,
    rules: { ...quest.rules },
    questIds: [...quest.questIds],
    questTitles: quest.questIds.map((id) => CHALLENGES.find((challenge) => challenge.id === id)?.title ?? snapshotTitles.get(id) ?? id),
    customQuestSummaries,
    ruleRows: [
      { label: "Games allowed", value: quest.providerLabel },
      { label: "Time control", value: quest.rules.timeControl ?? "Any time control" },
      { label: "Rated", value: quest.rules.rated ?? "Any rated state" },
      { label: "Color", value: quest.rules.color ?? "Any color" },
      ...(quest.rules.customRuleSummary ? [{ label: "Custom rule", value: quest.rules.customRuleSummary }] : []),
    ],
  };
}

function deriveStatus(startAt: string, endAt: string, now: Date) {
  const current = now.getTime();
  const start = Date.parse(startAt);
  const end = Date.parse(endAt);
  if (Number.isFinite(start) && start > current) return "Soon";
  if (Number.isFinite(end) && end < current) return "Finished";
  return "Live";
}

function formatPlayersLabel(count: number) {
  return `${count} player${count === 1 ? "" : "s"}`;
}

function formatTimeLeftLabel(endAt: string, now: Date) {
  const end = Date.parse(endAt);
  if (!Number.isFinite(end)) return "Time TBA";
  const remainingMs = end - now.getTime();
  if (remainingMs <= 0) return "Ended";
  const minutes = Math.ceil(remainingMs / 60_000);
  if (minutes < 60) return `${minutes}m left`;
  const hours = Math.ceil(minutes / 60);
  if (hours < 48) return `${hours}h left`;
  return `${Math.ceil(hours / 24)}d left`;
}

function safeErrorReason(error: unknown) {
  return error instanceof Error && error.message ? error.message : "unknown";
}
