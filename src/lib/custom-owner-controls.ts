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
    visibility: input.lifecycle === "draft" ? "private" as const : input.visibility,
    lifecycle: input.lifecycle === "draft" || input.lifecycle === "archived" ? input.lifecycle : "published" as const,
  };
}

export function buildCustomOwnerDuplicatePayload(input: CustomOwnerSaveInput) {
  return {
    title: `${input.title} Copy`,
    summary: input.summary,
    config: input.config,
    visibility: input.visibility,
    lifecycle: "published" as const,
  };
}

export async function duplicateCustomOwnerQuest(
  input: CustomOwnerSaveInput,
  request: typeof fetch = fetch,
) {
  const response = await request("/api/mobile/custom-quests", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(buildCustomOwnerDuplicatePayload(input)),
  });
  const result = await response.json().catch(() => null) as { ok?: boolean; customQuest?: { id?: string } } | null;
  const id = result?.customQuest?.id;
  return response.ok && result?.ok === true && typeof id === "string" && id !== input.id && /^custom-[a-z0-9-]+$/i.test(id)
    ? `/custom-side-quests/${encodeURIComponent(id)}`
    : null;
}

export function getCustomOwnerDestination(payload: unknown, expectedId: string) {
  const result = payload && typeof payload === "object" ? payload as { ok?: unknown; customQuest?: { id?: unknown } } : null;
  return result?.ok === true && result.customQuest?.id === expectedId && /^custom-[a-z0-9-]+$/i.test(expectedId)
    ? `/custom-side-quests/${encodeURIComponent(expectedId)}`
    : null;
}

export function getCustomOwnerStateSavedMessage(
  name: string,
  next: Pick<CustomOwnerSaveInput, "lifecycle" | "visibility">,
) {
  if (next.lifecycle === "archived") return `${name} is archived and no longer playable.`;
  if (next.visibility === "public") return `${name} is public/shareable. Other players may see its title, goal, and Coat of Arms when it is shared.`;
  if (next.visibility === "private") return `${name} is private. Only you can manage it, but you can still use it in Multiplayer Side Quests you host.`;
  return `${name} is published and ready to play.`;
}

export async function saveCustomOwnerState(
  quest: CustomOwnerSaveInput,
  next: Pick<CustomOwnerSaveInput, "lifecycle" | "visibility">,
  request: typeof fetch = fetch,
) {
  const body = buildCustomOwnerSavePayload({ ...quest, ...next });
  const response = await request("/api/mobile/custom-quests", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => null);
  return response.ok ? getCustomOwnerDestination(result, quest.id) : null;
}

export async function deleteCustomOwnerQuest(
  id: string,
  request: typeof fetch = fetch,
) {
  if (!/^custom-[a-z0-9-]+$/i.test(id)) return null;
  const response = await request(`/api/mobile/custom-quests?id=${encodeURIComponent(id)}`, { method: "DELETE" });
  const result = await response.json().catch(() => null) as { ok?: boolean; action?: string } | null;
  return response.ok && result?.ok === true && result.action === "delete" ? "/custom-side-quests" : null;
}

export function getCustomOwnerDeleteConfirmation(active: boolean) {
  return active
    ? "This will remove it from My Custom Side Quests and clear it as your active Side Quest."
    : "This removes it from My Custom Side Quests. Existing Multiplayer Side Quests keep the version they already saved.";
}

export function getCustomOwnerMultiplayerHref(input: Pick<CustomOwnerSaveInput, "id" | "lifecycle">) {
  return input.lifecycle === "published" && /^custom-[a-z0-9-]+$/i.test(input.id)
    ? `/create-multiplayer-side-quest?quest=${encodeURIComponent(input.id)}`
    : null;
}
