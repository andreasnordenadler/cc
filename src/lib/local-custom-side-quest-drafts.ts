const STORAGE_KEY = "sqc.localCustomSideQuestDrafts.v1";
const MAX_LOCAL_DRAFTS = 6;

type DraftStorage = Pick<Storage, "getItem" | "setItem">;

export type LocalCustomSideQuestDraft = {
  id: string;
  title: string;
  summary: string;
  config: string;
  visibility: "private";
  lifecycle: "draft" | "published";
  savedAt: string;
};

export type LocalCustomSideQuestDraftInput = Omit<LocalCustomSideQuestDraft, "visibility">;

function isLocalDraft(value: unknown): value is LocalCustomSideQuestDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Partial<LocalCustomSideQuestDraft>;
  return typeof draft.id === "string"
    && draft.id.startsWith("local-")
    && typeof draft.title === "string"
    && Boolean(draft.title.trim())
    && typeof draft.summary === "string"
    && typeof draft.config === "string"
    && draft.visibility === "private"
    && (draft.lifecycle === "draft" || draft.lifecycle === "published")
    && typeof draft.savedAt === "string"
    && Number.isFinite(Date.parse(draft.savedAt));
}

export function loadLocalCustomSideQuestDrafts(storage: Pick<DraftStorage, "getItem">): LocalCustomSideQuestDraft[] {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isLocalDraft).slice(0, MAX_LOCAL_DRAFTS);
  } catch {
    return [];
  }
}

export function saveLocalCustomSideQuestDraft(storage: DraftStorage, input: LocalCustomSideQuestDraftInput) {
  const draft: LocalCustomSideQuestDraft = { ...input, visibility: "private" };
  if (!isLocalDraft(draft)) throw new Error("Local custom Side Quest draft is invalid.");
  const current = loadLocalCustomSideQuestDrafts(storage).filter((item) => item.id !== draft.id);
  const next = [draft, ...current].slice(0, MAX_LOCAL_DRAFTS);
  storage.setItem(STORAGE_KEY, JSON.stringify(next));
  return draft;
}
