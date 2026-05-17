import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { compactAnalyticsStore, getAnalyticsStore, isAdminAnalyticsViewer } from "@/lib/analytics";
import { findGroupQuestById, upsertHostGroupQuest, type ServerGroupQuest } from "@/lib/groupquests";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ ok: false, error: "sign_in_required" }, { status: 401 });

  const { id } = await params;
  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object") return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });

  const client = await clerkClient();
  const record = await findGroupQuestById(client, id);
  if (!record) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  if (record.groupQuest.hostUserId !== userId) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const host = await client.users.getUser(record.userId);
  const signedInUser = await client.users.getUser(userId);
  const canSetOfficial = isAdminAnalyticsViewer(signedInUser);
  const updatedQuest = patchGroupQuest(record.groupQuest, payload as Record<string, unknown>, canSetOfficial);
  await client.users.updateUserMetadata(record.userId, {
    privateMetadata: {
      ...(host.privateMetadata ?? {}),
      sqcAnalytics: compactAnalyticsStore(getAnalyticsStore(host.privateMetadata)),
      sqcGroupQuests: upsertHostGroupQuest(host.privateMetadata, updatedQuest),
    },
  });

  return NextResponse.json({ ok: true, href: `/groupquests/${id}${updatedQuest.participants.some((participant) => participant.userId === userId) ? "?accepted=1" : ""}` });
}

function patchGroupQuest(current: ServerGroupQuest, payload: Record<string, unknown>, canSetOfficial: boolean): ServerGroupQuest {
  const providerMode = normalizeProviderMode(payload.providerMode);
  return {
    ...current,
    name: cleanText(payload.name, 64) ?? current.name,
    inviteCopy: cleanText(payload.inviteCopy, 280) ?? current.inviteCopy,
    inviteMode: payload.inviteMode === "unlisted-link" ? "unlisted-link" : "public",
    questIds: Array.isArray(payload.questIds)
      ? payload.questIds.filter((id): id is string => typeof id === "string" && id.length > 0).slice(0, 8)
      : current.questIds,
    providerMode,
    providerLabel: cleanText(payload.providerLabel, 80) ?? providerLabelFor(providerMode),
    official: canSetOfficial && typeof payload.official === "boolean" ? payload.official : current.official,
    officialLabel: canSetOfficial ? cleanText(payload.officialLabel, 80) ?? current.officialLabel : current.officialLabel,
    startAt: normalizeDateTimeValue(payload.startAt) ?? current.startAt,
    endAt: normalizeDateTimeValue(payload.endAt) ?? current.endAt,
    rules: normalizeRules(payload.rules, current.rules),
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
