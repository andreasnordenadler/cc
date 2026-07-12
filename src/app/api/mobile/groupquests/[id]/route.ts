import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { compactAnalyticsStore, getAnalyticsStore } from "@/lib/analytics";
import { getChallengeById } from "@/lib/challenges";
import { findPublicCommunityCustomSideQuestById } from "@/lib/community-side-quests";
import { getCustomSideQuests, parseCustomRuleConfig, type CustomSideQuest } from "@/lib/custom-side-quests";
import { checkLatestGroupQuestChallenge } from "@/lib/groupquest-proof";
import { createGroupQuestRefreshRouteHandler } from "@/lib/groupquest-refresh-route-handler";
import { validateMultiplayerProofConfiguration, validateMultiplayerProofUpdate } from "@/lib/multiplayer-proof-rules";
import {
  buildGroupQuest,
  buildParticipant,
  findGroupQuestById,
  findGroupQuestByInviteKey,
  isBuiltInOfficialGroupQuestHost,
  isGroupQuestFinished,
  joinGroupQuest,
  removeParticipantFromGroupQuest,
  removeStoredGroupQuest,
  updateParticipantProgress,
  upsertHostGroupQuest,
  upsertParticipantGroupQuest,
  type ServerGroupQuest,
} from "@/lib/groupquests";
import { getMobileRequestUserId } from "@/lib/mobile-auth";
import {
  buildChallengeProgressRecord,
  compactChallengeAttempts,
  getChallengeAttempts,
  getChallengeProgress,
  getChessComUsername,
  getLichessUsername,
  getPreferredRunnerName,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

type MobileRefreshRouteDependencies = {
  authenticate: typeof getMobileRequestUserId;
  getClient: () => ReturnType<typeof clerkClient>;
  findQuest: typeof findGroupQuestById;
  check: typeof checkLatestGroupQuestChallenge;
};

let testRefreshDependencies: MobileRefreshRouteDependencies | null = null;

export function setMobileRefreshRouteTestDependencies(dependencies: MobileRefreshRouteDependencies | null) {
  if (process.env.NODE_ENV !== "test") throw new Error("Refresh route dependency overrides are test-only.");
  testRefreshDependencies = dependencies;
}

function createMobileRefreshRouteDependencies(): MobileRefreshRouteDependencies {
  return { authenticate: getMobileRequestUserId, getClient: clerkClient, findQuest: findGroupQuestById, check: checkLatestGroupQuestChallenge };
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const refreshDependencies = testRefreshDependencies ?? createMobileRefreshRouteDependencies();
  const userId = await refreshDependencies.authenticate(request);
  const { id } = await params;

  if (!userId) {
    return NextResponse.json(
      { apiVersion: 1, authenticated: false, ok: false, message: "Sign in to manage Multiplayer Side Quests." },
      { status: 401 },
    );
  }

  const payload = await request.json().catch(() => null) as Record<string, unknown> | null;
  const action = payload?.action;

  if (action !== "join" && action !== "leave" && action !== "refresh" && action !== "create" && action !== "update" && action !== "remove-participant") {
    return NextResponse.json(
      { apiVersion: 1, authenticated: true, ok: false, message: "Choose a valid Multiplayer Side Quest action." },
      { status: 400 },
    );
  }
  let normalizedPayload = payload;
  if (action === "create") {
    const proofConfiguration = validateMultiplayerProofConfiguration(payload ?? {});
    if (!proofConfiguration.ok) return NextResponse.json(
      { apiVersion: 1, authenticated: true, ok: false, code: proofConfiguration.code, message: "Choose valid Multiplayer proof rules and dates." },
      { status: 400 },
    );
    normalizedPayload = { ...(payload ?? {}), ...proofConfiguration };
  }

  const client = await refreshDependencies.getClient();
  const user = await client.users.getUser(userId);
  const metadata = (user.publicMetadata as UserMetadataRecord) ?? {};

  if (action === "create") {
    if (!cleanText(normalizedPayload?.name, 64)) {
      return NextResponse.json(
        { apiVersion: 1, authenticated: true, ok: false, message: "Add a Multiplayer Side Quest name before creating." },
        { status: 400 },
      );
    }

    const hostName = getPreferredRunnerName(metadata, {
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      emailAddress: user.primaryEmailAddress?.emailAddress,
    }) || "SQC host";
    const inviteMode = normalizeInviteMode(payload?.inviteMode);
    const questSelection = await buildGroupQuestSelection(client, payload?.questIds, user.privateMetadata);
    if (questSelection.error) {
      return NextResponse.json(
        { apiVersion: 1, authenticated: true, ok: false, message: questSelection.error },
        { status: 400 },
      );
    }
    const groupQuest = buildGroupQuest({
      hostUserId: userId,
      hostName,
      name: normalizedPayload?.name,
      inviteCopy: normalizedPayload?.inviteCopy,
      inviteMode,
      inviteKey: payload?.inviteKey,
      questIds: questSelection.questIds,
      customQuestSnapshots: questSelection.customQuestSnapshots,
      providerMode: normalizedPayload?.providerMode,
      providerLabel: providerLabelFor(normalizedPayload?.providerMode),
      startAt: normalizeDateTimeValue(normalizedPayload?.startAt) ?? new Date().toISOString(),
      endAt: normalizeDateTimeValue(normalizedPayload?.endAt) ?? defaultEndAt(normalizedPayload?.durationDays),
      rules: normalizedPayload?.rules,
    });

    const hostParticipant = buildMobileParticipant({ groupQuest, userId, metadata, fallbackName: hostName });
    if (hostParticipant) {
      groupQuest.participants = [hostParticipant];
    }

    await client.users.updateUserMetadata(userId, {
      privateMetadata: {
        ...(user.privateMetadata ?? {}),
        sqcAnalytics: compactAnalyticsStore(getAnalyticsStore(user.privateMetadata)),
        sqcGroupQuests: upsertHostGroupQuest(user.privateMetadata, groupQuest),
      },
    });

    return NextResponse.json({
      apiVersion: 1,
      authenticated: true,
      ok: true,
      action,
      groupQuestId: groupQuest.id,
      href: `/groupquests/${groupQuest.id}${hostParticipant ? "?accepted=1" : ""}`,
      inviteKey: groupQuest.inviteMode === "private-key" ? groupQuest.inviteKey ?? null : null,
      message: groupQuest.inviteMode === "private-key"
        ? `Private Multiplayer Side Quest created. Invite key: ${groupQuest.inviteKey}`
        : "Multiplayer Side Quest created and joined.",
    });
  }

  const found = id === "invite"
    ? await findGroupQuestByInviteKey(client, String(payload?.inviteKey ?? ""))
    : await refreshDependencies.findQuest(client, id);

  if (!found) {
    return NextResponse.json(
      { apiVersion: 1, authenticated: true, ok: false, message: "Multiplayer Side Quest not found. Check the invite key or try another quest." },
      { status: 404 },
    );
  }
  if (isGroupQuestFinished(found.groupQuest)) {
    return NextResponse.json(
      { apiVersion: 1, authenticated: true, ok: false, message: "This Multiplayer Side Quest has ended. Final standings are frozen, so table changes and proof checks are closed." },
      { status: 400 },
    );
  }

  if (action === "update") {
    if (found.groupQuest.hostUserId !== userId) {
      return NextResponse.json(
        { apiVersion: 1, authenticated: true, ok: false, message: "Only the owner can change Multiplayer Side Quest settings." },
        { status: 403 },
      );
    }
    const proofConfiguration = validateMultiplayerProofUpdate(payload ?? {}, found.groupQuest);
    if (!proofConfiguration.ok) return NextResponse.json(
      { apiVersion: 1, authenticated: true, ok: false, code: proofConfiguration.code, message: "Choose valid Multiplayer proof rules and dates." },
      { status: 400 },
    );
    normalizedPayload = { ...(payload ?? {}), ...proofConfiguration };

    const questSelection = await buildGroupQuestSelection(client, payload?.questIds, user.privateMetadata, found.groupQuest);
    if (questSelection.error) {
      return NextResponse.json(
        { apiVersion: 1, authenticated: true, ok: false, message: questSelection.error },
        { status: 400 },
      );
    }

    const updatedQuest = patchMobileGroupQuest(found.groupQuest, normalizedPayload ?? {}, questSelection);
    const saveError = await saveHostQuestSafely(client, found.userId, updatedQuest);
    if (saveError) {
      return NextResponse.json(
        { apiVersion: 1, authenticated: true, ok: false, message: saveError },
        { status: 500 },
      );
    }

    return NextResponse.json({
      apiVersion: 1,
      authenticated: true,
      ok: true,
      action,
      groupQuestId: found.groupQuest.id,
      href: `/groupquests/${found.groupQuest.id}`,
      inviteKey: updatedQuest.inviteMode === "private-key" ? updatedQuest.inviteKey ?? null : null,
      message: "Multiplayer Side Quest settings saved.",
    });
  }

  if (action === "remove-participant") {
    if (found.groupQuest.hostUserId !== userId) {
      return NextResponse.json(
        { apiVersion: 1, authenticated: true, ok: false, message: "Only the owner can remove players from this Multiplayer Side Quest." },
        { status: 403 },
      );
    }

    const participantUserId = typeof payload?.participantUserId === "string" ? payload.participantUserId : "";
    if (!participantUserId || participantUserId === userId) {
      return NextResponse.json(
        { apiVersion: 1, authenticated: true, ok: false, message: "Choose another player to remove." },
        { status: 400 },
      );
    }

    const updatedQuest = removeParticipantFromGroupQuest(found.groupQuest, participantUserId);
    const saveError = await saveHostQuestSafely(client, found.userId, updatedQuest);
    if (saveError) {
      return NextResponse.json(
        { apiVersion: 1, authenticated: true, ok: false, message: saveError },
        { status: 500 },
      );
    }

    return NextResponse.json({
      apiVersion: 1,
      authenticated: true,
      ok: true,
      action,
      groupQuestId: found.groupQuest.id,
      href: `/groupquests/${found.groupQuest.id}`,
      message: "Player removed from Multiplayer Side Quest.",
    });
  }

  if (action === "join") {
    const participant = buildMobileParticipant({ groupQuest: found.groupQuest, userId, metadata, fallbackName: user.firstName ?? user.username ?? "SQC player" });
    if (!participant) {
      return NextResponse.json(
        { apiVersion: 1, authenticated: true, ok: false, message: "Add a public Lichess or Chess.com username before joining Multiplayer Side Quests." },
        { status: 400 },
      );
    }

    if (found.groupQuest.inviteMode === "private-key" && cleanInviteKey(payload?.inviteKey) !== cleanInviteKey(found.groupQuest.inviteKey)) {
      return NextResponse.json(
        { apiVersion: 1, authenticated: true, ok: false, message: "That private invite key does not match this Multiplayer Side Quest." },
        { status: 403 },
      );
    }

    const joined = joinGroupQuest(found.groupQuest, participant);
    const saveError = await saveGroupQuestSafely(client, found.userId, joined, userId);
    if (saveError) {
      return NextResponse.json(
        { apiVersion: 1, authenticated: true, ok: false, message: saveError },
        { status: 500 },
      );
    }

    return NextResponse.json({
      apiVersion: 1,
      authenticated: true,
      ok: true,
      action,
      groupQuestId: found.groupQuest.id,
      href: `/groupquests/${found.groupQuest.id}?accepted=1`,
      message: "Joined Multiplayer Side Quest. Play fresh public games, then refresh proof in the app.",
    });
  }

  if (action === "leave") {
    const joined = found.groupQuest.participants.some((participant) => participant.userId === userId);
    if (!joined) {
      return NextResponse.json(
        { apiVersion: 1, authenticated: true, ok: false, message: "You are not joined to this Multiplayer Side Quest." },
        { status: 403 },
      );
    }

    const updatedQuest = removeParticipantFromGroupQuest(found.groupQuest, userId);
    const saveError = await saveGroupQuestSafely(client, found.userId, updatedQuest, userId, { removeParticipant: true });
    if (saveError) {
      return NextResponse.json(
        { apiVersion: 1, authenticated: true, ok: false, message: saveError },
        { status: 500 },
      );
    }

    return NextResponse.json({
      apiVersion: 1,
      authenticated: true,
      ok: true,
      action,
      groupQuestId: found.groupQuest.id,
      href: `/groupquests/${found.groupQuest.id}`,
      message: "Left Multiplayer Side Quest.",
    });
  }

  let saveError: string | null = null;
  const handler = createGroupQuestRefreshRouteHandler({
    mode: "mobile",
    authenticate: async () => userId,
    findQuest: async () => found.groupQuest,
    isFinished: (quest) => isGroupQuestFinished({ endAt: quest.endAt ?? "" }),
    reward: (questId) => getGroupQuestReward(found.groupQuest, questId),
    check: async ({ questId, quest, participant }) => refreshDependencies.check({
        challengeId: questId,
        provider: participant.provider,
        username: participant.username,
        startAt: quest.startAt,
        endAt: quest.endAt,
        rules: quest.rules,
        customQuest: found.groupQuest.customQuestSnapshots?.find((snapshot) => snapshot.id === questId) ?? null,
      }),
    persist: async ({ progress: nextProgress, newlyPassedQuestIds, checks }) => {
      const participant = found.groupQuest.participants.find((entry) => entry.userId === userId)!;
      const lastCheck = checks[checks.length - 1]?.result;
      const refreshedQuest = updateParticipantProgress(found.groupQuest, userId, {
        ...nextProgress,
        lastProofSummary: lastCheck?.summary,
        lastProofAt: new Date().toISOString(),
      });
      saveError = await saveGroupQuestSafely(client, found.userId, refreshedQuest, userId);
      if (!saveError) await mergeMobileMultiplayerCompletions(client, userId, metadata, participant, checks.filter((check) => newlyPassedQuestIds.includes(check.questId)));
    },
  });
  const response = await handler(request, id);
  if (saveError) return NextResponse.json(
    { apiVersion: 1, authenticated: true, ok: false, message: saveError },
    { status: 500 },
  );
  return response;
}


function patchMobileGroupQuest(current: ServerGroupQuest, payload: Record<string, unknown>, questSelection: GroupQuestSelection): ServerGroupQuest {
  const providerMode = normalizeProviderMode(payload.providerMode);
  const inviteMode = normalizeInviteMode(payload.inviteMode);
  return {
    ...current,
    name: cleanText(payload.name, 64) ?? current.name,
    inviteCopy: cleanText(payload.inviteCopy, 280) ?? current.inviteCopy,
    inviteMode,
    inviteKey: inviteMode === "private-key" ? cleanInviteKey(payload.inviteKey) ?? current.inviteKey : current.inviteKey,
    questIds: questSelection.questIds ?? current.questIds,
    customQuestSnapshots: questSelection.customQuestSnapshots ?? current.customQuestSnapshots,
    providerMode,
    providerLabel: providerLabelFor(providerMode),
    startAt: normalizeDateTimeValue(payload.startAt) ?? current.startAt,
    endAt: normalizeDateTimeValue(payload.endAt) ?? (typeof payload.durationDays === "number" ? defaultEndAt(payload.durationDays) : current.endAt),
    rules: normalizeRules(payload.rules, current.rules),
  };
}

type GroupQuestSelection = {
  questIds?: string[];
  customQuestSnapshots?: ServerGroupQuest["customQuestSnapshots"];
  error?: string;
};

async function buildGroupQuestSelection(client: Awaited<ReturnType<typeof clerkClient>>, rawQuestIds: unknown, privateMetadata: unknown, current?: ServerGroupQuest): Promise<GroupQuestSelection> {
  if (!Array.isArray(rawQuestIds)) {
    return current ? {} : { questIds: undefined, customQuestSnapshots: [] };
  }

  const requestedIds = Array.from(new Set(rawQuestIds.filter((questId): questId is string => typeof questId === "string" && questId.length > 0))).slice(0, 8);
  if (!requestedIds.length) return { error: "Choose at least one Side Quest for this Multiplayer lineup." };

  const ownedCustomQuests = new Map(getCustomSideQuests(privateMetadata && typeof privateMetadata === "object" ? privateMetadata as Record<string, unknown> : {}).map((quest) => [quest.id, quest]));
  const currentSnapshots = new Map((current?.customQuestSnapshots ?? []).map((snapshot) => [snapshot.id, snapshot]));
  const customQuestSnapshots: NonNullable<ServerGroupQuest["customQuestSnapshots"]> = [];

  for (const questId of requestedIds) {
    if (getChallengeById(questId)) continue;

    const customQuest = ownedCustomQuests.get(questId) ?? await findPublicCommunityCustomSideQuestById(client, questId);
    if (!customQuest) {
      const existingSnapshot = currentSnapshots.get(questId);
      if (existingSnapshot) {
        customQuestSnapshots.push(existingSnapshot);
        continue;
      }
      return { error: "Only official, public community-created, saved custom snapshots, or your own saved custom Side Quests can be added to multiplayer." };
    }
    if ((customQuest.lifecycle ?? "published") !== "published") return { error: `${customQuest.title} must be published before it can be used in multiplayer.` };
    if (!parseCustomRuleConfig(customQuest.config)?.blocks.length) return { error: `${customQuest.title} needs a launch-ready custom rule before it can be used in multiplayer.` };
    customQuestSnapshots.push(buildCustomSnapshot(customQuest));
  }

  return { questIds: requestedIds, customQuestSnapshots };
}

function buildCustomSnapshot(customQuest: CustomSideQuest): NonNullable<ServerGroupQuest["customQuestSnapshots"]>[number] {
  return {
    id: customQuest.id,
    title: customQuest.title,
    summary: customQuest.summary,
    config: customQuest.config,
    badgeImageUrl: customQuest.badgeImageUrl ?? null,
    reward: 100,
  };
}

function getGroupQuestReward(groupQuest: ServerGroupQuest, questId: string) {
  return getChallengeById(questId)?.reward ?? groupQuest.customQuestSnapshots?.find((snapshot) => snapshot.id === questId)?.reward ?? 100;
}

function normalizeProviderMode(value: unknown): ServerGroupQuest["providerMode"] {
  if (value === "lichess" || value === "chesscom") return value;
  return "both";
}

function normalizeInviteMode(value: unknown): ServerGroupQuest["inviteMode"] {
  if (value === "private-key" || value === "unlisted-link") return value;
  return "public";
}

function normalizeDateTimeValue(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? trimmed.slice(0, 40) : parsed.toISOString();
}

function normalizeRules(value: unknown, fallback: Record<string, string>) {
  if (!value || typeof value !== "object") return fallback;
  const record = value as Record<string, unknown>;
  const customRuleSummary = cleanText(record.customRuleSummary, 180) ?? fallback.customRuleSummary;
  const customRuleConfig = cleanText(record.customRuleConfig, 800) ?? fallback.customRuleConfig;
  return {
    result: cleanText(record.result, 60) ?? fallback.result ?? "Win required",
    timeControl: cleanText(record.timeControl, 60) ?? fallback.timeControl ?? "Any time control",
    rated: cleanText(record.rated, 60) ?? fallback.rated ?? "Any rated state",
    color: cleanText(record.color, 60) ?? fallback.color ?? "Any color",
    ...(customRuleSummary ? { customRuleSummary } : {}),
    ...(customRuleConfig ? { customRuleConfig } : {}),
  };
}

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().slice(0, maxLength);
  return trimmed || undefined;
}

async function mergeMobileMultiplayerCompletions(
  client: Awaited<ReturnType<typeof clerkClient>>,
  userId: string,
  metadata: UserMetadataRecord,
  participant: { provider: "lichess" | "chesscom"; username: string },
  checks: Array<{ questId: string; result: Awaited<ReturnType<typeof checkLatestGroupQuestChallenge>> }>,
) {
  const passedChecks = checks.filter((entry) => entry.result.status === "passed");
  if (!passedChecks.length) return;

  const progress = getChallengeProgress(metadata);
  const completedChallengeIds = Array.from(new Set([...progress.completedChallengeIds, ...passedChecks.map((entry) => entry.questId)]));
  const existingAttempts = getChallengeAttempts(metadata);
  const now = new Date().toISOString();
  const newAttempts = passedChecks.map((entry) => ({
    id: `${entry.questId}:multiplayer:${participant.provider}:${entry.result.gameId}:${now}`,
    challengeId: entry.questId,
    gameId: entry.result.gameId,
    provider: participant.provider === "chesscom" ? "chess.com" as const : "lichess" as const,
    status: "passed",
    summary: `Multiplayer proof verified: ${entry.result.summary}`,
    checkedAt: now,
    completedGameAt: entry.result.gameTime,
  }));

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...metadata,
      challengeProgress: buildChallengeProgressRecord(completedChallengeIds),
      challengeAttempts: compactChallengeAttempts([...existingAttempts, ...newAttempts]),
    },
  });
}

function buildMobileParticipant({
  groupQuest,
  userId,
  metadata,
  fallbackName,
}: {
  groupQuest: ServerGroupQuest;
  userId: string;
  metadata: UserMetadataRecord;
  fallbackName: string;
}) {
  const lichessUsername = getLichessUsername(metadata);
  const chessComUsername = getChessComUsername(metadata);
  const provider = groupQuest.providerMode === "chesscom"
    ? (chessComUsername ? "chesscom" : null)
    : groupQuest.providerMode === "lichess"
      ? (lichessUsername ? "lichess" : null)
      : (lichessUsername ? "lichess" : chessComUsername ? "chesscom" : null);
  const username = provider === "chesscom" ? chessComUsername : provider === "lichess" ? lichessUsername : "";

  return provider
    ? buildParticipant({
        userId,
        provider,
        username,
        leaderboardName: getPreferredRunnerName(metadata, {}) || fallbackName || username,
      })
    : null;
}

async function saveHostQuest(
  client: Awaited<ReturnType<typeof clerkClient>>,
  hostUserId: string,
  groupQuest: ServerGroupQuest,
) {
  const host = await client.users.getUser(hostUserId);
  await client.users.updateUserMetadata(hostUserId, {
    privateMetadata: {
      ...(host.privateMetadata ?? {}),
      sqcAnalytics: compactAnalyticsStore(getAnalyticsStore(host.privateMetadata)),
      sqcGroupQuests: upsertHostGroupQuest(host.privateMetadata, groupQuest),
    },
  });
}

async function saveHostQuestSafely(
  client: Awaited<ReturnType<typeof clerkClient>>,
  hostUserId: string,
  groupQuest: ServerGroupQuest,
) {
  try {
    await saveHostQuest(client, hostUserId, groupQuest);
    return null;
  } catch (error) {
    console.error("mobile_groupquest_save_failed", error);
    return "Could not save Multiplayer Side Quest settings. I compacted the Side Quest data; try again once more.";
  }
}

async function saveGroupQuestSafely(
  client: Awaited<ReturnType<typeof clerkClient>>,
  hostUserId: string,
  groupQuest: ServerGroupQuest,
  participantUserId: string,
  options: { removeParticipant?: boolean } = {},
) {
  if (!isBuiltInOfficialGroupQuestHost(hostUserId)) {
    return saveHostQuestSafely(client, hostUserId, groupQuest);
  }

  try {
    const participantUser = await client.users.getUser(participantUserId);
    await client.users.updateUserMetadata(participantUserId, {
      privateMetadata: {
        ...(participantUser.privateMetadata ?? {}),
        sqcAnalytics: compactAnalyticsStore(getAnalyticsStore(participantUser.privateMetadata)),
        sqcGroupQuests: options.removeParticipant
          ? removeStoredGroupQuest(participantUser.privateMetadata, groupQuest.id)
          : upsertParticipantGroupQuest(participantUser.privateMetadata, groupQuest, participantUserId),
      },
    });
    return null;
  } catch (error) {
    console.error("mobile_official_groupquest_save_failed", error);
    return "Could not save Official Multiplayer Side Quest progress. Try again once more.";
  }
}

function defaultEndAt(value: unknown) {
  const durationDays = typeof value === "number" && Number.isFinite(value) ? Math.max(1, Math.min(30, Math.round(value))) : 7;
  const end = new Date();
  end.setDate(end.getDate() + durationDays);
  end.setHours(23, 59, 0, 0);
  return end.toISOString();
}

function providerLabelFor(value: unknown) {
  if (value === "lichess") return "Lichess only";
  if (value === "chesscom") return "Chess.com only";
  return "Lichess or Chess.com";
}

function cleanInviteKey(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase().replace(/[^a-z0-9-]/g, "") : undefined;
}
