import type { ServerGroupQuest } from "@/lib/groupquests";

export type WebSupportAccountContext = {
  displayName: string | null;
  lichessUsername: string | null;
  chessComUsername: string | null;
  activeSoloQuestTitle: string | null;
  activeMultiplayerQuestCount: number;
  publicHostedMultiplayerQuestCount: number;
};

export type WebSupportDiagnosticsInput = {
  url: string;
  userAgent: string;
  platform: string;
  recordedAt: string;
  account: WebSupportAccountContext | null;
};

export type CommunitySoloReportContext = {
  type: "community-solo";
  questId: string;
  title: string;
  creatorName: string;
  initialMessage: string;
  returnPath: string;
};

export function buildCommunitySoloReportContext(input: Record<string, string | string[] | undefined>): CommunitySoloReportContext | null {
  if (input.report !== "community-solo") return null;
  const questId = readExactReportField(input.questId, 160);
  const title = readExactReportField(input.title, 160);
  const creatorName = readExactReportField(input.creator, 100);
  if (!questId || !title || !creatorName) return null;
  if (!/^[A-Za-z0-9][A-Za-z0-9._~:/-]{0,159}$/.test(questId)) return null;

  const query = new URLSearchParams({ report: "community-solo", questId, title, creator: creatorName });
  return {
    type: "community-solo",
    questId,
    title,
    creatorName,
    initialMessage: `Report Community Solo Side Quest\nTitle: ${title}\nID: ${questId}\nCreator: ${creatorName}\nIssue: `,
    returnPath: `/support?${query.toString()}`,
  };
}

function readExactReportField(value: string | string[] | undefined, limit: number) {
  if (typeof value !== "string") return "";
  if (!value.length || value.length > limit || /[\u0000-\u001f\u007f]/.test(value)) return "";
  return value;
}

export function buildWebSupportAccountContext(input: {
  displayName: string | null;
  lichessUsername: string | null;
  chessComUsername: string | null;
  activeSoloQuestTitle: string | null;
  relatedGroupQuests: ServerGroupQuest[];
  publicGroupQuests: ServerGroupQuest[];
  userId: string;
  now?: Date;
}): WebSupportAccountContext {
  const now = input.now ?? new Date();
  const activeGroupQuests = input.relatedGroupQuests.filter(
    (quest) => quest.official !== true
      && !quest.id.startsWith("official-")
      && quest.participants.some((participant) => participant.userId === input.userId)
      && isActiveByMobileLifecycle(quest.endAt, now),
  );

  return {
    displayName: input.displayName?.trim() || null,
    lichessUsername: input.lichessUsername?.trim() || null,
    chessComUsername: input.chessComUsername?.trim() || null,
    activeSoloQuestTitle: input.activeSoloQuestTitle?.trim() || null,
    activeMultiplayerQuestCount: activeGroupQuests.length,
    publicHostedMultiplayerQuestCount: input.publicGroupQuests.filter(
      (quest) => quest.official !== true && !quest.id.startsWith("official-") && isActiveByMobileLifecycle(quest.endAt, now),
    ).length,
  };
}

function isActiveByMobileLifecycle(endAt: string, now: Date) {
  const end = Date.parse(endAt);
  return !Number.isFinite(end) || end >= now.getTime();
}

export async function loadWebSupportGroupQuestContext(input: {
  loadRelatedGroupQuests: () => Promise<ServerGroupQuest[]>;
  loadPublicGroupQuests: () => Promise<ServerGroupQuest[]>;
}) {
  const [relatedResult, publicResult] = await Promise.allSettled([
    input.loadRelatedGroupQuests(),
    input.loadPublicGroupQuests(),
  ]);
  return {
    relatedGroupQuests: relatedResult.status === "fulfilled" ? relatedResult.value : [],
    publicGroupQuests: publicResult.status === "fulfilled" ? publicResult.value : [],
  };
}

export function buildWebSupportDiagnostics(input: WebSupportDiagnosticsInput) {
  const account = input.account;

  return [
    "Side Quest Chess web diagnostics",
    `URL: ${input.url}`,
    `Browser: ${input.userAgent}`,
    `Platform: ${input.platform}`,
    `Account: ${account ? account.displayName ? `signed in as ${account.displayName}` : "signed in" : "not signed in"}`,
    `Lichess: ${account?.lichessUsername || "not connected"}`,
    `Chess.com: ${account?.chessComUsername || "not connected"}`,
    `Active solo quest: ${account?.activeSoloQuestTitle || "none"}`,
    `Active multiplayer quests: ${account?.activeMultiplayerQuestCount ?? 0}`,
    `Public hosted multiplayer quests: ${account?.publicHostedMultiplayerQuestCount ?? 0}`,
    `Recorded at: ${input.recordedAt}`,
  ].join("\n");
}
