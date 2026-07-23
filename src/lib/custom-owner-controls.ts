import { parseCustomRuleConfig } from "./custom-side-quests";

export type CustomOwnerSaveInput = {
  id: string;
  title: string;
  summary: string;
  config: string;
  visibility: "private" | "public";
  lifecycle: "draft" | "published" | "archived";
};

export function buildCustomOwnerSavePayload(input: CustomOwnerSaveInput) {
  if (!/^custom-[a-z0-9-]+$/i.test(input.id)) throw new Error("Unknown custom Side Quest.");
  const title = input.title.replace(/\s+/g, " ").trim();
  if (!title) throw new Error("Name this custom Side Quest before saving.");
  if (!parseCustomRuleConfig(input.config)) throw new Error("This Side Quest has invalid saved rules.");
  return {
    id: input.id,
    title: title.slice(0, 80),
    summary: input.summary.replace(/\s+/g, " ").trim().slice(0, 500),
    config: input.config,
    visibility: input.lifecycle === "published" && input.visibility === "public" ? "public" as const : "private" as const,
    lifecycle: input.lifecycle === "draft" || input.lifecycle === "archived" ? input.lifecycle : "published" as const,
  };
}

export function getCustomOwnerDestination(payload: unknown, expectedId: string) {
  const result = payload && typeof payload === "object" ? payload as { ok?: unknown; customQuest?: { id?: unknown } } : null;
  return result?.ok === true && result.customQuest?.id === expectedId && /^custom-[a-z0-9-]+$/i.test(expectedId)
    ? `/custom-side-quests/${encodeURIComponent(expectedId)}`
    : null;
}

export function getCustomOwnerMultiplayerHref(input: Pick<CustomOwnerSaveInput, "id" | "lifecycle">) {
  return input.lifecycle === "published" && /^custom-[a-z0-9-]+$/i.test(input.id)
    ? `/create-multiplayer-side-quest?quest=${encodeURIComponent(input.id)}`
    : null;
}
