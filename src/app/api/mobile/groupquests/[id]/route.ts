import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { compactAnalyticsStore, getAnalyticsStore } from "@/lib/analytics";
import { getChallengeById } from "@/lib/challenges";
import { checkLatestGroupQuestChallenge } from "@/lib/groupquest-proof";
import {
  buildGroupQuest,
  buildParticipant,
  findGroupQuestById,
  findGroupQuestByInviteKey,
  joinGroupQuest,
  removeParticipantFromGroupQuest,
  updateParticipantProgress,
  upsertHostGroupQuest,
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

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getMobileRequestUserId(request);
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

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const metadata = (user.publicMetadata as UserMetadataRecord) ?? {};

  if (action === "create") {
    if (!cleanText(payload?.name, 64)) {
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
    const inviteMode = payload?.inviteMode === "private-key" ? "private-key" : "public";
    const groupQuest = buildGroupQuest({
      hostUserId: userId,
      hostName,
      name: payload?.name,
      inviteCopy: payload?.inviteCopy,
      inviteMode,
      inviteKey: payload?.inviteKey,
      questIds: payload?.questIds,
      providerMode: payload?.providerMode,
      providerLabel: providerLabelFor(payload?.providerMode),
      startAt: normalizeDateTimeValue(payload?.startAt) ?? new Date().toISOString(),
      endAt: normalizeDateTimeValue(payload?.endAt) ?? defaultEndAt(payload?.durationDays),
      rules: payload?.rules,
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
    : await findGroupQuestById(client, id);

  if (!found) {
    return NextResponse.json(
      { apiVersion: 1, authenticated: true, ok: false, message: "Multiplayer Side Quest not found. Check the invite key or try another quest." },
      { status: 404 },
    );
  }

  if (action === "update") {
    if (found.groupQuest.hostUserId !== userId) {
      return NextResponse.json(
        { apiVersion: 1, authenticated: true, ok: false, message: "Only the owner can change Multiplayer Side Quest settings." },
        { status: 403 },
      );
    }

    const updatedQuest = patchMobileGroupQuest(found.groupQuest, payload ?? {});
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
    const saveError = await saveHostQuestSafely(client, found.userId, joined);
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
      message: "Left Multiplayer Side Quest.",
    });
  }

  const participant = found.groupQuest.participants.find((entry) => entry.userId === userId);
  if (!participant) {
    return NextResponse.json(
      { apiVersion: 1, authenticated: true, ok: false, message: "Join this Multiplayer Side Quest before refreshing proof." },
      { status: 403 },
    );
  }

  const checks = await Promise.all(
    found.groupQuest.questIds.map(async (questId) => ({
      questId,
      result: await checkLatestGroupQuestChallenge({
        challengeId: questId,
        provider: participant.provider,
        username: participant.username,
        startAt: found.groupQuest.startAt,
        endAt: found.groupQuest.endAt,
      }),
    })),
  );
  const completedQuestIds = checks.filter((entry) => entry.result.status === "passed").map((entry) => entry.questId);
  const questFinishedAt = Object.fromEntries(
    checks
      .filter((entry) => entry.result.status === "passed")
      .map((entry) => [entry.questId, entry.result.gameTime ?? new Date().toISOString()]),
  );
  const score = completedQuestIds.reduce((sum, questId) => sum + (getChallengeById(questId)?.reward ?? 0), 0);
  const lastCheck = checks[checks.length - 1]?.result;
  const refreshedQuest = updateParticipantProgress(found.groupQuest, userId, {
    completedQuestIds,
    questFinishedAt,
    score,
    lastProofSummary: lastCheck?.summary,
    lastProofAt: new Date().toISOString(),
  });

  const saveError = await saveHostQuestSafely(client, found.userId, refreshedQuest);
  if (saveError) {
    return NextResponse.json(
      { apiVersion: 1, authenticated: true, ok: false, message: saveError },
      { status: 500 },
    );
  }
  if (completedQuestIds.length) {
    await mergeMobileMultiplayerCompletions(client, userId, metadata, participant, checks);
  }

  return NextResponse.json({
    apiVersion: 1,
    authenticated: true,
    ok: true,
    action,
    groupQuestId: found.groupQuest.id,
    completedQuestIds,
    score,
    checks: checks.map((entry) => ({
      questId: entry.questId,
      status: entry.result.status,
      summary: entry.result.summary,
      gameId: entry.result.gameId,
    })),
    message: `${completedQuestIds.length} of ${found.groupQuest.questIds.length} Multiplayer Side Quest checks verified.`,
  });
}


function patchMobileGroupQuest(current: ServerGroupQuest, payload: Record<string, unknown>): ServerGroupQuest {
  const providerMode = normalizeProviderMode(payload.providerMode);
  const inviteMode = payload.inviteMode === "private-key" ? "private-key" : "public";
  return {
    ...current,
    name: cleanText(payload.name, 64) ?? current.name,
    inviteCopy: cleanText(payload.inviteCopy, 280) ?? current.inviteCopy,
    inviteMode,
    inviteKey: inviteMode === "private-key" ? cleanInviteKey(payload.inviteKey) ?? current.inviteKey : current.inviteKey,
    questIds: Array.isArray(payload.questIds)
      ? payload.questIds.filter((questId): questId is string => typeof questId === "string" && questId.length > 0).slice(0, 8)
      : current.questIds,
    providerMode,
    providerLabel: providerLabelFor(providerMode),
    startAt: normalizeDateTimeValue(payload.startAt) ?? current.startAt,
    endAt: normalizeDateTimeValue(payload.endAt) ?? (typeof payload.durationDays === "number" ? defaultEndAt(payload.durationDays) : current.endAt),
    rules: normalizeRules(payload.rules, current.rules),
  };
}

function normalizeProviderMode(value: unknown): ServerGroupQuest["providerMode"] {
  if (value === "lichess" || value === "chesscom") return value;
  return "both";
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
  return {
    timeControl: cleanText(record.timeControl, 60) ?? fallback.timeControl ?? "Any time control",
    rated: cleanText(record.rated, 60) ?? fallback.rated ?? "Any rated state",
    color: cleanText(record.color, 60) ?? fallback.color ?? "Any color",
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
    return "Could not save Multiplayer Side Quest settings. I compacted the room data; try again once more.";
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
