type CustomTemplate = "knights-first" | "no-castle" | "queen-trade" | "win";

type CustomCreateInput = {
  title: string;
  summary: string;
  template: CustomTemplate | "";
  visibility: "private" | "public";
  lifecycle: "draft" | "published";
};

const customBlocks = {
  "knights-first": [{ type: "openingSequence", raw: "Nf3 Nf6 Nc3 Nc6", moves: ["Nf3", "Nf6", "Nc3", "Nc6"], anchor: "gameStart" }, { type: "gameResult", result: "win" }],
  "no-castle": [{ type: "gameResult", result: "win" }, { type: "pieceState", piece: "king", owner: "my", condition: "not moved" }],
  "queen-trade": [{ type: "pieceState", piece: "queen", owner: "either", condition: "gone" }, { type: "gameResult", result: "win" }],
  win: [{ type: "gameResult", result: "win" }],
} as const;

export function buildCustomCreatePayload(input: CustomCreateInput) {
  const title = input.title.replace(/\s+/g, " ").trim();
  const summary = input.summary.replace(/\s+/g, " ").trim();
  if (!title) throw new Error("Name this custom Side Quest before saving.");
  if (!input.template) throw new Error("Choose at least one condition before saving.");
  return {
    title: title.slice(0, 80),
    summary: summary.slice(0, 500),
    config: JSON.stringify({ version: 2, logic: "all", blocks: customBlocks[input.template] }),
    visibility: input.visibility,
    lifecycle: input.lifecycle,
  };
}

export function getCustomCreateDestination(payload: unknown) {
  const result = payload && typeof payload === "object" ? payload as { ok?: unknown; customQuest?: { id?: unknown } } : null;
  const id = result?.ok === true && typeof result.customQuest?.id === "string" ? result.customQuest.id : "";
  return /^custom-[a-z0-9-]+$/i.test(id) ? `/custom-side-quests?saved=${encodeURIComponent(id)}` : null;
}

type MultiplayerCreateInput = {
  name: string;
  inviteCopy: string;
  inviteMode: string;
  inviteKey?: string;
  questIds: string[];
  providerMode: string;
  startAt: string;
  endAt: string;
  rules: Record<string, string>;
};

export function buildMultiplayerCreatePayload(input: MultiplayerCreateInput) {
  const name = input.name.replace(/\s+/g, " ").trim();
  if (!name) throw new Error("Name the Multiplayer Side Quest before creating.");
  const questIds = Array.from(new Set(input.questIds.filter((id) => typeof id === "string" && /^[a-z0-9_-]+$/i.test(id)))).slice(0, 4);
  if (!questIds.length) throw new Error("Choose at least one Side Quest before creating.");
  if (!["public", "unlisted-link", "private-key"].includes(input.inviteMode)) throw new Error("Choose a supported access setting.");
  const inviteKey = (input.inviteKey ?? "").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40);
  if (input.inviteMode === "private-key" && !inviteKey) throw new Error("Add an invite code for private access.");
  if (!["both", "lichess", "chesscom"].includes(input.providerMode)) throw new Error("Choose a supported game provider.");
  const start = Date.parse(input.startAt);
  const end = Date.parse(input.endAt);
  if (!Number.isFinite(start) || !Number.isFinite(end)) throw new Error("Choose a valid start and end time.");
  if (end <= start) throw new Error("The end time must be after the start time.");
  return {
    name: name.slice(0, 54),
    inviteCopy: input.inviteCopy.replace(/\s+/g, " ").trim().slice(0, 260),
    inviteMode: input.inviteMode,
    ...(input.inviteMode === "private-key" ? { inviteKey } : {}),
    questIds,
    providerMode: input.providerMode,
    startAt: new Date(start).toISOString(),
    endAt: new Date(end).toISOString(),
    rules: input.rules,
  };
}

export function getMultiplayerCreateDestination(payload: unknown) {
  const result = payload && typeof payload === "object" ? payload as { ok?: unknown; id?: unknown; href?: unknown } : null;
  if (result?.ok !== true || typeof result.id !== "string" || !/^[a-z0-9_-]+$/i.test(result.id) || typeof result.href !== "string") return null;
  const escapedId = result.id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^/groupquests/${escapedId}(?:\\?accepted=1)?$`).test(result.href) ? result.href : null;
}

const allowedClientMessages = [
  /add at least one/i,
  /choose at least one/i,
  /must be published/i,
  /needs a launch-ready/i,
  /only official/i,
  /invite code/i,
];

export function getCreateErrorMessage(status: number, payload: unknown) {
  if (status === 401) return "Sign in to create a Side Quest.";
  const result = payload && typeof payload === "object" ? payload as { error?: unknown; message?: unknown } : null;
  const candidate = typeof result?.message === "string" ? result.message : typeof result?.error === "string" ? result.error : "";
  if (status >= 400 && status < 500 && allowedClientMessages.some((pattern) => pattern.test(candidate))) return candidate.slice(0, 240);
  return "Could not create this Side Quest right now. Please try again.";
}
