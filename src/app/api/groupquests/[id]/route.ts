import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { compactAnalyticsStore, getAnalyticsStore, isAdminAnalyticsViewer } from "@/lib/analytics";
import { getChallengeById } from "@/lib/challenges";
import { findPublicCommunityCustomSideQuestById } from "@/lib/community-side-quests";
import { getGroupQuestDetailHref, isCanonicalGroupQuestOwner } from "@/lib/groupquest-edit-access";
import { getCustomSideQuests, parseCustomRuleConfig, type CustomSideQuest } from "@/lib/custom-side-quests";
import { findGroupQuestById, isGroupQuestFinished, upsertHostGroupQuest, type ServerGroupQuest } from "@/lib/groupquests";
import { validateMultiplayerProofUpdate } from "@/lib/multiplayer-proof-rules";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ ok: false, error: "sign_in_required" }, { status: 401 });

  const { id } = await params;
  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object") return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  const client = await clerkClient();
  const record = await findGroupQuestById(client, id);
  if (!record) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  if (!isCanonicalGroupQuestOwner(userId, { hostUserId: record.groupQuest.hostUserId, storageUserId: record.userId })) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  if (isGroupQuestFinished(record.groupQuest)) return NextResponse.json({ ok: false, error: "finished" }, { status: 400 });
  const proofConfiguration = validateMultiplayerProofUpdate(payload as Record<string, unknown>, record.groupQuest);
  if (!proofConfiguration.ok) return NextResponse.json({ ok: false, error: proofConfiguration.code }, { status: 400 });
  const normalizedPayload: Record<string, unknown> = { ...(payload as Record<string, unknown>), ...proofConfiguration };

  const host = await client.users.getUser(record.userId);
  const signedInUser = await client.users.getUser(userId);
  const questSelection = await buildGroupQuestSelection(client, normalizedPayload.questIds, signedInUser.privateMetadata, record.groupQuest);
  if (questSelection.error) {
    return NextResponse.json({ ok: false, error: questSelection.error }, { status: 400 });
  }
  const canSetOfficial = isAdminAnalyticsViewer(signedInUser);
  const updatedQuest = patchGroupQuest(record.groupQuest, normalizedPayload, canSetOfficial, questSelection);
  await client.users.updateUserMetadata(record.userId, {
    privateMetadata: {
      ...(host.privateMetadata ?? {}),
      sqcAnalytics: compactAnalyticsStore(getAnalyticsStore(host.privateMetadata)),
      sqcGroupQuests: upsertHostGroupQuest(host.privateMetadata, updatedQuest),
    },
  });

  return NextResponse.json({
    ok: true,
    href: getGroupQuestDetailHref(id, updatedQuest.participants.some((participant) => participant.userId === userId)),
  });
}

function patchGroupQuest(current: ServerGroupQuest, payload: Record<string, unknown>, canSetOfficial: boolean, questSelection: Awaited<ReturnType<typeof buildGroupQuestSelection>>): ServerGroupQuest {
  const providerMode = normalizeProviderMode(payload.providerMode);
  return {
    ...current,
    name: cleanText(payload.name, 64) ?? current.name,
    inviteCopy: cleanText(payload.inviteCopy, 280) ?? current.inviteCopy,
    inviteMode: payload.inviteMode === "private-key" ? "private-key" : payload.inviteMode === "unlisted-link" ? "unlisted-link" : "public",
    inviteKey: cleanText(payload.inviteKey, 40) ?? current.inviteKey,
    questIds: questSelection.questIds ?? current.questIds,
    customQuestSnapshots: questSelection.customQuestSnapshots ?? current.customQuestSnapshots,
    providerMode,
    providerLabel: cleanText(payload.providerLabel, 80) ?? providerLabelFor(providerMode),
    official: canSetOfficial && typeof payload.official === "boolean" ? payload.official : current.official,
    officialLabel: canSetOfficial ? cleanText(payload.officialLabel, 80) ?? current.officialLabel : current.officialLabel,
    startAt: normalizeDateTimeValue(payload.startAt) ?? current.startAt,
    endAt: normalizeDateTimeValue(payload.endAt) ?? current.endAt,
    rules: normalizeRules(payload.rules, current.rules),
  };
}

async function buildGroupQuestSelection(client: Awaited<ReturnType<typeof clerkClient>>, rawQuestIds: unknown, privateMetadata: unknown, current: ServerGroupQuest) {
  if (!Array.isArray(rawQuestIds)) return {};
  const requestedIds = Array.from(new Set(rawQuestIds.filter((questId): questId is string => typeof questId === "string" && questId.length > 0))).slice(0, 8);
  if (!requestedIds.length) return { error: "Choose at least one Side Quest for this Multiplayer lineup." };

  const metadata = privateMetadata && typeof privateMetadata === "object" ? privateMetadata as Record<string, unknown> : {};
  const ownedCustomQuests = new Map(getCustomSideQuests(metadata).map((quest) => [quest.id, quest]));
  const currentSnapshots = new Map((current.customQuestSnapshots ?? []).map((snapshot) => [snapshot.id, snapshot]));
  const customQuestSnapshots = [];

  for (const questId of requestedIds) {
    if (getChallengeById(questId)) continue;

    const customQuest = ownedCustomQuests.get(questId) ?? await findPublicCommunityCustomSideQuestById(client, questId);
    if (customQuest) {
      if ((customQuest.lifecycle ?? "published") !== "published") return { error: `${customQuest.title} must be published before it can be used in multiplayer.` };
      if (!parseCustomRuleConfig(customQuest.config)?.blocks.length) return { error: `${customQuest.title} needs a launch-ready custom rule before it can be used in multiplayer.` };
      customQuestSnapshots.push(buildCustomSnapshot(customQuest));
      continue;
    }

    const existingSnapshot = currentSnapshots.get(questId);
    if (existingSnapshot) {
      customQuestSnapshots.push(existingSnapshot);
      continue;
    }

    return { error: "Only official Side Quests, public community-created Side Quests, saved custom snapshots, or your own published custom Side Quests can be added to multiplayer." };
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

function normalizeDateTimeValue(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? trimmed.slice(0, 40) : parsed.toISOString();
}

function normalizeProviderMode(value: unknown): ServerGroupQuest["providerMode"] {
  if (value === "lichess" || value === "chesscom") return value;
  return "both";
}

function providerLabelFor(value: ServerGroupQuest["providerMode"]) {
  if (value === "lichess") return "Lichess only";
  if (value === "chesscom") return "Chess.com only";
  return "Lichess or Chess.com";
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
