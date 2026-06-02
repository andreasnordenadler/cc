import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getMobileRequestUserId } from "@/lib/mobile-auth";
import { chooseCustomSideQuestBadge, getCustomSideQuests, parseCustomRuleConfig, type CustomSideQuest, type CustomSideQuestRuleConfig } from "@/lib/custom-side-quests";
import type { UserMetadataRecord } from "@/lib/user-metadata";

export async function POST(request: Request) {
  const userId = await getMobileRequestUserId(request);
  if (!userId) return NextResponse.json({ apiVersion: 1, authenticated: false, ok: false, message: "Sign in to save custom Side Quests." }, { status: 401 });

  let payload: Record<string, unknown>;
  try { payload = await request.json() as Record<string, unknown>; } catch { return NextResponse.json({ apiVersion: 1, authenticated: true, ok: false, message: "Send JSON for the custom Side Quest." }, { status: 400 }); }

  const title = cleanText(payload.title, 80) || "Custom Side Quest";
  const summary = cleanText(payload.summary, 500);
  const config = typeof payload.config === "string" ? payload.config : "";
  const visibility = payload.visibility === "public" ? "public" : "private";
  const lifecycle = payload.lifecycle === "draft" || payload.lifecycle === "archived" ? payload.lifecycle : "published";
  const parsed = parseCustomRuleConfig(config);
  const validation = lifecycle === "published" ? validateConfig(parsed) : null;
  if (validation) return NextResponse.json({ apiVersion: 1, authenticated: true, ok: false, message: validation }, { status: 400 });

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const publicMetadata = user.publicMetadata ? user.publicMetadata as UserMetadataRecord : {};
  const privateMetadata = user.privateMetadata && typeof user.privateMetadata === "object" ? user.privateMetadata as UserMetadataRecord : {};
  const now = new Date().toISOString();
  const existing = getCustomSideQuestStore(privateMetadata, publicMetadata);
  const id = typeof payload.id === "string" && payload.id.startsWith("custom-") ? payload.id : `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const existingQuest = existing.find((item) => item.id === id);
  const badgeImageUrl = existingQuest?.badgeImageUrl ?? chooseCustomSideQuestBadge(parsed, `${id}:${config}`);
  const quest: CustomSideQuest = compactCustomSideQuest({ id, title, summary: summary || (lifecycle === "draft" ? "Draft custom Side Quest" : "Custom rule recipe"), config, visibility, lifecycle, createdAt: existingQuest?.createdAt ?? now, updatedAt: now, badgeImageUrl });
  const next = [quest, ...existing.filter((item) => item.id !== id).map(compactCustomSideQuest)].slice(0, 8);

  try {
    const saved = await saveCustomQuestStoreWithFallback(client, userId, next);
    return NextResponse.json({ apiVersion: 1, authenticated: true, ok: true, action: "save", customQuest: quest, customSideQuests: saved, message: "Custom Side Quest saved." });
  } catch (caught) {
    const message = getMetadataSaveErrorMessage(caught);
    console.error("mobile custom Side Quest save failed", { message, reason: getMetadataSaveLogReason(caught) });
    return NextResponse.json({ apiVersion: 1, authenticated: true, ok: false, message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const userId = await getMobileRequestUserId(request);
  if (!userId) return NextResponse.json({ apiVersion: 1, authenticated: false, ok: false, message: "Sign in to delete custom Side Quests." }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!id.startsWith("custom-")) return NextResponse.json({ apiVersion: 1, authenticated: true, ok: false, message: "Unknown custom Side Quest." }, { status: 400 });
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const publicMetadata = user.publicMetadata ? user.publicMetadata as UserMetadataRecord : {};
  const privateMetadata = user.privateMetadata && typeof user.privateMetadata === "object" ? user.privateMetadata as UserMetadataRecord : {};
  const next = getCustomSideQuestStore(privateMetadata, publicMetadata).filter((item) => item.id !== id).map(compactCustomSideQuest).slice(0, 8);
  const active = publicMetadata.activeChallenge && typeof publicMetadata.activeChallenge === "object" && (publicMetadata.activeChallenge as { id?: string }).id === id ? null : publicMetadata.activeChallenge;
  if (active !== publicMetadata.activeChallenge) {
    await client.users.updateUserMetadata(userId, { publicMetadata: { ...publicMetadata, activeChallenge: active }, privateMetadata: { customSideQuests: next } });
  } else {
    await saveCustomQuestStoreWithFallback(client, userId, next);
  }
  return NextResponse.json({ apiVersion: 1, authenticated: true, ok: true, action: "delete", customSideQuests: next, message: "Custom Side Quest deleted." });
}

function getCustomSideQuestStore(privateMetadata: UserMetadataRecord, publicMetadata: UserMetadataRecord) {
  const privateQuests = getCustomSideQuests(privateMetadata);
  return privateQuests.length ? privateQuests : getCustomSideQuests(publicMetadata);
}

function getMetadataSaveErrorMessage(caught: unknown) {
  const text = caught instanceof Error ? caught.message : String(caught ?? "");
  if (/metadata exceeds|metadata.*too large|exceeds the maximum allowed size|form_param_exceeds_allowed_size|too large|maximum allowed|unprocessable entity/i.test(text)) {
    return "Your Side Quest library storage is full. SQC compacted older custom Side Quest metadata; try saving again.";
  }
  return "Could not save this custom Side Quest right now.";
}

function getMetadataSaveLogReason(caught: unknown) {
  const details = caught && typeof caught === "object" ? caught as { message?: unknown; status?: unknown; clerkError?: unknown; errors?: unknown } : null;
  return JSON.stringify({
    message: details?.message ?? String(caught ?? ""),
    status: details?.status,
    clerkError: details?.clerkError,
    errors: details?.errors,
  }).slice(0, 1000);
}

async function saveCustomQuestStoreWithFallback(client: Awaited<ReturnType<typeof clerkClient>>, userId: string, quests: CustomSideQuest[]) {
  const attempts = [quests.slice(0, 8), quests.slice(0, 5), quests.slice(0, 3), quests.slice(0, 1)];
  let lastError: unknown = null;

  for (const attempt of attempts) {
    try {
      await client.users.updateUserMetadata(userId, { privateMetadata: { customSideQuests: attempt } });
      return attempt;
    } catch (caught) {
      lastError = caught;
      console.error("mobile custom Side Quest compact save retry", { count: attempt.length, bytes: JSON.stringify({ customSideQuests: attempt }).length, reason: getMetadataSaveLogReason(caught) });
    }
  }

  throw lastError;
}

function compactCustomSideQuest(quest: CustomSideQuest): CustomSideQuest {
  const parsed = parseCustomRuleConfig(quest.config);
  const compactConfig = parsed ? JSON.stringify(parsed) : quest.config.slice(0, 1200);
  return {
    id: quest.id,
    title: cleanText(quest.title, 80) || "Custom Side Quest",
    summary: cleanText(quest.summary, 220) || (quest.lifecycle === "draft" ? "Draft custom Side Quest" : "Custom rule recipe"),
    config: compactConfig,
    visibility: quest.visibility === "public" ? "public" : "private",
    lifecycle: quest.lifecycle === "draft" || quest.lifecycle === "archived" ? quest.lifecycle : "published",
    createdAt: typeof quest.createdAt === "string" ? quest.createdAt : new Date().toISOString(),
    updatedAt: typeof quest.updatedAt === "string" ? quest.updatedAt : new Date().toISOString(),
    badgeImageUrl: typeof quest.badgeImageUrl === "string" ? quest.badgeImageUrl.slice(0, 160) : null,
  };
}

function cleanText(value: unknown, max: number) { return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : ""; }
function validateConfig(config: CustomSideQuestRuleConfig | null) {
  if (!config?.blocks.length) return "Add at least one saved condition before saving.";
  if (config.blocks.length > 8) return "Custom Side Quests can use up to 8 conditions.";
  for (const block of config.blocks) {
    if (block.type === "pieceState" && block.condition === "on square" && !/^[a-h][1-8]$/.test(block.targetSquare ?? "")) return "Use real board squares like e4 or h8.";
    if (block.type === "moveSequence" && !block.sequence.trim()) return "Move sequence conditions need moves.";
    if (block.type === "openingSequence" && !block.moves.length) return "Opening sequence conditions need moves from move 1.";
  }
  return null;
}
