import { parseCustomRuleConfig, type CustomSideQuestRuleBlock } from "@/lib/custom-side-quests";

export const LOCAL_CUSTOM_DRAFTS_STORAGE_KEY = "sqc.local-custom-drafts.v1";
export const LOCAL_CUSTOM_DRAFT_LIMIT = 6;

type DraftStorage = Pick<Storage, "getItem" | "setItem">;

export type LocalCustomDraft = {
  id: string;
  title: string;
  summary: string;
  config: string;
  lifecycle: "draft";
  visibility: "private";
  createdAt: string;
  updatedAt: string;
};

export function readLocalCustomDrafts(storage: Pick<DraftStorage, "getItem">): LocalCustomDraft[] {
  try {
    const parsed = JSON.parse(storage.getItem(LOCAL_CUSTOM_DRAFTS_STORAGE_KEY) ?? "[]") as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is LocalCustomDraft => {
      if (!entry || typeof entry !== "object") return false;
      const draft = entry as Partial<LocalCustomDraft>;
      return typeof draft.id === "string"
        && draft.id.startsWith("local-custom-")
        && typeof draft.title === "string"
        && typeof draft.summary === "string"
        && typeof draft.config === "string"
        && draft.lifecycle === "draft"
        && draft.visibility === "private"
        && typeof draft.createdAt === "string"
        && typeof draft.updatedAt === "string";
    }).slice(0, LOCAL_CUSTOM_DRAFT_LIMIT);
  } catch {
    return [];
  }
}

export function getLocalCustomDraftFormState(storage: Pick<DraftStorage, "getItem">, id: string): {
  id: string;
  title: string;
  summary: string;
  logic: "all" | "any";
  blocks: CustomSideQuestRuleBlock[];
} | null {
  const draft = readLocalCustomDrafts(storage).find((entry) => entry.id === id);
  if (!draft) return null;
  const config = parseCustomRuleConfig(draft.config);
  if (!config) return null;
  return { id: draft.id, title: draft.title, summary: draft.summary, logic: config.logic, blocks: config.blocks };
}

export function getLocalCustomDraftEditHref(id: string) {
  return `/create-custom-side-quest?draft=${encodeURIComponent(id)}`;
}

export function getLocalCustomDraftIdFromSearch(search: string) {
  const id = new URLSearchParams(search).get("draft");
  return id?.startsWith("local-custom-") ? id : null;
}

export function removeLocalCustomDraft(storage: DraftStorage, id: string) {
  const prior = readLocalCustomDrafts(storage);
  const next = prior.filter((draft) => draft.id !== id);
  if (next.length === prior.length) return false;
  storage.setItem(LOCAL_CUSTOM_DRAFTS_STORAGE_KEY, JSON.stringify(next));
  return true;
}

export function tryRemoveLocalCustomDraft(storage: DraftStorage, id: string) {
  try {
    return removeLocalCustomDraft(storage, id);
  } catch {
    return false;
  }
}

export function saveLocalCustomDraft(
  storage: DraftStorage,
  input: { id: string; title: string; summary: string; config: string; now: string },
): LocalCustomDraft {
  const prior = readLocalCustomDrafts(storage);
  const existing = prior.find((entry) => entry.id === input.id);
  const draft: LocalCustomDraft = {
    id: input.id,
    title: input.title.trim(),
    summary: input.summary.trim(),
    config: input.config,
    lifecycle: "draft",
    visibility: "private",
    createdAt: existing?.createdAt ?? input.now,
    updatedAt: input.now,
  };
  const remaining = prior.filter((entry) => entry.id !== draft.id);
  storage.setItem(LOCAL_CUSTOM_DRAFTS_STORAGE_KEY, JSON.stringify([draft, ...remaining].slice(0, LOCAL_CUSTOM_DRAFT_LIMIT)));
  return draft;
}
