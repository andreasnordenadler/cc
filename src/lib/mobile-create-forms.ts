import { parseCustomRuleConfig, type CustomSideQuestRuleBlock } from "./custom-side-quests";

export type CustomEditQuestInput = {
  id: string;
  title: string;
  summary: string;
  config: string;
  visibility: "private" | "public";
  lifecycle: "draft" | "published" | "archived";
};

export type CustomTemplate = "knights-first" | "no-castle" | "queen-trade" | "win";

type CustomCreateInput = {
  title: string;
  summary: string;
  logic: "all" | "any";
  blocks: CustomSideQuestRuleBlock[];
  visibility: "private" | "public";
  lifecycle: "draft" | "published" | "archived";
};

const customBlocks: Record<CustomTemplate, CustomSideQuestRuleBlock[]> = {
  "knights-first": [{ type: "openingSequence", raw: "Nf3 Nf6 Nc3 Nc6", moves: ["Nf3", "Nf6", "Nc3", "Nc6"], anchor: "gameStart" }, { type: "gameResult", result: "win" }],
  "no-castle": [{ type: "gameResult", result: "win" }, { type: "pieceState", piece: "king", owner: "my", condition: "not moved", timing: { atGameEnd: true } }],
  "queen-trade": [
    { type: "pieceState", piece: "queen", owner: "my", condition: "gone", timing: { atGameEnd: true } },
    { type: "pieceState", piece: "queen", owner: "opponent", condition: "gone", timing: { atGameEnd: true } },
    { type: "gameResult", result: "win" },
  ],
  win: [{ type: "gameResult", result: "win" }],
};

export function getCustomTemplateBlocks(template: CustomTemplate) {
  return customBlocks[template].map((block) => structuredClone(block));
}

export function setCustomRuleBlockNegated(block: CustomSideQuestRuleBlock, negated: boolean): CustomSideQuestRuleBlock {
  const next = structuredClone(block);
  if (negated) return { ...next, negate: true };
  delete next.negate;
  return next;
}

type CustomMoveSequenceTiming = "byMove" | "atMove" | "atGameEnd";
type CustomMoveSequenceBlock = Extract<CustomSideQuestRuleBlock, { type: "moveSequence" }>;
type CustomPieceStateBlock = Extract<CustomSideQuestRuleBlock, { type: "pieceState" }>;
type CustomPieceStateTiming = "byMove" | "atMove" | "atGameEnd";

export type CustomMoveSequenceEditorState = {
  block: CustomMoveSequenceBlock;
  moveNumberInput: string;
};

export type CustomPieceStateEditorState = {
  block: CustomPieceStateBlock;
  moveNumberInput: string;
};

export type CustomConditionEditorRow = {
  id: string;
  block: CustomSideQuestRuleBlock;
  moveNumberInput: string;
};

export function getCustomConditionEditorRow(block: CustomSideQuestRuleBlock, id: string): CustomConditionEditorRow {
  const next = structuredClone(block);
  return {
    id,
    block: next,
    moveNumberInput: next.type === "moveSequence" || next.type === "pieceState" ? String(next.timing?.atMove ?? next.timing?.byMove ?? 15) : "",
  };
}

export function appendCustomConditionEditorRow(rows: CustomConditionEditorRow[], block: CustomSideQuestRuleBlock, id: string) {
  return rows.length >= 6 ? rows : [...rows, getCustomConditionEditorRow(block, id)];
}

export function duplicateCustomConditionEditorRow(rows: CustomConditionEditorRow[], index: number, id: string) {
  if (rows.length >= 6 || !rows[index]) return rows;
  const duplicate = getCustomConditionEditorRow(rows[index].block, id);
  duplicate.moveNumberInput = rows[index].moveNumberInput;
  return [...rows.slice(0, index + 1), duplicate, ...rows.slice(index + 1)];
}

export function deleteCustomConditionEditorRow(rows: CustomConditionEditorRow[], index: number) {
  return rows.filter((_, rowIndex) => rowIndex !== index);
}

function normalizeCustomMoveNumber(value: number) {
  return Math.min(Math.max(1, Math.trunc(value) || 1), 300);
}

function formatCustomMoveNumberInput(value: string) {
  const digits = value.replace(/[^0-9]/g, "").slice(0, 3);
  return digits ? String(normalizeCustomMoveNumber(Number(digits))) : "";
}

export function getCustomMoveSequenceEditorState(block: CustomMoveSequenceBlock): CustomMoveSequenceEditorState {
  return {
    block,
    moveNumberInput: String(block.timing?.atMove ?? block.timing?.byMove ?? 15),
  };
}

function normalizeCustomMoveSequence(value: string) {
  return value
    .replace(/[^a-zA-Z0-9+#=xXO\-–—.\s]/g, " ")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

function normalizeCustomOpeningSequence(value: string) {
  return value
    .replace(/\{[^}]*\}/g, " ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\$\d+/g, " ")
    .replace(/\b(?:1-0|0-1|1\/2-1\/2|\*)\b/g, " ")
    .replace(/\d+\.{1,3}/g, " ")
    .replace(/[!?]+/g, "")
    .replace(/[^a-zA-Z0-9+#=xXO\-–—.\s]/g, " ")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 240);
}

export function finalizeCustomOpeningSequenceInput(raw: string) {
  return normalizeCustomOpeningSequence(raw) || "1.e4 e5 2.f4";
}

export function updateCustomOpeningSequenceBlock(
  block: Extract<CustomSideQuestRuleBlock, { type: "openingSequence" }>,
  raw: string,
): Extract<CustomSideQuestRuleBlock, { type: "openingSequence" }> {
  const limitedRaw = raw.slice(0, 260);
  const moves = normalizeCustomOpeningSequence(limitedRaw).split(/\s+/).filter(Boolean).slice(0, 40);
  return {
    type: "openingSequence",
    raw: limitedRaw,
    moves,
    anchor: "gameStart",
    ...(block.negate === true ? { negate: true } : {}),
  };
}

export function updateCustomMoveSequenceBlock(
  block: CustomMoveSequenceBlock,
  input: { sequence: string; timing: CustomMoveSequenceTiming; moveNumber: number },
): CustomMoveSequenceBlock {
  const sequence = input.sequence.slice(0, 180);
  const moveNumber = normalizeCustomMoveNumber(input.moveNumber);
  const timing = input.timing === "byMove"
    ? { byMove: moveNumber }
    : input.timing === "atMove"
      ? { atMove: moveNumber }
      : { atGameEnd: true as const };
  return { ...block, sequence, timing };
}

export function updateCustomMoveSequenceEditor(
  state: CustomMoveSequenceEditorState,
  input: { sequence?: string; timing?: CustomMoveSequenceTiming; moveNumberInput?: string },
): CustomMoveSequenceEditorState {
  const timing = input.timing
    ?? (state.block.timing?.atMove ? "atMove" : state.block.timing?.byMove ? "byMove" : "atGameEnd");
  const moveNumberInput = input.moveNumberInput === undefined
    ? state.moveNumberInput
    : formatCustomMoveNumberInput(input.moveNumberInput);
  return {
    block: updateCustomMoveSequenceBlock(state.block, {
      sequence: input.sequence ?? state.block.sequence,
      timing,
      moveNumber: Number(moveNumberInput),
    }),
    moveNumberInput,
  };
}

export type CustomPieceIdentityChoice = "any" | "all" | "queenside" | "kingside" | `${string}-pawn`;

export function updateCustomPieceIdentityChoice(
  block: CustomPieceStateBlock,
  choice: CustomPieceIdentityChoice,
): CustomPieceStateBlock {
  const maxAvailable = block.piece === "pawn" ? 8 : block.piece === "king" || block.piece === "queen" ? 1 : 2;
  const identityOptions = block.piece === "pawn"
    ? ["any", ..."abcdefgh".split("").map((file) => `${file}-pawn`)]
    : block.piece === "rook" || block.piece === "bishop" || block.piece === "knight"
      ? ["any", "queenside", "kingside"]
      : ["original"];
  const identity = choice === "all" ? "any" : identityOptions.includes(choice) ? choice : identityOptions[0];
  const quantifier = choice === "all" ? "all" : "any one";
  return {
    ...block,
    selector: { ...block.selector, quantifier, count: quantifier === "all" ? maxAvailable : 1, maxAvailable, identity },
  };
}

export function getCustomPieceIdentityChoices(piece: CustomPieceStateBlock["piece"]): Array<{ id: CustomPieceIdentityChoice; label: string; helper: string }> {
  if (piece === "pawn") return [
    { id: "any" as const, label: "Any pawn", helper: "One pawn is enough." },
    { id: "all" as const, label: "All pawns", helper: "Every pawn for that side." },
    ..."abcdefgh".split("").map((file) => ({ id: `${file}-pawn` as `${string}-pawn`, label: `${file}-pawn`, helper: "A specific starting pawn." })),
  ];
  if (piece === "rook" || piece === "bishop" || piece === "knight") return [
    { id: "any" as const, label: `Either ${piece}`, helper: "One of the two is enough." },
    { id: "all" as const, label: `Both ${piece}s`, helper: "Both starting pieces must match." },
    { id: "queenside" as const, label: `Queenside ${piece}`, helper: "The starting piece on the queen side." },
    { id: "kingside" as const, label: `Kingside ${piece}`, helper: "The starting piece on the king side." },
  ];
  return [];
}

export function updateCustomPieceStateBlock(
  block: CustomPieceStateBlock,
  input: Partial<Pick<CustomPieceStateBlock, "piece" | "owner" | "condition">> & {
    targetSquare?: string;
    timing?: CustomPieceStateTiming;
    moveNumber?: number;
  },
): CustomPieceStateBlock {
  const piece = input.piece ?? block.piece;
  const maxAvailable = piece === "pawn" ? 8 : piece === "king" || piece === "queen" ? 1 : 2;
  const previousSelector = block.selector;
  const quantifier = maxAvailable === 1 ? "any one" : previousSelector?.quantifier ?? "any one";
  const count = Math.min(previousSelector?.count ?? 1, maxAvailable);
  const identityOptions = piece === "pawn"
    ? ["any", ..."abcdefgh".split("").map((file) => `${file}-pawn`)]
    : piece === "rook" || piece === "bishop" || piece === "knight"
      ? ["any", "queenside", "kingside"]
      : ["original"];
  const identity = identityOptions.includes(previousSelector?.identity ?? "")
    ? previousSelector?.identity
    : identityOptions[0];
  const condition = input.condition ?? block.condition;
  const timingChoice = input.timing
    ?? (block.timing?.atMove ? "atMove" : block.timing?.byMove ? "byMove" : "atGameEnd");
  const moveNumber = normalizeCustomMoveNumber(input.moveNumber ?? block.timing?.atMove ?? block.timing?.byMove ?? 15);
  const timing = timingChoice === "byMove"
    ? { byMove: moveNumber }
    : timingChoice === "atMove"
      ? { atMove: moveNumber }
      : { atGameEnd: true as const };
  const targetSquare = condition === "on square"
    ? /^[a-h][1-8]$/i.test(input.targetSquare ?? block.targetSquare ?? "")
      ? (input.targetSquare ?? block.targetSquare ?? "e4").toLowerCase()
      : "e4"
    : null;

  return {
    ...block,
    piece,
    owner: input.owner ?? block.owner,
    selector: { ...previousSelector, quantifier, count, maxAvailable, identity },
    condition,
    targetSquare,
    timing,
  };
}

export function updateCustomPieceStateEditor(
  state: CustomPieceStateEditorState,
  input: Parameters<typeof updateCustomPieceStateBlock>[1] & { moveNumberInput?: string },
): CustomPieceStateEditorState {
  const moveNumberInput = input.moveNumberInput === undefined
    ? state.moveNumberInput
    : formatCustomMoveNumberInput(input.moveNumberInput);
  return {
    block: updateCustomPieceStateBlock(state.block, { ...input, moveNumber: Number(moveNumberInput) }),
    moveNumberInput,
  };
}

export function getCustomConditionRowKey(index: number) {
  return `custom-condition-${index}`;
}

export function getCustomRuleBlockChoiceId(block: CustomSideQuestRuleBlock) {
  if (block.type === "moveSequence") return "move-sequence";
  const comparable = JSON.stringify(setCustomRuleBlockNegated(block, false));
  const presets: Array<[string, CustomSideQuestRuleBlock]> = [
    ["win", { type: "gameResult", result: "win" }],
    ["draw", { type: "gameResult", result: "draw" }],
    ["lose", { type: "gameResult", result: "lose" }],
    ["queen-gone", { type: "pieceState", piece: "queen", owner: "my", condition: "gone", timing: { atGameEnd: true } }],
    ["king-still", { type: "pieceState", piece: "king", owner: "my", condition: "not moved", timing: { atGameEnd: true } }],
    ["knights-first", { type: "openingSequence", raw: "Nf3 Nf6 Nc3 Nc6", moves: ["Nf3", "Nf6", "Nc3", "Nc6"], anchor: "gameStart" }],
  ];
  return presets.find(([, preset]) => JSON.stringify(preset) === comparable)?.[0]
    ?? (block.type === "pieceState" && block.owner !== "either" ? "piece-state" : "advanced");
}

export function describeCustomRuleBlock(block: CustomSideQuestRuleBlock) {
  if (block.type === "gameResult") return `${block.negate ? "Do not " : ""}${block.result === "lose" ? "finish with a loss" : `${block.result} the game`}.`;
  if (block.type === "openingSequence") return `${block.negate ? "Do not play" : "Play"} ${block.moves.join(" ")} from move 1.`;
  if (block.type === "moveSequence") return `${block.negate ? "Do not play" : "Play"} the sequence ${block.sequence}.`;
  if (block.owner === "either" && block.selector?.quantifier === "all" && block.piece === "queen" && block.condition === "gone") return `${block.negate ? "Both queens must not be gone" : "Both queens are gone"} at game end.`;
  const owner = block.owner === "my" ? "Your" : block.owner === "opponent" ? "Your opponent's" : "Either player's";
  const timing = block.timing?.byMove ? ` by move ${block.timing.byMove}` : block.timing?.atMove ? ` at move ${block.timing.atMove}` : " at game end";
  return `${block.negate ? "It must not be true that " : ""}${owner} ${block.piece} is ${block.condition}${block.targetSquare ? ` ${block.targetSquare}` : ""}${timing}.`;
}

function normalizeCustomRuleBlock(block: CustomSideQuestRuleBlock): CustomSideQuestRuleBlock {
  if (block.type === "moveSequence") return { ...block, sequence: normalizeCustomMoveSequence(block.sequence) };
  if (block.type === "openingSequence") return updateCustomOpeningSequenceBlock(block, finalizeCustomOpeningSequenceInput(block.raw ?? block.moves.join(" ")));
  return block;
}

export function buildCustomCreatePayload(input: CustomCreateInput) {
  const title = input.title.replace(/\s+/g, " ").trim();
  const summary = input.summary.replace(/\s+/g, " ").trim();
  if (!title) throw new Error("Name this custom Side Quest before saving.");
  if (!input.blocks.length && input.lifecycle === "published") throw new Error("Choose at least one condition before saving.");
  if (input.blocks.some((block) => block.type === "moveSequence" && !normalizeCustomMoveSequence(block.sequence))) throw new Error("Add at least one algebraic move to the move sequence.");
  if (input.blocks.some((block) => block.type === "openingSequence" && !updateCustomOpeningSequenceBlock(block, block.raw ?? block.moves.join(" ")).moves.length)) throw new Error("Add an opening line from move 1, for example 1.e4 e5 2.f4.");
  if (input.blocks.length > 6) throw new Error("Custom Side Quests can use up to 6 conditions.");
  const blocks = input.blocks.map(normalizeCustomRuleBlock);
  return {
    title: title.slice(0, 80),
    summary: summary.slice(0, 500),
    config: JSON.stringify({ version: 2, logic: input.logic === "any" ? "any" : "all", blocks }),
    visibility: input.lifecycle === "published" ? input.visibility : "private",
    lifecycle: input.lifecycle,
  };
}

export function buildCustomEditConfig(originalConfig: string, logic: "all" | "any", blocks: CustomSideQuestRuleBlock[]) {
  let original: Record<string, unknown>;
  try {
    const parsed = JSON.parse(originalConfig);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) || !Array.isArray(parsed.blocks)) throw new Error();
    original = parsed as Record<string, unknown>;
  } catch {
    throw new Error("This Side Quest has invalid saved rules.");
  }
  if (blocks.length > 6) throw new Error("Custom Side Quests can use up to 6 conditions.");
  const normalizedBlocks = blocks.map(normalizeCustomRuleBlock);
  return JSON.stringify({ ...original, logic: logic === "any" ? "any" : "all", blocks: normalizedBlocks });
}

export function getCustomCreateDestination(payload: unknown) {
  const result = payload && typeof payload === "object" ? payload as { ok?: unknown; customQuest?: { id?: unknown } } : null;
  const id = result?.ok === true && typeof result.customQuest?.id === "string" ? result.customQuest.id : "";
  return /^custom-[a-z0-9-]+$/i.test(id) ? `/custom-side-quests?saved=${encodeURIComponent(id)}` : null;
}

export function getCustomEditFormState(quest: CustomEditQuestInput) {
  if (!/^custom-[a-z0-9-]+$/i.test(quest.id)) return null;
  const config = parseCustomRuleConfig(quest.config);
  if (!config || config.blocks.length > 8) return null;
  return {
    id: quest.id,
    title: quest.title,
    summary: quest.summary,
    logic: config.logic,
    blocks: config.blocks,
    visibility: quest.visibility,
    lifecycle: quest.lifecycle,
  };
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

export function getMultiplayerLocalDateTimeDefaults(nowIso: string, timezoneOffsetMinutes = new Date(nowIso).getTimezoneOffset()) {
  const now = new Date(nowIso);
  if (!Number.isFinite(now.getTime())) throw new Error("A valid stable timestamp is required.");
  now.setSeconds(0, 0);
  const localDateTime = (date: Date) => new Date(date.getTime() - timezoneOffsetMinutes * 60_000).toISOString().slice(0, 16);
  const end = new Date(now);
  end.setDate(end.getDate() + 7);
  return { startAt: localDateTime(now), endAt: localDateTime(end) };
}

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
