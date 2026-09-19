import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAnalyticsStore, type SQCAnalyticsEventType } from "@/lib/analytics";
import { getChallengeAttempts, getChallengeProgress, type UserMetadataRecord } from "@/lib/user-metadata";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
  const token = process.env.SQC_SIGNUP_MONITOR_TOKEN;
  const authorization = request.headers.get("authorization") || "";
  return Boolean(token && authorization === `Bearer ${token}`);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const client = await clerkClient();
  const users = [];
  for (let offset = 0; ; offset += 100) {
    const page = await client.users.getUserList({ limit: 100, offset, orderBy: "-created_at" });
    users.push(...page.data);
    if (page.data.length < 100) break;
  }

  const now = new Date();
  const windowStart = new Date(now);
  windowStart.setUTCMonth(windowStart.getUTCMonth() - 3);
  const inWindow = (value: string | number | undefined) => {
    const timestamp = value === undefined ? Number.NaN : new Date(value).getTime();
    return Number.isFinite(timestamp) && timestamp >= windowStart.getTime() && timestamp <= now.getTime();
  };

  const cumulative = {
    pageViews: 0,
    profileSaves: 0,
    questStarts: 0,
    questCompletions: 0,
    questFailures: 0,
    questPending: 0,
  };
  const retainedWindowEvents: Partial<Record<SQCAnalyticsEventType, number>> = {};
  const questTotals = new Map<string, { starts: number; completions: number; failures: number; pending: number }>();
  let trackedUsers = 0;
  let activeTrackedUsersInWindow = 0;
  let usersEverStartingQuest = 0;
  let usersEverCompletingQuest = 0;
  let usersWithSavedQuestCompletions = 0;
  let savedQuestCompletionReceipts = 0;
  let accountsWithChessProvider = 0;

  for (const user of users) {
    const publicMetadata = user.publicMetadata as UserMetadataRecord;
    if (hasText(publicMetadata.lichessUsername) || hasText(publicMetadata.chessComUsername)) accountsWithChessProvider += 1;
    const savedCompletionIds = new Set(getChallengeProgress(publicMetadata).completedChallengeIds);
    for (const attempt of getChallengeAttempts(publicMetadata)) {
      if (attempt.status !== "passed") continue;
      const challengeId = typeof attempt.challengeId === "string"
        ? attempt.challengeId
        : typeof attempt.id === "string"
          ? attempt.id.split(":")[0]
          : undefined;
      if (challengeId) savedCompletionIds.add(challengeId);
    }
    if (savedCompletionIds.size > 0) usersWithSavedQuestCompletions += 1;
    savedQuestCompletionReceipts += savedCompletionIds.size;

    const store = getAnalyticsStore(user.privateMetadata);
    const hasAnalytics = Boolean(store.firstSeenAt || store.lastSeenAt || store.totalEvents || store.recentEvents?.length);
    if (!hasAnalytics) continue;
    trackedUsers += 1;
    if (inWindow(store.lastSeenAt)) activeTrackedUsersInWindow += 1;
    if ((store.questStarts ?? 0) > 0) usersEverStartingQuest += 1;
    if ((store.questCompletions ?? 0) > 0) usersEverCompletingQuest += 1;

    cumulative.pageViews += store.pageViews ?? 0;
    cumulative.profileSaves += store.profileSaves ?? 0;
    cumulative.questStarts += store.questStarts ?? 0;
    cumulative.questCompletions += store.questCompletions ?? 0;
    cumulative.questFailures += store.questFailures ?? 0;
    cumulative.questPending += store.questPending ?? 0;

    for (const event of store.recentEvents ?? []) {
      if (inWindow(event.at)) retainedWindowEvents[event.type] = (retainedWindowEvents[event.type] ?? 0) + 1;
    }

    for (const [questId, stats] of Object.entries(store.questStats ?? {})) {
      const total = questTotals.get(questId) ?? { starts: 0, completions: 0, failures: 0, pending: 0 };
      total.starts += stats.starts ?? 0;
      total.completions += stats.completions ?? 0;
      total.failures += stats.failures ?? 0;
      total.pending += stats.pending ?? 0;
      questTotals.set(questId, total);
    }
  }

  const newAccountsInWindow = users.filter((user) => inWindow(user.createdAt)).length;
  const topQuestsCumulative = [...questTotals.entries()]
    .map(([questId, totals]) => ({ questId, ...totals }))
    .sort((a, b) => (b.starts + b.completions) - (a.starts + a.completions))
    .slice(0, 12);

  return NextResponse.json({
    ok: true,
    generatedAt: now.toISOString(),
    reportingWindow: { start: windowStart.toISOString(), end: now.toISOString() },
    exact: {
      totalAccounts: users.length,
      newAccountsInWindow,
      trackedUsers,
      activeTrackedUsersInWindow,
      accountsWithChessProvider,
    },
    cumulativeSinceTrackingBegan: {
      ...cumulative,
      usersEverStartingQuest,
      usersEverCompletingQuest,
      usersWithSavedQuestCompletions,
      savedQuestCompletionReceipts,
      topQuests: topQuestsCumulative,
    },
    lowerBoundInWindowFromRetainedEvents: retainedWindowEvents,
    limitations: [
      "Event counters are cumulative because the original store has no monthly buckets.",
      "Only each user's latest 12 detailed events are retained, so window event counts are lower bounds.",
      "Anonymous page views are logged but not persisted in this Clerk-backed report.",
      "The original schema has no campaign or UTM attribution.",
    ],
  });
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
