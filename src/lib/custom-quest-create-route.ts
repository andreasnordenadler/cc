import { getCustomSideQuests, parseCustomRuleConfig, type CustomSideQuest, type CustomSideQuestRuleConfig } from "./custom-side-quests";
import type { UserMetadataRecord } from "./user-metadata";

export type CustomQuestCreateDependencies = {
  getAuthenticatedUserId: (request: Request) => Promise<string | null>;
  getMetadata: (id: string) => Promise<{ publicMetadata: UserMetadataRecord; privateMetadata: UserMetadataRecord }>;
  saveCustomQuests: (id: string, quests: CustomSideQuest[], privateMetadata: UserMetadataRecord) => Promise<CustomSideQuest[]>;
  now?: () => Date;
  makeId?: () => string;
  chooseBadge: () => string;
  logPersistenceError: (message: string, details: { reason: CustomQuestPersistenceErrorReason }) => void;
};

export type CustomQuestPersistenceErrorReason = "metadata_capacity" | "persistence_error";

export function classifyCustomQuestPersistenceError(caught: unknown): { message: string; reason: CustomQuestPersistenceErrorReason } {
  const text = caught instanceof Error ? caught.message : String(caught ?? "");
  if (/metadata exceeds|metadata.*too large|exceeds the maximum allowed size|form_param_exceeds_allowed_size|too large|maximum allowed|unprocessable entity/i.test(text)) {
    return { message: "Your Side Quest library is full. SQC cleaned up older saved data; please try again.", reason: "metadata_capacity" };
  }
  return { message: "Could not save this custom Side Quest right now.", reason: "persistence_error" };
}

export async function handleCustomQuestCreateRequest(request: Request, dependencies: CustomQuestCreateDependencies): Promise<Response> {
  const userId = await dependencies.getAuthenticatedUserId(request).catch(() => null);
  if (!userId) return Response.json({ apiVersion: 1, authenticated: false, ok: false, message: "Sign in to save custom Side Quests." }, { status: 401 });
  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return Response.json({ apiVersion: 1, authenticated: true, ok: false, message: "Send JSON for the custom Side Quest." }, { status: 400 });
  const input = payload as Record<string, unknown>;
  const title = cleanText(input.title, 80) || "Custom Side Quest";
  const summary = cleanText(input.summary, 500);
  const config = typeof input.config === "string" ? input.config : "";
  const visibility = input.visibility === "public" ? "public" : "private";
  const lifecycle = input.lifecycle === "draft" || input.lifecycle === "archived" ? input.lifecycle : "published";
  const validation = lifecycle === "published" ? validateConfig(parseCustomRuleConfig(config)) : null;
  if (validation) return Response.json({ apiVersion: 1, authenticated: true, ok: false, message: validation }, { status: 400 });
  try {
    const { publicMetadata, privateMetadata } = await dependencies.getMetadata(userId);
    const existingPrivate = getCustomSideQuests(privateMetadata);
    const existing = existingPrivate.length ? existingPrivate : getCustomSideQuests(publicMetadata);
    const now = (dependencies.now?.() ?? new Date()).toISOString();
    const id = typeof input.id === "string" && input.id.startsWith("custom-") ? input.id : dependencies.makeId?.() ?? `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const previous = existing.find(item => item.id === id);
    const quest = compact({ id, title, summary: summary || (lifecycle === "draft" ? "Draft Side Quest" : "Custom Side Quest"), config, visibility, lifecycle, createdAt: previous?.createdAt ?? now, updatedAt: now, badgeImageUrl: previous?.badgeImageUrl ?? dependencies.chooseBadge() });
    const next = [quest, ...existing.filter(item => item.id !== id).map(compact)].slice(0, 8);
    const saved = await dependencies.saveCustomQuests(userId, next, privateMetadata);
    return Response.json({ apiVersion: 1, authenticated: true, ok: true, action: "save", customQuest: quest, customSideQuests: saved, message: "Custom Side Quest saved." });
  } catch (caught) {
    const classified = classifyCustomQuestPersistenceError(caught);
    dependencies.logPersistenceError("mobile custom Side Quest save failed", { reason: classified.reason });
    return Response.json({ apiVersion: 1, authenticated: true, ok: false, message: classified.message }, { status: 400 });
  }
}
function compact(quest: CustomSideQuest): CustomSideQuest { const parsed = parseCustomRuleConfig(quest.config); return { id: quest.id, title: cleanText(quest.title, 80) || "Custom Side Quest", summary: cleanText(quest.summary, 220) || (quest.lifecycle === "draft" ? "Draft Side Quest" : "Custom Side Quest"), config: parsed ? JSON.stringify(parsed) : quest.config.slice(0, 1200), visibility: quest.visibility === "public" ? "public" : "private", lifecycle: quest.lifecycle === "draft" || quest.lifecycle === "archived" ? quest.lifecycle : "published", createdAt: typeof quest.createdAt === "string" ? quest.createdAt : new Date().toISOString(), updatedAt: typeof quest.updatedAt === "string" ? quest.updatedAt : new Date().toISOString(), badgeImageUrl: typeof quest.badgeImageUrl === "string" ? quest.badgeImageUrl.slice(0, 160) : null }; }
function cleanText(value: unknown, max: number) { return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : ""; }
function validateConfig(config: CustomSideQuestRuleConfig | null) { if (!config?.blocks.length) return "Add at least one saved condition before saving."; if (config.blocks.length > 8) return "Custom Side Quests can use up to 8 conditions."; for (const block of config.blocks) { if (block.type === "pieceState" && block.condition === "on square" && !/^[a-h][1-8]$/.test(block.targetSquare ?? "")) return "Use real board squares like e4 or h8."; if (block.type === "moveSequence" && !block.sequence.trim()) return "Move sequence conditions need moves."; if (block.type === "openingSequence" && !block.moves.length) return "Opening sequence conditions need moves from move 1."; } return null; }
