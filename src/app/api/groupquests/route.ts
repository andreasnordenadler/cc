import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { buildGroupQuest, buildParticipant, upsertHostGroupQuest } from "@/lib/groupquests";
import { compactAnalyticsStore, getAnalyticsStore } from "@/lib/analytics";
import { getChallengeById } from "@/lib/challenges";
import { findPublicCommunityCustomSideQuestById } from "@/lib/community-side-quests";
import { getCustomSideQuests, parseCustomRuleConfig, type CustomSideQuest } from "@/lib/custom-side-quests";
import {
  getChessComUsername,
  getLichessUsername,
  getPreferredRunnerName,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "sign_in_required" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const questSelection = await buildGroupQuestSelection(client, (payload as Record<string, unknown>).questIds, user.privateMetadata);
  if (questSelection.error) {
    return NextResponse.json({ ok: false, error: questSelection.error }, { status: 400 });
  }
  const hostName = getPreferredRunnerName((user.publicMetadata as UserMetadataRecord) ?? {}, {
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    emailAddress: user.primaryEmailAddress?.emailAddress,
  }) || "SQC host";
  const normalizedPayload = normalizeSchedulePayload(payload as Record<string, unknown>);
  const groupQuest = buildGroupQuest({
    ...normalizedPayload,
    questIds: questSelection.questIds,
    customQuestSnapshots: questSelection.customQuestSnapshots,
    hostUserId: userId,
    hostName,
  });
  const publicMetadata = (user.publicMetadata as UserMetadataRecord) ?? {};
  const lichessUsername = getLichessUsername(publicMetadata);
  const chessComUsername = getChessComUsername(publicMetadata);
  const hostProvider = groupQuest.providerMode === "chesscom"
    ? (chessComUsername ? "chesscom" : lichessUsername ? "lichess" : undefined)
    : groupQuest.providerMode === "lichess"
      ? (lichessUsername ? "lichess" : chessComUsername ? "chesscom" : undefined)
      : (lichessUsername ? "lichess" : chessComUsername ? "chesscom" : undefined);
  const hostUsername = hostProvider === "chesscom" ? chessComUsername : hostProvider === "lichess" ? lichessUsername : "";
  const hostParticipant = hostProvider
    ? buildParticipant({
        userId,
        provider: hostProvider,
        username: hostUsername,
        leaderboardName: hostName,
      })
    : null;

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
    ok: true,
    id: groupQuest.id,
    href: `/groupquests/${groupQuest.id}${hostParticipant ? "?accepted=1" : ""}`,
  });
}

async function buildGroupQuestSelection(client: Awaited<ReturnType<typeof clerkClient>>, rawQuestIds: unknown, privateMetadata: unknown) {
  if (!Array.isArray(rawQuestIds)) return { questIds: undefined, customQuestSnapshots: [] };
  const requestedIds = Array.from(new Set(rawQuestIds.filter((questId): questId is string => typeof questId === "string" && questId.length > 0))).slice(0, 8);
  if (!requestedIds.length) return { error: "Choose at least one Side Quest for this Multiplayer lineup." };

  const metadata = privateMetadata && typeof privateMetadata === "object" ? privateMetadata as Record<string, unknown> : {};
  const ownedCustomQuests = new Map(getCustomSideQuests(metadata).map((quest) => [quest.id, quest]));
  const customQuestSnapshots = [];

  for (const questId of requestedIds) {
    if (getChallengeById(questId)) continue;

    const customQuest = ownedCustomQuests.get(questId) ?? await findPublicCommunityCustomSideQuestById(client, questId);
    if (!customQuest) return { error: "Only official, public community-created, or your own saved custom Side Quests can be added to multiplayer." };
    if ((customQuest.lifecycle ?? "published") !== "published") return { error: `${customQuest.title} must be published before it can be used in multiplayer.` };
    if (!parseCustomRuleConfig(customQuest.config)?.blocks.length) return { error: `${customQuest.title} needs a launch-ready custom rule before it can be used in multiplayer.` };
    customQuestSnapshots.push(buildCustomSnapshot(customQuest));
  }

  return { questIds: requestedIds, customQuestSnapshots };
}

function buildCustomSnapshot(customQuest: CustomSideQuest) {
  return {
    id: customQuest.id,
    title: customQuest.title,
    summary: customQuest.summary,
    config: customQuest.config,
    badgeImageUrl: customQuest.badgeImageUrl ?? null,
    reward: 100,
  };
}


function normalizeSchedulePayload(payload: Record<string, unknown>) {
  const startAt = normalizeDateTimeValue(payload.startAt);
  const endAt = normalizeDateTimeValue(payload.endAt);
  return {
    ...payload,
    startAt: payload.openImmediately === true ? new Date().toISOString() : (startAt ?? payload.startAt),
    endAt: endAt ?? payload.endAt,
  };
}

function normalizeDateTimeValue(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? trimmed : parsed.toISOString();
}
