import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getMobileRequestUserId } from "@/lib/mobile-auth";
import { getCustomSideQuests, parseCustomRuleConfig, type CustomSideQuest, type CustomSideQuestRuleConfig } from "@/lib/custom-side-quests";
import type { UserMetadataRecord } from "@/lib/user-metadata";

export async function POST(request: Request) {
  const userId = await getMobileRequestUserId(request);
  if (!userId) return NextResponse.json({ apiVersion: 1, authenticated: false, ok: false, message: "Sign in to save custom Side Quests." }, { status: 401 });

  let payload: Record<string, unknown>;
  try { payload = await request.json() as Record<string, unknown>; } catch { return NextResponse.json({ apiVersion: 1, authenticated: true, ok: false, message: "Send JSON for the custom Side Quest." }, { status: 400 }); }

  const title = cleanText(payload.title, 80) || "Custom Side Quest";
  const summary = cleanText(payload.summary, 500);
  const config = typeof payload.config === "string" ? payload.config : "";
  const parsed = parseCustomRuleConfig(config);
  const validation = validateConfig(parsed);
  if (validation) return NextResponse.json({ apiVersion: 1, authenticated: true, ok: false, message: validation }, { status: 400 });

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const metadata = user.publicMetadata ? user.publicMetadata as UserMetadataRecord : {};
  const now = new Date().toISOString();
  const existing = getCustomSideQuests(metadata);
  const id = typeof payload.id === "string" && payload.id.startsWith("custom-") ? payload.id : `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const quest: CustomSideQuest = { id, title, summary: summary || "Custom rule recipe", config, createdAt: existing.find((item) => item.id === id)?.createdAt ?? now, updatedAt: now };
  const next = [quest, ...existing.filter((item) => item.id !== id)].slice(0, 20);
  await client.users.updateUserMetadata(userId, { publicMetadata: { ...metadata, customSideQuests: next } });
  return NextResponse.json({ apiVersion: 1, authenticated: true, ok: true, action: "save", customQuest: quest, customSideQuests: next, message: "Custom Side Quest saved." });
}

export async function DELETE(request: Request) {
  const userId = await getMobileRequestUserId(request);
  if (!userId) return NextResponse.json({ apiVersion: 1, authenticated: false, ok: false, message: "Sign in to delete custom Side Quests." }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!id.startsWith("custom-")) return NextResponse.json({ apiVersion: 1, authenticated: true, ok: false, message: "Unknown custom Side Quest." }, { status: 400 });
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const metadata = user.publicMetadata ? user.publicMetadata as UserMetadataRecord : {};
  const next = getCustomSideQuests(metadata).filter((item) => item.id !== id);
  const active = metadata.activeChallenge && typeof metadata.activeChallenge === "object" && (metadata.activeChallenge as { id?: string }).id === id ? null : metadata.activeChallenge;
  await client.users.updateUserMetadata(userId, { publicMetadata: { ...metadata, customSideQuests: next, activeChallenge: active } });
  return NextResponse.json({ apiVersion: 1, authenticated: true, ok: true, action: "delete", customSideQuests: next, message: "Custom Side Quest deleted." });
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
