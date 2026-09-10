import { auth, clerkClient } from "@clerk/nextjs/server";
import { AsyncLocalStorage } from "node:async_hooks";
import { NextResponse } from "next/server";
import { compactAnalyticsStore, getAnalyticsStore, isAdminAnalyticsViewer } from "@/lib/analytics";
import { getChallengeById } from "@/lib/challenges";
import { findPublicCommunityCustomSideQuestById } from "@/lib/community-side-quests";
import { getGroupQuestDetailHref, isCanonicalGroupQuestOwner } from "@/lib/groupquest-edit-access";
import { runSerializedHostGroupQuestMutation } from "@/lib/groupquest-host-mutation-serialization";
import { getCustomSideQuests, parseCustomRuleConfig, type CustomSideQuest } from "@/lib/custom-side-quests";
import { findGroupQuestById, getStoredGroupQuests, isGroupQuestFinished, upsertHostGroupQuest, type ServerGroupQuest } from "@/lib/groupquests";
import { validateMultiplayerProofUpdate } from "@/lib/multiplayer-proof-rules";

type WebUpdateRouteDependencies = {
  authenticate: () => Promise<string | null>;
  getClient: () => ReturnType<typeof clerkClient>;
  findQuest: typeof findGroupQuestById;
};

const testDependencies = new AsyncLocalStorage<WebUpdateRouteDependencies>();

export function withWebUpdateRouteTestDependencies<Result>(dependencies: WebUpdateRouteDependencies, callback: () => Result): Result {
  if (process.env.NODE_ENV !== "test") throw new Error("Update route dependency overrides are test-only.");
  return testDependencies.run(dependencies, callback);
}

function createWebUpdateRouteDependencies(): WebUpdateRouteDependencies {
  return {
    authenticate: async () => (await auth()).userId,
    getClient: clerkClient,
    findQuest: findGroupQuestById,
  };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const dependencies = process.env.NODE_ENV === "test"
    ? testDependencies.getStore() ?? createWebUpdateRouteDependencies()
    : createWebUpdateRouteDependencies();
  const userId = await dependencies.authenticate();
  if (!userId) return NextResponse.json({ ok: false, error: "sign_in_required" }, { status: 401 });

  const { id } = await params;
  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object") return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  const client = await dependencies.getClient();
  const record = await dependencies.findQuest(client, id);
  if (!record) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  if (!isCanonicalGroupQuestOwner(userId, { hostUserId: record.groupQuest.hostUserId, storageUserId: record.userId })) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  if (isGroupQuestFinished(record.groupQuest)) return NextResponse.json({ ok: false, error: "finished" }, { status: 400 });
  const initialProofConfiguration = validateMultiplayerProofUpdate(payload as Record<string, unknown>, record.groupQuest);
  if (!initialProofConfiguration.ok) return NextResponse.json({ ok: false, error: initialProofConfiguration.code }, { status: 400 });
  const rawPayload = payload as Record<string, unknown>;

  const signedInUser = await client.users.getUser(userId);
  const canSetOfficial = isAdminAnalyticsViewer(signedInUser);
  const updateResult = await runSerializedHostGroupQuestMutation(record.userId, async () => {
    const host = await client.users.getUser(record.userId);
    const currentQuest = getStoredGroupQuests(host.privateMetadata).find((quest) => quest.id === id);
    if (!currentQuest) return { ok: false as const, error: "groupquest_update_target_missing", status: 409 };
    if (!isCanonicalGroupQuestOwner(userId, { hostUserId: currentQuest.hostUserId, storageUserId: record.userId })) {
      return { ok: false as const, error: "groupquest_update_owner_changed", status: 409 };
    }
    if (isGroupQuestFinished(currentQuest)) return { ok: false as const, error: "finished", status: 409 };
    const proofConfiguration = validateMultiplayerProofUpdate(rawPayload, currentQuest);
    if (!proofConfiguration.ok) return { ok: false as const, error: proofConfiguration.code, status: 409 };
    const normalizedPayload: Record<string, unknown> = { ...rawPayload, ...proofConfiguration };
    const questSelection = await buildGroupQuestSelection(client, normalizedPayload.questIds, signedInUser.privateMetadata, currentQuest);
    if (questSelection.error) return { ok: false as const, error: questSelection.error, status: 400 };
    const groupQuest = patchGroupQuest(currentQuest, normalizedPayload, canSetOfficial, questSelection);
    await client.users.updateUserMetadata(record.userId, {
      privateMetadata: {
        ...(host.privateMetadata ?? {}),
        sqcAnalytics: compactAnalyticsStore(getAnalyticsStore(host.privateMetadata)),
        sqcGroupQuests: upsertHostGroupQuest(host.privateMetadata, groupQuest),
      },
    });
    return { ok: true as const, groupQuest };
  }).catch((error: unknown) => {
    if (error instanceof Error && (
      error.message === "groupquest_pending_completion_lineup"
      || error.message === "groupquest_pending_completion_history"
    )) {
      return { ok: false as const, error: error.message, status: 409 };
    }
    throw error;
  });
  if (!updateResult.ok) {
    return NextResponse.json({ ok: false, error: updateResult.error }, { status: updateResult.status });
  }
  const updatedQuest = updateResult.groupQuest;

  return NextResponse.json({
    ok: true,
    href: getGroupQuestDetailHref(id, updatedQuest.participants.some((participant) => participant.userId === userId)),
  });
}

function patchGroupQuest(current: ServerGroupQuest, payload: Record<string, unknown>, canSetOfficial: boolean, questSelection: Awaited<ReturnType<typeof buildGroupQuestSelection>>): ServerGroupQuest {
  const hasInviteMode = Object.hasOwn(payload, "inviteMode");
  const hasProviderMode = Object.hasOwn(payload, "providerMode");
  const providerMode = hasProviderMode ? normalizeProviderMode(payload.providerMode) : current.providerMode;
  return {
    ...current,
    name: cleanText(payload.name, 64) ?? current.name,
    inviteCopy: cleanText(payload.inviteCopy, 280) ?? current.inviteCopy,
    inviteMode: hasInviteMode
      ? payload.inviteMode === "private-key" ? "private-key" : payload.inviteMode === "unlisted-link" ? "unlisted-link" : "public"
      : current.inviteMode,
    inviteKey: cleanText(payload.inviteKey, 40) ?? current.inviteKey,
    questIds: questSelection.questIds ?? current.questIds,
    customQuestSnapshots: questSelection.customQuestSnapshots ?? current.customQuestSnapshots,
    providerMode,
    providerLabel: cleanText(payload.providerLabel, 80) ?? (hasProviderMode ? providerLabelFor(providerMode) : current.providerLabel),
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
